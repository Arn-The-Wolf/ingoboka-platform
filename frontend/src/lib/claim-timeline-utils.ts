import type { ClaimStatusHistoryItem } from '@/types';
import type { TimelineStep } from '@/components/insurer/claim-timeline';
import { formatDate } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Claim submitted',
  UNDER_REVIEW: 'Under review',
  INFORMATION_REQUIRED: 'Information requested',
  APPROVED: 'Claim approved',
  REJECTED: 'Claim rejected',
  PAYMENT_PROCESSING: 'Payment processing',
  CLOSED: 'Claim closed',
};

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
      label: item.label || STATUS_LABELS[item.status] || item.status,
      description: item.note,
      date: item.occurredAt ? formatDate(item.occurredAt) : undefined,
      status: stepStatus(index, currentIndex),
    }));
  }

  return [
    {
      id: 'submitted',
      label: STATUS_LABELS.SUBMITTED,
      description: 'Your claim has been received.',
      date: submittedAt ? formatDate(submittedAt) : undefined,
      status: 'done',
    },
    {
      id: 'review',
      label: STATUS_LABELS.UNDER_REVIEW,
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
