'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import TagInput from '@/components/ui/TagInput';
import FileUpload from '@/components/ui/FileUpload';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.enum(['graphic', 'web', '3d']),
  status: z.enum(['draft', 'published']),
  shortDescription: z.string().max(200).optional(),
  fullDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  client: z.string().optional(),
  year: z.string().optional(),
  tools: z.array(z.string()).optional(),
  thumbnail: z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  videoUrl: z.string().optional(),
  featured: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const YEARS = Array.from({ length: 6 }, (_, i) => {
  const y = (2025 - i).toString();
  return { value: y, label: y };
});

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = !!projectId;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft',
      category: 'web',
      tags: [],
      tools: [],
      featured: false,
    },
  });

  const title = watch('title');
  const status = watch('status');

  // Auto-slug from title (only on new)
  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title), { shouldDirty: false });
    }
  }, [title, isEdit, setValue]);

  // Load existing project
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) reset(data.data);
      });
  }, [projectId, reset]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/projects/${projectId}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast(isEdit ? 'Project updated' : 'Project created', 'success');
      router.push('/dashboard/projects');
    } catch (err: any) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      toast('Project deleted', 'success');
      router.push('/dashboard/projects');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Project' : 'New Project'}
        description={isEdit ? 'Update project details' : 'Fill in the details to create a new project'}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                Basic Info
              </h3>
              <Input label="Title *" error={errors.title?.message} {...register('title')} placeholder="Project title" />
              <Input label="Slug *" mono error={errors.slug?.message} {...register('slug')} placeholder="project-slug" />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Category *"
                      options={[
                        { value: 'graphic', label: 'Graphic Design' },
                        { value: 'web', label: 'Web Development' },
                        { value: '3d', label: '3D Art' },
                      ]}
                      error={errors.category?.message}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select label="Year" options={YEARS} placeholder="Select year" {...field} />
                  )}
                />
              </div>
              <Input label="Client" {...register('client')} placeholder="Client name" />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                Content
              </h3>
              <Controller
                name="shortDescription"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Short Description"
                    placeholder="Brief project description (max 200 chars)"
                    maxLength={200}
                    showCount
                    error={errors.shortDescription?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="fullDescription"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    label="Full Description"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    minimal
                  />
                )}
              />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                Tags & Tools
              </h3>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput label="Tags" value={field.value ?? []} onChange={field.onChange} placeholder="Add tag, press Enter" />
                )}
              />
              <Controller
                name="tools"
                control={control}
                render={({ field }) => (
                  <TagInput label="Tools Used" value={field.value ?? []} onChange={field.onChange} placeholder="Add tool, press Enter" />
                )}
              />
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                Media
              </h3>
              <Controller
                name="thumbnail"
                control={control}
                render={({ field }) => (
                  <FileUpload label="Thumbnail *" value={field.value ?? null} onChange={field.onChange} />
                )}
              />
              <Input label="Video URL" {...register('videoUrl')} placeholder="Cloudinary or YouTube URL" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 space-y-4">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                Publish
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={status as any}>{status}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue('status', 'draft', { shouldDirty: true })}
                  className={`flex-1 py-2 text-sm rounded-sm border transition-colors ${
                    status === 'draft'
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]'
                      : 'border-[#333] text-[var(--text-muted)] hover:border-[#555]'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'published', { shouldDirty: true })}
                  className={`flex-1 py-2 text-sm rounded-sm border transition-colors ${
                    status === 'published'
                      ? 'border-[var(--success)] text-[var(--success)] bg-[#22C55E10]'
                      : 'border-[#333] text-[var(--text-muted)] hover:border-[#555]'
                  }`}
                >
                  Published
                </button>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm">Featured on homepage</span>
              </label>
            </div>

            {/* Preview card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
              <h3 className="font-clash font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Preview
              </h3>
              <div className="bg-[var(--bg-elevated)] rounded overflow-hidden">
                {watch('thumbnail')?.url ? (
                  <div className="aspect-video relative">
                    <img src={watch('thumbnail')!.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-[var(--bg-elevated)] flex items-center justify-center">
                    <span className="text-xs text-[var(--text-muted)]">No thumbnail</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-clash font-semibold text-sm truncate">{watch('title') || 'Project Title'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={watch('category') as any}>{watch('category')}</Badge>
                    {watch('client') && (
                      <span className="text-xs text-[var(--text-muted)]">{watch('client')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-0 mt-8 bg-[var(--bg-primary)] border-t border-[var(--border)] py-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              onClick={() => setValue('status', 'published')}
            >
              {isEdit ? 'Update' : 'Publish'}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              onClick={() => setValue('status', 'draft')}
            >
              Save as Draft
            </Button>
          </div>
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </motion.div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message="This will permanently delete the project. This cannot be undone."
      />
    </div>
  );
}
