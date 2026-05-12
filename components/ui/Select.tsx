'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full appearance-none bg-[var(--bg-surface)] border border-[#333333]
              text-[var(--text-primary)] rounded px-3.5 py-2.5 text-sm font-satoshi
              transition-all duration-200 cursor-pointer
              focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-dim)]
              disabled:opacity-40 disabled:cursor-not-allowed
              ${error ? 'border-[var(--danger)]' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
