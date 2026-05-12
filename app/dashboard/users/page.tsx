import TopBar from '@/components/layout/TopBar';
import UsersManager from './UsersManager';

export default function UsersPage() {
  return (
    <>
      <TopBar title="Users" />
      <UsersManager />
    </>
  );
}
