'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutGrid, Sparkles, Users, Quote, FileText,
  Settings, Shield, LogOut, ChevronLeft, ChevronRight,
  Zap, Menu, X, Link2
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navSections = [
  {
    title: 'CONTENT',
    items: [
      { label: 'Projects', href: '/dashboard/projects', icon: <LayoutGrid size={16} /> },
      { label: 'Services', href: '/dashboard/services', icon: <Sparkles size={16} /> },
      { label: 'Team', href: '/dashboard/team', icon: <Users size={16} /> },
      { label: 'Testimonials', href: '/dashboard/testimonials', icon: <Quote size={16} /> },
      { label: 'Blog', href: '/dashboard/blog', icon: <FileText size={16} /> },
      { label: 'Portfolio Links', href: '/dashboard/portfolio-links', icon: <Link2 size={16} /> },
    ] as NavItem[],
  },
  {
    title: 'SITE',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={16} />, adminOnly: true },
      { label: 'Users', href: '/dashboard/users', icon: <Shield size={16} />, adminOnly: true },
    ] as NavItem[],
  },
];

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-150 relative group
        ${active
          ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
          : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent)] rounded-r" />
      )}
      <span className="flex-shrink-0">{item.icon}</span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-[var(--bg-elevated)] text-white text-xs rounded
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[var(--border)]">
          {item.label}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const name = session?.user?.name ?? 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const sidebarContent = (
    <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
        <div className="w-8 h-8 bg-[var(--accent)] rounded-sm flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <span className="font-clash font-bold text-base whitespace-nowrap">Agency</span>
              <span className="text-[10px] font-medium bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-sm">
                Admin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || role === 'admin'
          );
          if (!visibleItems.length) return null;
          return (
            <div key={section.title}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest px-3 mb-2"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {visibleItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      item={item}
                      collapsed={collapsed}
                      active={pathname.startsWith(item.href)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Account */}
      <div className="border-t border-[var(--border)] p-3 space-y-2">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[var(--bg-primary)]">{initials}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{name}</p>
                <Badge variant={role === 'admin' ? 'admin' : 'editor'} className="mt-0.5">
                  {role}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`
            flex items-center gap-3 w-full px-3 py-2 rounded-sm
            text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-500/10
            transition-colors text-sm
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 text-[var(--text-muted)] hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-0 h-full z-40
          bg-[var(--bg-surface)] border-r border-[var(--border)]
          transition-all duration-300
          ${collapsed ? 'w-[60px]' : 'w-[240px]'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/70 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 h-full z-50 bg-[var(--bg-surface)] border-r border-[var(--border)]"
            >
              <button
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
