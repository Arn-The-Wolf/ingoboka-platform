'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQuery } from '@tanstack/react-query';
import { claimApi, policyApi } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Car,
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'ACCIDENT', labelKey: 'incidentAccident' as const, icon: Car },
  { id: 'ILLNESS', labelKey: 'incidentIllness' as const, icon: Stethoscope },
  { id: 'HOSPITAL', labelKey: 'incidentHospital' as const, icon: HeartPulse },
  { id: 'OTHER', labelKey: 'incidentOther' as const, icon: AlertTriangle },
] as const;

export default function NewClaimPage() {
  const router = useRouter();
  const t = useTranslations('citizen.claims');
  const tCommon = useTranslations('common');
  const toast = useAdminToast();
  const [step, setStep] = useState(1);
  const [policyId, setPolicyId] = useState('');
  const [claimType, setClaimType] = useState('ACCIDENT');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('50000');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => policyApi.list(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const created = await claimApi.create({
        policyId,
        claimType,
        description,
        incidentDate: new Date().toISOString().slice(0, 10),
        claimedAmount: Number(claimedAmount),
      });
      const claimId = (created as { id: string }).id;

      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${files[i].name} (${i + 1}/${files.length})…`);
        await claimApi.uploadDocuments(claimId, [files[i]]);
      }
      setUploadProgress(null);

      await claimApi.submit(claimId);
      return { claimId };
    },
    onSuccess: () => {
      toast.success(tCommon('submitted'));
      router.push('/claims');
    },
    onError: () => toast.error(tCommon('error')),
  });

  const activePolicies = (policies?.content ?? []).filter((p) => p.status === 'ACTIVE');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <>
      <CitizenHeader title={t('nav')} />
      <PageContainer narrow>
        <Link href="/claims" className="text-sm font-medium text-brand-muted hover:text-brand-primary">
          ← {t('backToClaims')}
        </Link>

        <StepIndicator totalSteps={4} currentStep={step} className="my-6" />

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-6">
            {step === 1 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">{t('step1Title')}</h2>
                  <p className="text-sm text-brand-muted">{t('step1Subtitle')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {INCIDENT_TYPES.map(({ id, labelKey, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setClaimType(id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border p-5 transition-all',
                        claimType === id
                          ? 'border-brand-primary bg-brand-surface-container-low'
                          : 'border-brand-border bg-white hover:border-brand-primary/50'
                      )}
                    >
                      <Icon className="h-8 w-8 text-brand-primary" />
                      <span className="text-sm font-semibold">{t(labelKey)}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full" variant="pill" onClick={() => setStep(2)}>
                  {tCommon('continue')}
                </Button>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">{t('step2Title')}</h2>
                  <p className="text-sm text-brand-muted">{t('step2Subtitle')}</p>
                </div>
                <div className="space-y-2">
                  {activePolicies.map((p) => (
                    <Card
                      key={p.id}
                      className={cn(
                        'cursor-pointer transition-all',
                        policyId === p.id && 'border-brand-primary ring-2 ring-brand-primary/20'
                      )}
                      onClick={() => setPolicyId(p.id)}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold">{p.productName}</p>
                        <p className="text-xs text-brand-muted">{p.policyNumber}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    {tCommon('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill"
                    disabled={!policyId}
                    onClick={() => setStep(3)}
                  >
                    {tCommon('continue')}
                  </Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">{t('step3Title')}</h2>
                  <p className="text-sm text-brand-muted">{t('step3Subtitle')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('descriptionLabel')}</Label>
                  <textarea
                    id="description"
                    className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{t('amountInputLabel')}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documents">{t('uploadLabel')}</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-brand-muted">{t('uploadHint')}</p>
                  {files.length === 0 && (
                    <p className="text-xs text-amber-700">{t('proofRequired')}</p>
                  )}
                  {files.length > 0 && (
                    <p className="text-xs text-brand-primary">
                      {t('filesSelected', { count: files.length })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    {tCommon('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill"
                    disabled={!description || files.length === 0}
                    onClick={() => setStep(4)}
                  >
                    {t('review')}
                  </Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-brand-primary-dark">{t('step4Title')}</h2>
                  <p className="text-sm text-brand-muted">{t('step4Subtitle')}</p>
                </div>
                <Card>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">{t('typeLabel')}</span>
                      <span className="font-medium">{claimType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">{t('policyLabel')}</span>
                      <span className="font-medium">
                        {activePolicies.find((p) => p.id === policyId)?.policyNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">{t('amountLabel')}</span>
                      <span className="font-medium">{Number(claimedAmount).toLocaleString()} RWF</span>
                    </div>
                    {files.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-muted">{t('uploadLabel')}</span>
                        <span className="font-medium">{t('filesSelected', { count: files.length })}</span>
                      </div>
                    )}
                    <p className="border-t border-brand-border pt-2 text-brand-muted">{description}</p>
                  </CardContent>
                </Card>
                {uploadProgress && (
                  <p className="text-center text-sm font-medium text-brand-primary">{uploadProgress}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                    {tCommon('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="pill-accent"
                    disabled={mutation.isPending || files.length === 0}
                    loading={mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    {uploadProgress ?? t('submitClaim')}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}
