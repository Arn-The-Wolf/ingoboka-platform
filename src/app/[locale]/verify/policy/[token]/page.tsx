'use client';

import { useParams } from 'next/navigation';
import { usePublicVerification } from '@/hooks/use-policies';
import { PolicyVerificationView } from '@/components/citizen/policy-verification-view';

export default function PublicVerifyPolicyPage() {
  const params = useParams();
  const token = params.token as string;
  const { data, isLoading, error } = usePublicVerification(token);

  return (
    <PolicyVerificationView token={token} data={data} isLoading={isLoading} error={error} />
  );
}
