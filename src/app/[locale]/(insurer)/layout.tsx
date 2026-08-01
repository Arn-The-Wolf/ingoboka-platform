import { PortalGuard } from '@/components/auth/portal-guard';

import { Sidebar } from '@/components/layout/sidebar';



export default function InsurerLayout({ children }: { children: React.ReactNode }) {

  return (

    <PortalGuard allowedRoles={['INSURER_ADMIN', 'INSURER_CLAIMS_OFFICER']}>

      <div className="flex h-screen bg-brand-background overflow-hidden">

        <Sidebar />

        <main className="flex-1 overflow-y-auto transition-all duration-300 lg:ml-64">

          <div className="mx-auto w-full max-w-7xl p-6 pt-20 lg:pt-6">{children}</div>

        </main>

      </div>

    </PortalGuard>

  );

}

