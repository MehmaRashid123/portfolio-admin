'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const expired = searchParams.get('expired');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {expired && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 bg-[var(--bg-surface)] border-l-4 border-l-[var(--accent)] border border-[#333] px-4 py-3 rounded text-sm"
        >
          Session expired. Please sign in again.
        </motion.div>
      )}

      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-[var(--bg-surface)] border border-[#333] rounded-lg overflow-hidden border-t-2 border-t-[var(--accent)]">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-12 h-12 bg-[var(--accent)] rounded-sm flex items-center justify-center mx-auto mb-4">
              <Zap size={22} className="text-white" />
            </div>
            <h1 className="font-clash font-bold text-2xl">Agency Admin</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@agency.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-[var(--text-muted)] hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[var(--danger)] text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full justify-center mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
