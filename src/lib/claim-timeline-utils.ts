import type { ClaimStatusHistoryItem } from '@/types';
import type { TimelineStep } from '@/components/insurer/claim-timeline';
import { claimStatusLabel } from '@/lib/insurer-status';
import { formatDate } from '@/lib/utils';

const TIMELINE_STEP_LABELS: Record<string, string> = {
  SUBMITTED: 'Claim submitted',
  UNDER_REVIEW: 'Under review',
  INFORMATION_REQUIRED: 'Information requested',
  INFO_REQUESTED: 'Information requested',
  APPROVED: 'Claim approved',
  REJECTED: 'Claim rejected',
  CANCELLED: 'Claim cancelled',
  PAYMENT_PROCESSING: 'Payment processing',
  CLOSED: 'Claim closed',
};

function timelineLabel(status: string, backendLabel?: string | null): string {
  if (backendLabel && backendLabel !== status) return backendLabel;
  return TIMELINE_STEP_LABELS[status] ?? claimStatusLabel(status);
}

function stepStatus(
  index: number,
  currentIndex: number
): TimelineStep['status'] {
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return 'pending';
}

/** Map backend statusHistory to timeline steps; falls back to single current status. */
export function buildClaimTimeline(
  statusHistory: ClaimStatusHistoryItem[] | undefined,
  currentStatus: string,
  submittedAt?: string
): TimelineStep[] {
  if (statusHistory && statusHistory.length > 0) {
    const currentIndex = statusHistory.length - 1;
    return statusHistory.map((item, index) => ({
      id: `${item.status}-${index}`,
      label: timelineLabel(item.status, item.label),
      description: item.note,
      date: item.occurredAt ? formatDate(item.occurredAt) : undefined,
      status: stepStatus(index, currentIndex),
    }));
  }

  return [
    {
      id: 'submitted',
      label: TIMELINE_STEP_LABELS.SUBMITTED,
      description: 'Your claim has been received.',
      date: submittedAt ? formatDate(submittedAt) : undefined,
      status: 'done',
    },
    {
      id: 'review',
      label: TIMELINE_STEP_LABELS.UNDER_REVIEW,
      description: 'An adjuster is reviewing your documents.',
      status:
        currentStatus === 'SUBMITTED'
          ? 'current'
          : ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'INFO_REQUESTED', 'INFORMATION_REQUIRED'].includes(
                currentStatus
              )
            ? 'done'
            : 'pending',
    },
    {
      id: 'decision',
      label: 'Decision',
      description:
        currentStatus === 'APPROVED'
          ? 'Claim approved for payout.'
          : currentStatus === 'REJECTED'
            ? 'Claim was rejected.'
            : currentStatus === 'INFO_REQUESTED' || currentStatus === 'INFORMATION_REQUIRED'
              ? 'Additional information requested.'
              : 'Awaiting final decision.',
      status:
        currentStatus === 'APPROVED' || currentStatus === 'REJECTED'
          ? 'done'
          : ['UNDER_REVIEW', 'INFO_REQUESTED', 'INFORMATION_REQUIRED'].includes(currentStatus)
            ? 'current'
            : 'pending',
    },
  ];
}

const DECISION_STATUSES = new Set(['APPROVED', 'REJECTED', 'INFO_REQUESTED', 'INFORMATION_REQUIRED']);

/** Latest insurer reason shown to the citizen on detail views. */
export function getLatestDecisionNote(
  statusHistory: ClaimStatusHistoryItem[] | undefined,
  currentStatus: string
): string | undefined {
  if (!statusHistory?.length) return undefined;
  const matching = statusHistory.filter(
    (item) => DECISION_STATUSES.has(item.status) && item.note?.trim()
  );
  if (matching.length > 0) {
    return matching[matching.length - 1].note?.trim();
  }
  if (DECISION_STATUSES.has(currentStatus)) {
    const latest = statusHistory[statusHistory.length - 1];
    return latest.note?.trim() || undefined;
  }
  return undefined;
}
