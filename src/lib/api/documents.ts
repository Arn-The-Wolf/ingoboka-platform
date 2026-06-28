import { apiClient } from './client';

interface UploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  expiresInMinutes: number;
}

async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Presigned MinIO upload + register + attach — matches Rodin DocumentController + ClaimController. */
export async function uploadClaimEvidence(claimId: string, files: File[]): Promise<void> {
  for (const file of files) {
    const mimeType = file.type || 'application/octet-stream';
    const { data: upload } = await apiClient.post<UploadUrlResponse>(
      '/documents/upload-url',
      {},
      { params: { documentType: 'CLAIM_EVIDENCE', mimeType } }
    );

    const putResponse = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: file,
    });
    if (!putResponse.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }

    const checksum = await sha256Hex(file);
    await apiClient.post('/claims/' + claimId + '/documents', {
      documentType: 'CLAIM_EVIDENCE',
      objectKey: upload.objectKey,
      mimeType,
      sizeBytes: file.size,
      checksum,
    });
  }
}
