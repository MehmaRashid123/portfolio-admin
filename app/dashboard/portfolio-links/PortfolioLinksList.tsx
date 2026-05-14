'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, Check, ExternalLink, Eye } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface PopulatedProject {
  _id: string;
  title: string;
  thumbnail?: { url: string };
  category: string;
  slug: string;
}

interface PortfolioLink {
  _id: string;
  title: string;
  slug: string;
  projects: PopulatedProject[];
  isActive: boolean;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${FRONTEND_URL}/portfolio/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)]"
    >
      {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
    </button>
  );
}

export default function PortfolioLinksList() {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState<PortfolioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio-links');
      const data = await res.json();
      if (data.success) setLinks(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setLinks((prev) => prev.filter((l) => l._id !== deleteId));
    try {
      const res = await fetch(`/api/portfolio-links/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('Portfolio link deleted', 'success');
    } catch {
      toast('Failed to delete link', 'error');
      load();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<PortfolioLink>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <span className="font-clash font-semibold text-[var(--text-primary)]">{row.title}</span>
      ),
    },
    {
      key: 'slug',
      header: 'URL',
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {FRONTEND_URL}/portfolio/
          <span className="text-[var(--accent)]">{row.slug}</span>
        </span>
      ),
    },
    {
      key: 'projects',
      header: 'Projects',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[var(--accent-dim)] text-[var(--accent)]">
          {row.projects.length} project{row.projects.length !== 1 ? 's' : ''}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'published' : 'draft'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '90px',
    },
    {
      key: 'viewCount',
      header: 'Views',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <Eye size={13} className="text-[var(--text-muted)]" />
          {row.viewCount}
        </span>
      ),
      width: '80px',
    },
    {
      key: 'lastViewedAt',
      header: 'Last Viewed',
      render: (row) => (
        <span className="text-xs text-[var(--text-muted)]">{timeAgo(row.lastViewedAt)}</span>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <CopyButton slug={row.slug} />
          <button
            onClick={() => router.push(`/dashboard/portfolio-links/${row._id}`)}
            title="Edit"
            className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)]"
          >
            <Pencil size={14} />
          </button>
          <a
            href={`${FRONTEND_URL}/portfolio/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)]"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setDeleteId(row._id)}
            title="Delete"
            className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Portfolio Links"
        badge={links.length}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => router.push('/dashboard/portfolio-links/new')}
          >
            Create Link
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={links}
        loading={loading}
        keyExtractor={(row) => row._id}
        emptyTitle="No portfolio links yet"
        emptyDescription="Create a shareable link to showcase selected projects to clients."
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Portfolio Link"
        message="This will permanently delete the link. Anyone with the URL will no longer be able to access it."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
