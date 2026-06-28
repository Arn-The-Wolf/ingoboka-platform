interface MarketingPageHeroProps {
  title: string;
  subtitle?: string;
}

export function MarketingPageHero({ title, subtitle }: MarketingPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border/40 bg-gradient-to-br from-brand-primary-light/40 via-brand-background to-brand-background py-14 lg:py-20">
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-brand-accent/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-brand-primary lg:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-brand-muted lg:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
