'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

/* ── Animated logo ──────────────────────────────────────────────────────── */
function LoginLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="ZendXB logo">
      <defs>
        <linearGradient id="ll-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#7b2fff"/>
        </linearGradient>
        <linearGradient id="ll-cg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7b2fff"/>
          <stop offset="100%" stopColor="#00d4ff"/>
        </linearGradient>
        <filter id="ll-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <circle cx="50" cy="50" r="47" fill="#0a1628" stroke="url(#ll-cg)" strokeWidth="1.5" opacity="0.9"/>
      <circle cx="50" cy="50" r="42" stroke="url(#ll-cg)" strokeWidth="0.8"
        strokeDasharray="5 4" fill="none" opacity="0.5"
        style={{ transformOrigin: '50px 50px', animation: 'll-spin 10s linear infinite' }}/>

      {/* Inner glow */}
      <ellipse cx="50" cy="50" rx="22" ry="22" fill="url(#ll-cg)" opacity="0.07"
        style={{ animation: 'll-pulse 3s ease-in-out infinite' }}/>

      <g filter="url(#ll-glow)">
        <line x1="27" y1="29" x2="73" y2="29" stroke="url(#ll-cg)"  strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="73" y1="29" x2="27" y2="71" stroke="url(#ll-cg2)" strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="27" y1="71" x2="73" y2="71" stroke="url(#ll-cg)"  strokeWidth="5.5" strokeLinecap="round"/>
      </g>

      {[
        { cx: 27, cy: 29, c: '#00d4ff', d: '0s'   },
        { cx: 50, cy: 29, c: '#7b2fff', d: '0.3s' },
        { cx: 73, cy: 29, c: '#00d4ff', d: '0.6s' },
        { cx: 50, cy: 50, c: '#00d4ff', d: '0.9s' },
        { cx: 27, cy: 71, c: '#7b2fff', d: '1.2s' },
        { cx: 50, cy: 71, c: '#00d4ff', d: '1.5s' },
        { cx: 73, cy: 71, c: '#7b2fff', d: '1.8s' },
      ].map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r="3" fill={dot.c} filter="url(#ll-glow)"
          style={{ animation: `ll-dot 2.4s ease-in-out ${dot.d} infinite` }}/>
      ))}

      {/* Corner stubs */}
      <line x1="27" y1="29" x2="19" y2="21" stroke="#00d4ff" strokeWidth="1" opacity="0.5"/>
      <line x1="73" y1="29" x2="81" y2="21" stroke="#7b2fff" strokeWidth="1" opacity="0.5"/>
      <line x1="27" y1="71" x2="19" y2="79" stroke="#7b2fff" strokeWidth="1" opacity="0.5"/>
      <line x1="73" y1="71" x2="81" y2="79" stroke="#00d4ff" strokeWidth="1" opacity="0.5"/>
      <circle cx="19" cy="21" r="2" fill="#00d4ff" opacity="0.6"/>
      <circle cx="81" cy="21" r="2" fill="#7b2fff" opacity="0.6"/>
      <circle cx="19" cy="79" r="2" fill="#7b2fff" opacity="0.6"/>
      <circle cx="81" cy="79" r="2" fill="#00d4ff" opacity="0.6"/>

      <style>{`
        @keyframes ll-spin  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes ll-pulse { 0%,100% { opacity:0.06; } 50% { opacity:0.16; } }
        @keyframes ll-dot   { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:1; transform:scale(1.6); } }
      `}</style>
    </svg>
  );
}

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake]               = useState(false);
  const expired = searchParams.get('expired');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const result = await signIn('credentials', {
      email: data.email, password: data.password, redirect: false,
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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute pointer-events-none"
        style={{ top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)' }} />
      <div className="absolute pointer-events-none"
        style={{ top: '60%', right: '15%', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%)',
          transform: 'translateY(-50%)' }} />

      {/* Session expired toast */}
      {expired && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 right-5 px-4 py-3 rounded text-sm border-l-2 border-[var(--accent)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderLeftColor: 'var(--accent)', color: 'var(--fg)' }}
        >
          Session expired. Please sign in again.
        </motion.div>
      )}

      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Card */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 0 1px rgba(0,212,255,0.06), 0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top accent line */}
          <div className="h-px w-full" style={{
            background: 'linear-gradient(90deg, transparent, #00d4ff, #7b2fff, transparent)',
          }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center flex flex-col items-center gap-4">
            <LoginLogo />
            <div>
              <h1
                className="font-bold text-xl tracking-widest"
                style={{
                  fontFamily: 'var(--font-heading, sans-serif)',
                  background: 'linear-gradient(135deg, #00d4ff, #7b2fff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ZENDXB
              </h1>
              <p className="text-xs tracking-[0.3em] mt-0.5" style={{ color: 'rgba(232,244,255,0.35)' }}>
                TECHHUB ADMIN
              </p>
              <p className="text-sm mt-3" style={{ color: 'rgba(232,244,255,0.45)' }}>
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@zendxb.com"
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
                className="absolute right-3 bottom-2.5 transition-colors"
                style={{ color: 'rgba(232,244,255,0.3)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center"
                style={{ color: 'var(--danger)' }}
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

        {/* Footer note */}
        <p className="text-center text-xs mt-5" style={{ color: 'rgba(232,244,255,0.2)' }}>
          ZendXB TechHub © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
