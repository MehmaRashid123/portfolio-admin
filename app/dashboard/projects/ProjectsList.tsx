'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  thumbnail?: { url: string };
  createdAt: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'graphic', label: 'Graphic Design' },
  { value: 'web', label: 'Web Development' },
  { value: '3d', label: '3D Art' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
  { value: 'title', label: 'A–Z' },
];

export default function ProjectsList() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    // Optimistic
    setProjects((prev) => prev.filter((p) => p._id !== deleteId));
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('Project deleted', 'success');
    } catch {
      toast('Failed to delete project', 'error');
      load(); // rollback
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const paginated = projects.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(projects.length / PER_PAGE);
  const deleteProject = projects.find((p) => p._id === deleteId);

  const columns: Column<Project>[] = [
    {
      key: 'thumbnail',
      header: 'Thumb',
      width: '60px',
      render: (row) =>
        row.thumbnail?.url ? (
          <div className="w-12 h-12 rounded overflow-hidden bg-[var(--bg-elevated)] relative">
            <Image src={row.thumbnail.url} alt={row.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-[var(--bg-elevated)]" />
        ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div>
          <p className="font-medium text-sm">{row.title}</p>
          <p className="text-xs text-[var(--text-muted)] font-mono">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <Badge variant={row.category as any}>{row.category}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={row.status as any}>{row.status}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/projects/${row._id}`)}
            className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors rounded"
            aria-label="Edit project"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors rounded"
            aria-label="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Projects"
        badge={projects.length}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => router.push('/dashboard/projects/new')}
          >
            Add Project
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--bg-surface)] border border-[#333] rounded pl-9 pr-3 py-2 text-sm
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <Select
          options={CATEGORIES}
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        keyExtractor={(r) => r._id}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to get started."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteProject?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
