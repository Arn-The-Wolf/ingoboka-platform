'use client';

import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { useClaimDocuments } from '@/hooks/use-claim-documents';
import { openDocumentContent } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import type { ApiError } from '@/types';

type ClaimDocumentListProps = {
  claimId: string;
  title: string;
  emptyLabel: string;
  viewLabel: string;
  errorLabel: string;
};

export function ClaimDocumentList({
  claimId,
  title,
  emptyLabel,
  viewLabel,
  errorLabel,
}: ClaimDocumentListProps) {
  const { data: documents, isLoading, error } = useClaimDocuments(claimId);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const handleOpen = async (documentId: string, contentUrl: string, fileName: string) => {
    setOpeningId(documentId);
    setOpenError(null);
    try {
      await openDocumentContent(contentUrl, fileName, claimId, documentId);
    } catch (err) {
      setOpenError((err as ApiError).message ?? errorLabel);
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-brand-primary-dark">{title}</h3>
      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
      {error && (
        <Alert variant="error">{(error as ApiError).message ?? errorLabel}</Alert>
      )}
      {openError && <Alert variant="error">{openError}</Alert>}
      {!isLoading && !error && documents?.length === 0 && (
        <p className="text-sm text-brand-muted">{emptyLabel}</p>
      )}
      {!isLoading && documents && documents.length > 0 && (
        <ul className="divide-y divide-brand-border rounded-lg border border-brand-border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-brand-muted">
                    {doc.documentType} · {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                loading={openingId === doc.id}
                disabled={!!openingId}
                onClick={() => void handleOpen(doc.id, doc.contentUrl, doc.fileName)}
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                {viewLabel}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
