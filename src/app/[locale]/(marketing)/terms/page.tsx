import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { LegalContent } from '@/components/marketing/legal-content';

export default async function TermsPage() {
  const t = await getTranslations('landing');

  const sections = [
    {
      title: t('terms.sections.acceptance.title'),
      paragraphs: [t('terms.sections.acceptance.p1')],
    },
    {
      title: t('terms.sections.services.title'),
      paragraphs: [t('terms.sections.services.p1'), t('terms.sections.services.p2')],
    },
    {
      title: t('terms.sections.accounts.title'),
      paragraphs: [t('terms.sections.accounts.p1'), t('terms.sections.accounts.p2')],
    },
    {
      title: t('terms.sections.payments.title'),
      paragraphs: [t('terms.sections.payments.p1')],
    },
    {
      title: t('terms.sections.claims.title'),
      paragraphs: [t('terms.sections.claims.p1')],
    },
    {
      title: t('terms.sections.liability.title'),
      paragraphs: [t('terms.sections.liability.p1')],
    },
    {
      title: t('terms.sections.changes.title'),
      paragraphs: [t('terms.sections.changes.p1')],
    },
  ];

  return (
    <>
      <MarketingPageHero title={t('pages.terms.heroTitle')} subtitle={t('pages.terms.heroSubtitle')} />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <LegalContent sections={sections} lastUpdated={t('terms.lastUpdated')} />
        </div>
      </section>
    </>
  );
}
