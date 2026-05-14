'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutGrid, FileText, Users, Sparkles, Plus, ArrowRight, Link2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Stats {
  projects: number;
  services: number;
  team: number;
  blog: number;
  portfolioLinks: number;
}

interface RecentProject {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
  status: string;
}

function CountUp({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

const statCards = [
  { label: 'Total Projects', key: 'projects' as keyof Stats, icon: <LayoutGrid size={20} />, href: '/dashboard/projects' },
  { label: 'Services', key: 'services' as keyof Stats, icon: <Sparkles size={20} />, href: '/dashboard/services' },
  { label: 'Team Members', key: 'team' as keyof Stats, icon: <Users size={20} />, href: '/dashboard/team' },
  { label: 'Blog Posts', key: 'blog' as keyof Stats, icon: <FileText size={20} />, href: '/dashboard/blog' },
  { label: 'Portfolio Links', key: 'portfolioLinks' as keyof Stats, icon: <Link2 size={20} />, href: '/dashboard/portfolio-links' },
];

export default function DashboardHome({ userName }: { userName: string }) {
  const [stats, setStats] = useState<Stats>({ projects: 0, services: 0, team: 0, blog: 0, portfolioLinks: 0 });
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/projects?limit=5'),
        ]);
        const statsData = await statsRes.json();
        const projectsData = await projectsRes.json();
        if (statsData.success) setStats(statsData.data);
        if (projectsData.success) setRecent(projectsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-clash font-bold text-3xl">
          Good day, <span className="text-[var(--accent)]">{userName.split(' ')[0]}</span>
        </h2>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Here's what's happening with your site.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={card.href}
              className="block bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5
                hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--accent-dim)]
                transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                  {card.icon}
                </span>
                <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <div className="font-clash font-bold text-4xl text-[var(--accent)]">
                {loading ? '—' : <CountUp target={stats[card.key]} />}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">{card.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-clash font-semibold">Recent Projects</h3>
            <Link href="/dashboard/projects" className="text-xs text-[var(--accent)] hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-4">
                    <div className="skeleton h-4 rounded w-1/2" />
                    <div className="skeleton h-4 rounded w-16 ml-auto" />
                  </div>
                ))
              : recent.length === 0
              ? <p className="px-5 py-8 text-sm text-[var(--text-muted)] text-center">No projects yet</p>
              : recent.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={p.category as any}>{p.category}</Badge>
                    <Badge variant={p.status as any}>{p.status}</Badge>
                  </motion.div>
                ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
          <h3 className="font-clash font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/projects/new">
              <Button variant="secondary" className="w-full justify-start" icon={<Plus size={14} />}>
                Add Project
              </Button>
            </Link>
            <Link href="/dashboard/blog/new">
              <Button variant="secondary" className="w-full justify-start" icon={<Plus size={14} />}>
                Add Blog Post
              </Button>
            </Link>
            <Link href="/dashboard/team/new">
              <Button variant="secondary" className="w-full justify-start" icon={<Plus size={14} />}>
                Add Team Member
              </Button>
            </Link>
            <Link href="/dashboard/testimonials/new">
              <Button variant="secondary" className="w-full justify-start" icon={<Plus size={14} />}>
                Add Testimonial
              </Button>
            </Link>
            <Link href="/dashboard/portfolio-links/new">
              <Button variant="secondary" className="w-full justify-start" icon={<Plus size={14} />}>
                Create Portfolio Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
