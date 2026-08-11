import { apiClient } from './client';
import {
  coerceClaimDocumentContentUrl,
  isMinioStorageUrl,
  resolveDocumentFetchPath,
} from '@/lib/document-content-url';

export interface ClaimDocument {
  id: string;
  claimId: string;
  documentType: string;
  mimeType: string;
  sizeBytes: number;
  fileName: string;
  contentUrl: string;
  createdAt: string;
}

function mapClaimDocument(raw: Record<string, unknown>): ClaimDocument {
  const id = String(raw.id ?? '');
  const claimId = String(raw.claimId ?? '');
  const legacyUrl = String(raw.contentUrl ?? raw.downloadUrl ?? raw.url ?? '');
  const contentUrl = coerceClaimDocumentContentUrl(legacyUrl, claimId, id);

  return {
    id,
    claimId,
    documentType: String(raw.documentType ?? ''),
    mimeType: String(raw.mimeType ?? ''),
    sizeBytes: Number(raw.sizeBytes ?? 0),
    fileName: String(raw.fileName ?? 'document'),
    contentUrl,
    createdAt: String(raw.createdAt ?? ''),
  };
}

/** Multipart upload through the API (MinIO proxy) — same pattern as profile pictures. */
export async function uploadClaimEvidence(claimId: string, files: File[]): Promise<void> {
  if (files.length === 0) {
    return;
  }
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
  }
  await apiClient.post(`/claims/${claimId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function listClaimDocuments(claimId: string): Promise<ClaimDocument[]> {
  const { data } = await apiClient.get<Record<string, unknown>[]>(`/claims/${claimId}/documents`);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((row) => mapClaimDocument({ ...row, claimId: row.claimId ?? claimId }));
}

/** Fetch document bytes via authenticated API proxy. */
export async function fetchDocumentBlob(
  contentUrl: string,
  claimId?: string,
  documentId?: string
): Promise<Blob> {
  const normalized =
    claimId && documentId
      ? coerceClaimDocumentContentUrl(contentUrl, claimId, documentId)
      : isMinioStorageUrl(contentUrl)
        ? (() => {
            throw new Error('Direct MinIO document URLs are not allowed');
          })()
        : contentUrl;
  const path = resolveDocumentFetchPath(normalized);
  const { data } = await apiClient.get<Blob>(path, { responseType: 'blob' });
  return data;
}

/** Open a document in a new tab (PDF/images) using authenticated blob fetch. */
export async function openDocumentContent(
  contentUrl: string,
  fileName?: string,
  claimId?: string,
  documentId?: string
): Promise<void> {
  const blob = await fetchDocumentBlob(contentUrl, claimId, documentId);
  const objectUrl = URL.createObjectURL(blob);
  const isPdf = blob.type === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName ?? 'document';
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
