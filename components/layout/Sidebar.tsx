'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutGrid, Sparkles, Users, Quote, FileText,
  Settings, Shield, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Link2,
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
      { label: 'Projects',       href: '/dashboard/projects',       icon: <LayoutGrid size={16} /> },
      { label: 'Services',       href: '/dashboard/services',       icon: <Sparkles size={16} /> },
      { label: 'Team',           href: '/dashboard/team',           icon: <Users size={16} /> },
      { label: 'Testimonials',   href: '/dashboard/testimonials',   icon: <Quote size={16} /> },
      { label: 'Blog',           href: '/dashboard/blog',           icon: <FileText size={16} /> },
      { label: 'Portfolio Links',href: '/dashboard/portfolio-links',icon: <Link2 size={16} /> },
    ] as NavItem[],
  },
  {
    title: 'SITE',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={16} />, adminOnly: true },
      { label: 'Users',    href: '/dashboard/users',    icon: <Shield size={16} />,   adminOnly: true },
    ] as NavItem[],
  },
];

/* ── Inline animated logo SVG ───────────────────────────────────────────── */
function SidebarLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ZendXB logo"
    >
      <defs>
        <linearGradient id="sb-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="100%" stopColor="#7b2fff"/>
        </linearGradient>
        <linearGradient id="sb-cg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7b2fff"/>
          <stop offset="100%" stopColor="#00d4ff"/>
        </linearGradient>
        <filter id="sb-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Bg circle */}
      <circle cx="50" cy="50" r="47" fill="#0a1628" stroke="url(#sb-cg)" strokeWidth="1.5" opacity="0.8"/>

      {/* Rotating dashed ring */}
      <circle cx="50" cy="50" r="42" stroke="url(#sb-cg)" strokeWidth="0.8"
        strokeDasharray="5 4" fill="none" opacity="0.5"
        style={{ transformOrigin: '50px 50px', animation: 'sb-spin 10s linear infinite' }}/>

      {/* Z shape */}
      <g filter="url(#sb-glow)">
        <line x1="27" y1="29" x2="73" y2="29" stroke="url(#sb-cg)"  strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="73" y1="29" x2="27" y2="71" stroke="url(#sb-cg2)" strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="27" y1="71" x2="73" y2="71" stroke="url(#sb-cg)"  strokeWidth="5.5" strokeLinecap="round"/>
      </g>

      {/* Circuit dots */}
      {[
        { cx: 27, cy: 29, d: '0s'   },
        { cx: 50, cy: 29, d: '0.3s' },
        { cx: 73, cy: 29, d: '0.6s' },
        { cx: 50, cy: 50, d: '0.9s' },
        { cx: 27, cy: 71, d: '1.2s' },
        { cx: 50, cy: 71, d: '1.5s' },
        { cx: 73, cy: 71, d: '1.8s' },
      ].map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r="2.8" fill={i % 2 === 0 ? '#00d4ff' : '#7b2fff'}
          filter="url(#sb-glow)"
          style={{ animation: `sb-dot 2.4s ease-in-out ${dot.d} infinite` }}/>
      ))}

      <style>{`
        @keyframes sb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sb-dot  { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:1; transform:scale(1.7); } }
      `}</style>
    </svg>
  );
}

/* ── Nav link ───────────────────────────────────────────────────────────── */
function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-150 relative group
        ${active
          ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
        }
      `}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
          style={{ background: 'linear-gradient(180deg, #00d4ff, #7b2fff)' }} />
      )}
      <span className="flex-shrink-0" style={{ color: active ? 'var(--accent)' : undefined }}>
        {item.icon}
      </span>
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
      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
          border border-[var(--border)]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--fg)' }}>
          {item.label}
        </span>
      )}
    </Link>
  );
}

/* ── Main sidebar ───────────────────────────────────────────────────────── */
export default function Sidebar() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname  = usePathname();
  const { data: session } = useSession();
  const role     = (session?.user as any)?.role;
  const name     = session?.user?.name ?? 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const sidebarContent = (
    <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[var(--border)]">
        <div className="flex-shrink-0">
          <SidebarLogo size={collapsed ? 34 : 34} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-sm tracking-widest leading-none"
                style={{
                  fontFamily: 'var(--font-heading, sans-serif)',
                  background: 'linear-gradient(135deg, #00d4ff, #7b2fff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                ZENDXB
              </p>
              <p className="text-[9px] tracking-[0.3em] mt-0.5"
                style={{ color: 'rgba(232,244,255,0.35)' }}>
                TECHHUB ADMIN
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
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
                    className="text-[9px] font-semibold uppercase tracking-[0.18em] px-3 mb-2"
                    style={{ color: 'rgba(232,244,255,0.2)' }}
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
                    transition={{ delay: i * 0.04 }}
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

      {/* ── Account ── */}
      <div className="border-t border-[var(--border)] p-3 space-y-1">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2fff)' }}>
              <span className="text-xs font-bold" style={{ color: '#0d1b2a' }}>{initials}</span>
            </div>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate" style={{ color: 'var(--fg)' }}>{name}</p>
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
          <LogOut size={15} />
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
          className="flex items-center justify-center w-full py-1.5 transition-colors"
          style={{ color: 'rgba(232,244,255,0.2)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-0 h-full z-40
          border-r border-[var(--border)] transition-all duration-300
          ${collapsed ? 'w-[60px]' : 'w-[240px]'}
        `}
        style={{ background: 'var(--bg-surface)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded border border-[var(--border)]"
        style={{ background: 'var(--bg-surface)' }}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/70 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 h-full z-50 border-r border-[var(--border)]"
              style={{ background: 'var(--bg-surface)' }}
            >
              <button
                className="absolute top-4 right-4 transition-colors"
                style={{ color: 'rgba(232,244,255,0.3)' }}
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
