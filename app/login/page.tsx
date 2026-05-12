import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <LoadingSpinner size={24} />
    </div>
  ),
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
