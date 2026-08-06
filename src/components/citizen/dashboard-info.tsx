'use client';

import { Shield, HeartHandshake, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const INFO_ITEMS = [
  {
    icon: Shield,
    title: 'Community-driven protection',
    description:
      'Ingoboka connects citizens with trusted microinsurance partners across Rwanda — affordable cover for health, accident, funeral, and more.',
  },
  {
    icon: HeartHandshake,
    title: 'How claims work',
    description:
      'Submit claims from the Claims tab with supporting documents. Most claims are reviewed within a few business days, with updates sent by SMS, email, and in-app notification.',
  },
  {
    icon: Users,
    title: 'Family coverage',
    description:
      'Add dependants under 18 from your profile to include family members in your plans. Complete the needs assessment for personalised product recommendations.',
  },
  {
    icon: Sparkles,
    title: 'Need help?',
    description:
      'Browse products, track policies in your wallet, and reach our support team any time from platform settings contact details.',
  },
] as const;

export function CitizenDashboardInfo() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {INFO_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="border-brand-border/60 bg-white/80">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary-dark">{item.title}</h3>
                <p className="mt-1 text-sm text-brand-muted">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
