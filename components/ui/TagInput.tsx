'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export default function TagInput({ label, value, onChange, placeholder = 'Type and press Enter', error }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div
        className={`
          flex flex-wrap gap-2 bg-[var(--bg-surface)] border rounded px-3 py-2
          focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_2px_var(--accent-dim)]
          transition-all duration-200
          ${error ? 'border-[var(--danger)]' : 'border-[#333333]'}
        `}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[var(--accent-dim)] text-[var(--accent)] text-xs px-2 py-0.5 rounded-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
