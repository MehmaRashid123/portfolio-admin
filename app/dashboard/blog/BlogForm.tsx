'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  status: z.enum(['draft', 'published']),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BlogForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const isEdit = !!postId;

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', seo: {} },
  });

  const title = watch('title');
  const status = watch('status');

  useEffect(() => {
    if (!isEdit && title) setValue('slug', slugify(title), { shouldDirty: false });
  }, [title, isEdit, setValue]);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/blog/${postId}`).then((r) => r.json()).then((data) => {
      if (data.success) reset(data.data);
    });
  }, [postId, reset]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/blog/${postId}` : '/api/blog';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast(isEdit ? 'Post updated' : 'Post created', 'success');
      router.push('/dashboard/blog');
    } catch (err: any) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/blog/${postId}`, { method: 'DELETE' });
      toast('Post deleted', 'success');
      router.push('/dashboard/blog');
    } catch { toast('Failed to delete', 'error'); }
    finally { setDeleting(false); setDeleteOpen(false); }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Post' : 'New Post'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="Post title" />
              <Input label="Slug *" mono error={errors.slug?.message} {...register('slug')} placeholder="post-slug" />
              <Input label="Category" {...register('category')} placeholder="e.g. Design, Development" />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <FileUpload label="Cover Image *" value={field.value ?? null} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor label="Content *" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
            </div>

            {/* SEO accordion */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <span>SEO Settings</span>
                {seoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {seoOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-[var(--border)]">
                  <div className="pt-4">
                    <Input label="Meta Title" {...register('seo.metaTitle')} placeholder="SEO title" />
                  </div>
                  <Input label="Meta Description" {...register('seo.metaDescription')} placeholder="SEO description" />
                  <Input label="OG Image URL" {...register('seo.ogImage')} placeholder="https://..." />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 space-y-4">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">Publish</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={status as any}>{status}</Badge>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setValue('status', 'draft', { shouldDirty: true })}
                  className={`flex-1 py-2 text-sm rounded-sm border transition-colors ${status === 'draft' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[#333] text-[var(--text-muted)]'}`}>
                  Draft
                </button>
                <button type="button" onClick={() => setValue('status', 'published', { shouldDirty: true })}
                  className={`flex-1 py-2 text-sm rounded-sm border transition-colors ${status === 'published' ? 'border-[var(--success)] text-[var(--success)] bg-[#22C55E10]' : 'border-[#333] text-[var(--text-muted)]'}`}>
                  Published
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-0 mt-8 bg-[var(--bg-primary)] border-t border-[var(--border)] py-4 flex items-center justify-between gap-4"
        >
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={loading} onClick={() => setValue('status', 'published')}>
              {isEdit ? 'Update' : 'Publish'}
            </Button>
            <Button type="submit" variant="secondary" loading={loading} onClick={() => setValue('status', 'draft')}>
              Save Draft
            </Button>
          </div>
          {isEdit && (
            <Button type="button" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          )}
        </motion.div>
      </form>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting} title="Delete Post" message="This will permanently delete the post." />
    </div>
  );
}
