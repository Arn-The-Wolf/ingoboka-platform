interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalContentProps {
  sections: LegalSection[];
  lastUpdated: string;
}

export function LegalContent({ sections, lastUpdated }: LegalContentProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-8 text-sm text-brand-outline">{lastUpdated}</p>
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xl font-semibold text-brand-primary-dark">{section.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-brand-muted">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
