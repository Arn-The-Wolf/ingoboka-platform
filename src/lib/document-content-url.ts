/** API proxy paths for stored documents (streamed with Bearer auth — no direct MinIO). */
export const DOCUMENT_CONTENT_PATH = '/documents/';
export const CLAIM_DOCUMENT_CONTENT_PATH = '/claims/';

export function isApiDocumentContentUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('/content') && (url.includes(DOCUMENT_CONTENT_PATH) || url.includes('/documents/'));
}

/** True when the URL targets MinIO or another Docker-internal storage host. */
export function isMinioStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('://minio:') ||
    lower.includes('://minio/') ||
    lower.startsWith('http://minio') ||
    lower.startsWith('https://minio') ||
    lower.includes(':9000/ingoboka-documents') ||
    lower.includes('://localhost:9000') ||
    lower.includes('://127.0.0.1:9000')
  );
}

export function buildClaimDocumentContentPath(claimId: string, documentId: string): string {
  return `/claims/${claimId}/documents/${documentId}/content`;
}

/**
 * Normalize any claim-document URL to the authenticated API content proxy.
 * Rewrites legacy MinIO presigned URLs and prefers contentUrl over downloadUrl/url.
 */
export function coerceClaimDocumentContentUrl(
  raw: string | null | undefined,
  claimId: string,
  documentId: string
): string {
  const apiPath = buildClaimDocumentContentPath(claimId, documentId);
  if (!raw || isMinioStorageUrl(raw)) {
    return apiPath;
  }
  if (isApiDocumentContentUrl(raw)) {
    return resolveDocumentFetchPath(raw);
  }
  return apiPath;
}

/** Resolve a document content URL for authenticated blob fetch (relative or absolute). */
export function resolveDocumentFetchPath(url: string): string {
  if (isMinioStorageUrl(url)) {
    throw new Error('Direct MinIO document URLs are not allowed — use the API content proxy');
  }
  const markers = ['/claims/', '/documents/'];
  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      return url.slice(idx);
    }
  }
  return url;
}
