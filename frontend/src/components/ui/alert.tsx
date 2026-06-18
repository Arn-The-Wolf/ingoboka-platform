import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'default' | 'success' | 'error' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  default: 'border-brand-border bg-brand-primary-light text-brand-primary-dark',
  success: 'border-brand-success/30 bg-brand-success/10 text-brand-success',
  error: 'border-brand-error/30 bg-brand-error/10 text-brand-error',
  warning: 'border-brand-warning/30 bg-brand-warning/10 text-brand-warning',
};

const icons: Record<AlertVariant, React.ReactNode> = {
  default: <Info className="h-5 w-5 shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
  error: <AlertCircle className="h-5 w-5 shrink-0" />,
  warning: <AlertCircle className="h-5 w-5 shrink-0" />,
};

export function Alert({ variant = 'default', title, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4 text-sm',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      {icons[variant]}
      <div>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
