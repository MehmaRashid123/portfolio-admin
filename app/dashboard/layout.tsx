import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--bg-primary)]">
          <Sidebar />
          <main className="md:ml-[240px] pt-14 transition-all duration-300">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
