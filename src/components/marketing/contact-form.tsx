'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const t = useTranslations('landing');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get('name') ?? '');
    const email = String(fd.get('email') ?? '');
    const message = String(fd.get('message') ?? '');
    const subject = encodeURIComponent(`Ingoboka contact — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.location.href = `mailto:hello@ingoboka.rw?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Alert variant="success" className="rounded-2xl">
        {t('contact.form.success')}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-brand-border/60 bg-white p-6 shadow-card lg:p-8">
      <div className="space-y-2">
        <Label htmlFor="contact-name">{t('contact.form.name')}</Label>
        <Input id="contact-name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">{t('contact.form.email')}</Label>
        <Input id="contact-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">{t('contact.form.message')}</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="flex w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-brand-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        />
      </div>
      <Button type="submit" variant="pill-accent" className="w-full font-bold sm:w-auto">
        {t('contact.form.submit')}
      </Button>
    </form>
  );
}
