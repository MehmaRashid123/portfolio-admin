interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string | number;
}

export default function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-clash font-bold text-2xl text-[var(--text-primary)]">{title}</h2>
          {badge !== undefined && (
            <span className="bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-medium px-2 py-0.5 rounded-sm">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
