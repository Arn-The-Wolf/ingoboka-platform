import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { LegalContent } from '@/components/marketing/legal-content';

export default async function PrivacyPage() {
  const t = await getTranslations('landing');

  const sections = [
    {
      title: t('privacy.sections.intro.title'),
      paragraphs: [t('privacy.sections.intro.p1'), t('privacy.sections.intro.p2')],
    },
    {
      title: t('privacy.sections.data.title'),
      paragraphs: [t('privacy.sections.data.p1'), t('privacy.sections.data.p2')],
    },
    {
      title: t('privacy.sections.law.title'),
      paragraphs: [t('privacy.sections.law.p1'), t('privacy.sections.law.p2')],
    },
    {
      title: t('privacy.sections.rights.title'),
      paragraphs: [t('privacy.sections.rights.p1'), t('privacy.sections.rights.p2')],
    },
    {
      title: t('privacy.sections.security.title'),
      paragraphs: [t('privacy.sections.security.p1')],
    },
    {
      title: t('privacy.sections.contact.title'),
      paragraphs: [t('privacy.sections.contact.p1')],
    },
  ];

  return (
    <>
      <MarketingPageHero title={t('pages.privacy.heroTitle')} subtitle={t('pages.privacy.heroSubtitle')} />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <LegalContent sections={sections} lastUpdated={t('privacy.lastUpdated')} />
        </div>
      </section>
    </>
  );
}
