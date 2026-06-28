import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/providers';
import { NavigationProgress } from '@/components/navigation/navigation-progress';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Ingoboka — Digital Microinsurance',
  description: 'Policy wallet and microinsurance platform for Rwanda',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ingoboka',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A7B4E',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  if (!routing.locales.includes(locale as 'en' | 'rw')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <NavigationProgress />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
