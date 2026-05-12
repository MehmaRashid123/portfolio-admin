type BadgeVariant = 'graphic' | 'web' | '3d' | 'published' | 'draft' | 'admin' | 'editor' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  graphic: 'bg-[#222] text-[#999]',
  web: 'bg-white/10 text-white',
  '3d': 'bg-[var(--accent-dim)] text-[var(--accent)]',
  published: 'bg-[#22C55E20] text-[var(--success)]',
  draft: 'bg-[#55555520] text-[var(--text-muted)]',
  admin: 'bg-[var(--accent-dim)] text-[var(--accent)]',
  editor: 'bg-white/10 text-[var(--text-secondary)]',
  default: 'bg-[#222] text-[var(--text-secondary)]',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium font-satoshi
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
