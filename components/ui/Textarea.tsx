'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className = '', value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {label}
            </label>
            {showCount && maxLength && (
              <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <div className="input-focus-line relative">
          <textarea
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={`
              w-full bg-[var(--bg-surface)] border border-[#333333]
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              rounded px-3.5 py-2.5 text-sm font-satoshi
              transition-all duration-200 resize-y min-h-[100px]
              focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-dim)]
              disabled:opacity-40 disabled:cursor-not-allowed
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

Textarea.displayName = 'Textarea';
export default Textarea;
