import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 20, className = '', fullPage = false }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={size} className={`animate-spin text-[var(--accent)] ${className}`} />
      </div>
    );
  }
  return <Loader2 size={size} className={`animate-spin text-[var(--accent)] ${className}`} />;
}
