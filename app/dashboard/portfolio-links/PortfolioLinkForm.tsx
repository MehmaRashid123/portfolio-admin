'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Trash2, X, Globe } from 'lucide-react';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  thumbnail?: { url: string };
}

interface PortfolioLinkData {
  _id: string;
  title: string;
  slug: string;
  projects: Project[];
  isActive: boolean;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function PortfolioLinkForm({ linkId }: { linkId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!linkId;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categoryFilters, setCategoryFilters] = useState<{ slug: string; label: string }[]>([]);
  const [frontendUrl, setFrontendUrl] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalSlug = useRef('');
  const userEditedSlug = useRef(false);

  // Load all published projects
  useEffect(() => {
    fetch('/api/projects?status=published')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAllProjects(d.data); });
  }, []);

  // Load categories + frontendUrl from settings
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategoryFilters(d.data); });
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const url = d.data?.frontendUrl || process.env.NEXT_PUBLIC_FRONTEND_URL || '';
          setFrontendUrl(url.replace(/\/$/, ''));
        }
      });
  }, []);

  // Load existing link on edit
  useEffect(() => {
    if (!linkId) return;
    fetch(`/api/portfolio-links/${linkId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const link: PortfolioLinkData = d.data;
          setTitle(link.title);
          setSlug(link.slug);
          setIsActive(link.isActive);
          setSelectedIds(link.projects.map((p) => p._id));
          originalSlug.current = link.slug;
          setSlugStatus('available');
        }
      })
      .finally(() => setLoadingData(false));
  }, [linkId]);

  // Auto-slug from title (new only, unless user manually edited)
  useEffect(() => {
    if (!isEdit && !userEditedSlug.current && title) {
      setSlug(slugify(title));
    }
  }, [title, isEdit]);

  // Slug validation + uniqueness check
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { setSlugStatus('invalid'); return; }
    if (slug === originalSlug.current) { setSlugStatus('available'); return; }

    setSlugStatus('checking');
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/portfolio-links');
        const data = await res.json();
        if (data.success) {
          const taken = data.data.some(
            (l: { slug: string; _id: string }) => l.slug === slug && l._id !== linkId
          );
          setSlugStatus(taken ? 'taken' : 'available');
        }
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
    return () => { if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current); };
  }, [slug, linkId]);

  const toggleProject = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const filteredProjects = categoryFilter === 'All'
    ? allProjects
    : allProjects.filter((p) => p.category === categoryFilter);

  const selectedProjects = allProjects.filter((p) => selectedIds.includes(p._id));

  const handleSave = async (copyAfter = false) => {
    if (!title.trim()) { toast('Title is required', 'error'); return; }
    if (!slug.trim()) { toast('Slug is required', 'error'); return; }
    if (slugStatus === 'invalid') { toast('Slug format is invalid', 'error'); return; }
    if (slugStatus === 'taken') { toast('Slug is already taken', 'error'); return; }

    setSaving(true);
    try {
      const body = { title: title.trim(), slug: slug.trim(), projects: selectedIds, isActive };
      const res = await fetch(
        isEdit ? `/api/portfolio-links/${linkId}` : '/api/portfolio-links',
        { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (copyAfter) {
        await navigator.clipboard.writeText(`${frontendUrl}/portfolio/${slug}`);
        toast('Saved and link copied!', 'success');
      } else {
        toast(isEdit ? 'Link updated' : 'Link created', 'success');
      }

      if (!isEdit) router.push(`/dashboard/portfolio-links/${data.data._id}`);
      else originalSlug.current = slug;
    } catch (err: any) {
      toast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/portfolio-links/${linkId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('Link deleted', 'success');
      router.push('/dashboard/portfolio-links');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const slugHint = () => {
    if (slugStatus === 'checking') return { text: 'Checking...', color: 'text-[var(--text-muted)]' };
    if (slugStatus === 'available') return { text: '✓ Available', color: 'text-[var(--success)]' };
    if (slugStatus === 'taken') return { text: 'Slug already taken', color: 'text-[var(--danger)]' };
    if (slugStatus === 'invalid') return { text: 'Only lowercase letters, numbers, and hyphens', color: 'text-[var(--danger)]' };
    return null;
  };

  const hint = slugHint();

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Portfolio Link' : 'Create Portfolio Link'}
        description={isEdit ? `Editing: ${frontendUrl}/portfolio/${slug}` : 'Create a shareable link with selected projects'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Form (60%) ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Section 1 — Link Details */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-5">
            <h3 className="font-clash font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">
              Link Details
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <Input
                label="Portfolio Title"
                placeholder="Graphic Design Work"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {title && (
                <p className="text-xs text-[var(--text-muted)] font-clash pl-0.5">
                  "{title}"
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Link Slug
              </label>
              <input
                value={slug}
                onChange={(e) => {
                  userEditedSlug.current = true;
                  setSlug(e.target.value);
                }}
                placeholder="graphic"
                className={`
                  w-full bg-[var(--bg-surface)] border rounded px-3.5 py-2.5 text-sm font-mono
                  text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                  transition-all duration-200 focus:outline-none
                  ${slugStatus === 'taken' || slugStatus === 'invalid'
                    ? 'border-[var(--danger)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]'
                    : slugStatus === 'available'
                    ? 'border-[var(--success)] focus:shadow-[0_0_0_2px_rgba(34,197,94,0.15)]'
                    : 'border-[#333333] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-dim)]'
                  }
                `}
              />
              {hint && <p className={`text-xs ${hint.color}`}>{hint.text}</p>}
              {slug && (
                <p className="text-xs font-mono">
                  <span className="text-[var(--text-muted)]">{frontendUrl}/portfolio/</span>
                  <span className="text-[var(--accent)]">{slug}</span>
                </p>
              )}
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                  Link Status
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isActive ? 'Link is publicly accessible' : 'Link is hidden from public'}
                </p>
              </div>
              <button
                onClick={() => setIsActive((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${isActive ? 'bg-[var(--accent)]' : 'bg-[#333]'}`}
                aria-label="Toggle link status"
                role="switch"
                aria-checked={isActive}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          {/* Section 2 — Select Projects */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-clash font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">
                Select Projects
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Choose which projects appear on this portfolio page
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {[{ slug: 'All', label: 'All' }, ...categoryFilters].map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 ${
                    categoryFilter === cat.slug
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[#1a1a1a] text-[var(--text-muted)] hover:text-white border border-[#333]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Selected count bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-[var(--accent-dim)] rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--accent)]">
                    {selectedIds.length} project{selectedIds.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex -space-x-1.5">
                    {selectedProjects.slice(0, 5).map((p) => (
                      <div key={p._id} className="w-5 h-5 rounded-full border border-[var(--accent)] overflow-hidden bg-[#1a1a1a]">
                        {p.thumbnail?.url && (
                          <Image src={p.thumbnail.url} alt={p.title} width={20} height={20} className="object-cover w-full h-full" />
                        )}
                      </div>
                    ))}
                    {selectedIds.length > 5 && (
                      <div className="w-5 h-5 rounded-full border border-[var(--accent)] bg-[var(--accent-dim)] flex items-center justify-center">
                        <span className="text-[8px] text-[var(--accent)] font-bold">+{selectedIds.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Project grid */}
            {allProjects.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No published projects found.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredProjects.map((project) => {
                  const selected = selectedIds.includes(project._id);
                  return (
                    <motion.button
                      key={project._id}
                      onClick={() => toggleProject(project._id)}
                      whileTap={{ scale: 0.97 }}
                      className={`relative rounded overflow-hidden text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        selected
                          ? 'ring-2 ring-[var(--accent)] scale-[1.02] shadow-[0_0_16px_rgba(255,77,0,0.2)]'
                          : 'ring-1 ring-[#333] hover:ring-[#555]'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-[#1a1a1a] relative">
                        {project.thumbnail?.url ? (
                          <Image
                            src={project.thumbnail.url}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 200px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">
                            No image
                          </div>
                        )}
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[var(--accent)] rounded-full flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-[#111]">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate font-satoshi">
                          {project.title}
                        </p>
                        <Badge variant={project.category as any} className="mt-1 text-[10px]">
                          {project.category}
                        </Badge>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Preview (40%) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <h3 className="font-clash font-semibold text-sm uppercase tracking-wider text-[var(--text-secondary)]">
              Live Preview
            </h3>

            {/* Browser chrome */}
            <div className="rounded-lg overflow-hidden border border-[#333] bg-[#0d0d0d]">
              {/* URL bar */}
              <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-2 border-b border-[#333]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                </div>
                <div className="flex-1 bg-[#111] rounded px-2 py-1 flex items-center gap-1.5">
                  <Globe size={10} className="text-[var(--text-muted)]" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                    {frontendUrl}/portfolio/
                    <span className="text-[var(--accent)]">{slug || '...'}</span>
                  </span>
                </div>
              </div>

              {/* Page preview */}
              <div className="p-4 min-h-[300px] bg-[#0a0a0a]">
                {/* Mini navbar */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1a1a1a]">
                  <span className="text-xs font-clash font-semibold text-white">AGENCY.</span>
                  <span className="text-[10px] text-[var(--text-muted)]">View Full Work →</span>
                </div>

                {/* Hero */}
                <div className="mb-5">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--accent)] font-medium">
                    PORTFOLIO
                  </span>
                  <h2 className="font-clash font-bold text-lg text-white mt-1 leading-tight">
                    {title || 'Portfolio Title'}
                  </h2>
                </div>

                {/* Project thumbnails */}
                {selectedProjects.length === 0 ? (
                  <div className="border border-dashed border-[#333] rounded p-6 text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">Select projects to preview</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedProjects.slice(0, 6).map((p) => (
                      <div key={p._id} className="aspect-[4/3] bg-[#1a1a1a] rounded overflow-hidden relative">
                        {p.thumbnail?.url && (
                          <Image src={p.thumbnail.url} alt={p.title} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                    ))}
                    {selectedProjects.length > 6 && (
                      <div className="aspect-[4/3] bg-[#1a1a1a] rounded flex items-center justify-center">
                        <span className="text-[10px] text-[var(--text-muted)]">+{selectedProjects.length - 6}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Projects selected</span>
                <span className="text-[var(--accent)] font-medium">{selectedIds.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className={isActive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {slug && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Public URL</span>
                  <span className="text-[var(--accent)] font-mono text-[10px]">/{slug}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="sticky bottom-0 mt-6 -mx-8 px-8 py-4 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          {isEdit && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete Link
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/portfolio-links')}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={() => handleSave(false)}
          >
            Save
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            icon={<Copy size={13} />}
            onClick={() => handleSave(true)}
          >
            Save & Copy Link
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Portfolio Link"
        message="This will permanently delete this link. Anyone with the URL will no longer be able to access it."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
