'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-[var(--accent)]',
  secondary:
    'bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)]',
  danger:
    'bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-red-500/10',
  ghost:
    'bg-transparent border-transparent text-[var(--text-secondary)] hover:text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={variant === 'primary' ? { boxShadow: '0 0 16px var(--accent-dim)' } : {}}
        className={`
          inline-flex items-center gap-2 font-satoshi font-medium
          rounded-sm transition-colors duration-150 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
          focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
