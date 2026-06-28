import { getTranslations } from 'next-intl/server';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { ContactForm } from '@/components/marketing/contact-form';
import { LandingCta } from '@/components/landing/landing-cta';
import { MapPin, Clock, Mail } from 'lucide-react';

export default async function ContactPage() {
  const t = await getTranslations('landing');

  return (
    <>
      <MarketingPageHero title={t('pages.contact.heroTitle')} subtitle={t('pages.contact.heroSubtitle')} />
      <section className="py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <ContactForm />
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-bold text-brand-primary-dark">{t('contact.office.title')}</h2>
              <ul className="space-y-4 text-sm text-brand-muted">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                  <span>{t('contact.office.address')}</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                  <span>{t('contact.office.hours')}</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                  <a href={`mailto:${t('footer.contactEmail')}`} className="hover:text-brand-primary">
                    {t('footer.contactEmail')}
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-brand-outline">{t('contact.office.note')}</p>
          </div>
        </div>
      </section>
      <LandingCta />
    </>
  );
}
