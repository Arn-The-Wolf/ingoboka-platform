import { PortalGuard } from '@/components/auth/portal-guard';

import { AdminSidebar } from '@/components/layout/admin-sidebar';



export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (

    <PortalGuard allowedRoles={['PLATFORM_ADMIN']}>

      <div className="flex h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-purple-50/20 overflow-hidden">

        <AdminSidebar />

        <main className="flex-1 overflow-y-auto transition-all duration-300 lg:ml-64">

          <div className="mx-auto w-full max-w-7xl p-6 pt-20 lg:pt-6">{children}</div>

        </main>

      </div>

    </PortalGuard>

  );

}

