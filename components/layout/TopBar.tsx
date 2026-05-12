'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] h-14 z-30 bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center justify-between px-6 transition-all duration-300">
      <h1 className="font-clash font-semibold text-[18px] text-[var(--text-primary)]">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          className="p-2 text-[var(--text-muted)] hover:text-white transition-colors rounded"
          aria-label="Search (CMD+K)"
          title="Search (CMD+K)"
        >
          <Search size={16} />
        </button>
        <button
          className="p-2 text-[var(--text-muted)] rounded cursor-not-allowed opacity-40"
          aria-label="Notifications (coming soon)"
          title="Notifications — coming soon"
          disabled
        >
          <Bell size={16} />
        </button>
        <div
          className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center cursor-default"
          title={name}
          aria-label={`Logged in as ${name}`}
        >
          <span className="text-xs font-bold text-[var(--bg-primary)]">{initials}</span>
        </div>
      </div>
    </header>
  );
}
