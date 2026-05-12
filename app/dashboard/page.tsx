import { auth } from '@/lib/auth';
import DashboardHome from './DashboardHome';
import TopBar from '@/components/layout/TopBar';

export default async function DashboardPage() {
  const session = await auth();
  return (
    <>
      <TopBar title="Dashboard" />
      <DashboardHome userName={session?.user?.name ?? 'there'} />
    </>
  );
}
