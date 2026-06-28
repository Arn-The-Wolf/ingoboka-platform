import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, className, centered = true }: SectionHeadingProps) {
  return (
    <div className={cn(centered && 'text-center', 'mb-10 lg:mb-14', className)}>
      <h2 className="text-2xl font-bold tracking-tight text-brand-primary lg:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-base text-brand-muted lg:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
