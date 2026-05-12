'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  status: string;
  readTime?: number;
  createdAt: string;
}

export default function BlogList() {
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const res = await fetch('/api/blog');
    const data = await res.json();
    if (data.success) setPosts(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setPosts((prev) => prev.filter((p) => p._id !== deleteId));
    try {
      await fetch(`/api/blog/${deleteId}`, { method: 'DELETE' });
      toast('Post deleted', 'success');
    } catch { toast('Failed to delete', 'error'); load(); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'title', header: 'Title',
      render: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-[var(--text-muted)] font-mono">{r.slug}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <span className="text-sm text-[var(--text-secondary)]">{r.category || '—'}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status as any}>{r.status}</Badge> },
    { key: 'readTime', header: 'Read Time', render: (r) => <span className="text-sm text-[var(--text-secondary)]">{r.readTime ? `${r.readTime} min` : '—'}</span> },
    { key: 'createdAt', header: 'Date', render: (r) => <span className="text-xs text-[var(--text-secondary)]">{new Date(r.createdAt).toLocaleDateString()}</span> },
    {
      key: 'actions', header: 'Actions', width: '80px',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => router.push(`/dashboard/blog/${r._id}`)} className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors" aria-label="Edit"><Pencil size={14} /></button>
          <button onClick={() => setDeleteId(r._id)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Blog" badge={posts.length} actions={<Button variant="primary" icon={<Plus size={14} />} onClick={() => router.push('/dashboard/blog/new')}>New Post</Button>} />
      <DataTable columns={columns} data={posts} loading={loading} keyExtractor={(r) => r._id} emptyTitle="No blog posts yet" />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Post" message="Are you sure you want to delete this post?" />
    </div>
  );
}
