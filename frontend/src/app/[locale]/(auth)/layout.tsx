export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
        {children}
      </main>
    </div>
  );
}
