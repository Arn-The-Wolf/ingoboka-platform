'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import type { PublicVerification } from '@/types';
import type { ApiError } from '@/types';
import { Shield, ShieldCheck, Bot, ShieldOff } from 'lucide-react';

interface PolicyVerificationViewProps {
  token: string;
  data?: PublicVerification;
  isLoading: boolean;
  error: unknown;
}

export function PolicyVerificationView({
  data,
  isLoading,
  error,
}: PolicyVerificationViewProps) {
  const t = useTranslations('verify');
  const tCommon = useTranslations('common');

  const isExpired =
    data &&
    !data.valid &&
    (data.status === 'EXPIRED' || data.status === 'CANCELLED');
  const isActive = data?.valid === true;
  const isNotFound = !!error && !data;

  return (
    <div className="flex min-h-screen flex-col bg-brand-background">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 lg:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-card">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-brand-primary-dark">Ingoboka</p>
            <p className="text-xs text-brand-muted">{t('title')}</p>
          </div>
        </div>
        <div className="h-1 bg-brand-accent" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-8">
        <p className="mb-8 text-center text-sm text-brand-muted">{t('noPii')}</p>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isNotFound && (
          <Alert variant="error" className="mb-6">
            {t('notFound')}
          </Alert>
        )}

        {isActive && data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary-light to-white p-8 text-center shadow-card">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-accent/20 blur-2xl" />
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary shadow-elevated"
              >
                <Image
                  src="/images/brand/ingoboka-mark-light.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                  aria-hidden
                />
                <motion.span
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent shadow-card"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShieldCheck className="h-5 w-5 text-brand-primary-dark" />
                </motion.span>
              </motion.div>
              <p className="text-lg font-bold text-brand-primary-dark">{t('verifiedTitle')}</p>
              <p className="mt-2 text-sm text-brand-muted">{t('verifiedSubtitle')}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">{data.policyNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-brand-muted">{t('productName')}</p>
                  <p className="font-medium">{data.productName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-muted">{t('insurerName')}</p>
                  <p className="font-medium">{data.insurerName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-muted">{t('statusLabel')}</p>
                  <Badge variant={policyStatusVariant(data.status ?? 'ACTIVE')}>
                    {tCommon((data.status ?? 'active').toLowerCase() as 'active' | 'pending')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-brand-muted">{t('validFrom')}</p>
                    <p className="text-sm font-medium">
                      {data.validFrom ? formatDate(data.validFrom) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted">{t('validTo')}</p>
                    <p className="text-sm font-medium">
                      {data.validTo ? formatDate(data.validTo) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isExpired && data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(220, 38, 38, 0.35)',
                  '0 0 0 12px rgba(220, 38, 38, 0)',
                ],
              }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="relative overflow-hidden rounded-2xl border-2 border-red-500/60 bg-gradient-to-br from-red-50 to-red-100/80 p-8 text-center"
            >
              <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
                <motion.div
                  animate={{ rotate: [-6, 6, -6] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute -left-2 top-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-elevated"
                >
                  <Bot className="h-7 w-7 text-red-600" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-elevated"
                >
                  <ShieldOff className="h-9 w-9" />
                </motion.div>
              </div>
              <motion.p
                animate={{ opacity: [1, 0.65, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-xl font-bold text-red-700"
              >
                {t('expiredTitle')}
              </motion.p>
              <p className="mt-2 text-sm text-red-600/90">{t('expiredSubtitle')}</p>
              {data.policyNumber && (
                <p className="mt-4 font-mono text-sm text-red-800/80">{data.policyNumber}</p>
              )}
            </motion.div>
          </motion.div>
        )}

        {data && !isActive && !isExpired && (
          <Alert variant="warning" className="mb-6">
            {t('invalid')}
          </Alert>
        )}
      </main>
    </div>
  );
}

export function isVerificationApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}
