import { AuthOtpBootstrap } from '@/components/auth/auth-otp-bootstrap';
import { AuthShell } from '@/components/layout/auth-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthOtpBootstrap>
      <AuthShell>{children}</AuthShell>
    </AuthOtpBootstrap>
  );
}
