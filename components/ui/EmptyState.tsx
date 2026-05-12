import { FolderOpen } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
        {icon ?? <FolderOpen size={24} className="text-[var(--text-muted)]" />}
      </div>
      <div>
        <p className="font-clash font-semibold text-lg text-[var(--text-primary)]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
      </div>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
