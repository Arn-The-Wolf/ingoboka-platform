import { BottomNav } from '@/components/layout/bottom-nav';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
