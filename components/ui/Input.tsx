'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  mono?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, mono = false, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="input-focus-line relative">
          <input
            ref={ref}
            className={`
              w-full bg-[var(--bg-surface)] border border-[#333333]
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              rounded px-3.5 py-2.5 text-sm transition-all duration-200
              focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-dim)]
              disabled:opacity-40 disabled:cursor-not-allowed
              ${mono ? 'font-mono text-xs' : 'font-satoshi'}
              ${error ? 'border-[var(--danger)]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
