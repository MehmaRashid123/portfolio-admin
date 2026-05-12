'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, X, Plus, Trash2, Sparkles } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Service {
  _id?: string;
  name: string;
  slug: 'graphic' | 'web' | '3d';
  description: string;
  features: string[];
  startingPrice: string;
  ctaLabel: string;
}

const DEFAULT_SERVICES: Service[] = [
  { slug: 'graphic', name: 'Graphic Design', description: '', features: [], startingPrice: '', ctaLabel: 'Get a Quote' },
  { slug: 'web', name: 'Web Development', description: '', features: [], startingPrice: '', ctaLabel: 'Get a Quote' },
  { slug: '3d', name: '3D Art', description: '', features: [], startingPrice: '', ctaLabel: 'Get a Quote' },
];

export default function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Service | null>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length) {
          // Merge with defaults
          const merged = DEFAULT_SERVICES.map((def) => {
            const found = data.data.find((s: Service) => s.slug === def.slug);
            return found ?? def;
          });
          setServices(merged);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (service: Service) => {
    setDraft({ ...service });
    setEditSlug(service.slug);
    setNewFeature('');
  };

  const closeEdit = () => {
    setEditSlug(null);
    setDraft(null);
  };

  const addFeature = () => {
    if (!newFeature.trim() || !draft) return;
    setDraft({ ...draft, features: [...draft.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (i: number) => {
    if (!draft) return;
    setDraft({ ...draft, features: draft.features.filter((_, idx) => idx !== i) });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setServices((prev) => prev.map((s) => (s.slug === draft.slug ? { ...draft, _id: data.data._id } : s)));
      toast('Service updated', 'success');
      closeEdit();
    } catch {
      toast('Failed to save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader title="Services" description="Manage your 3 core service offerings" />

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--accent)] transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[var(--accent-dim)] rounded-sm flex items-center justify-center">
                <Sparkles size={18} className="text-[var(--accent)]" />
              </div>
              <button
                onClick={() => openEdit(service)}
                className="p-2 text-[var(--text-muted)] hover:text-white transition-colors rounded opacity-0 group-hover:opacity-100"
                aria-label="Edit service"
              >
                <Pencil size={14} />
              </button>
            </div>
            <h3 className="font-clash font-bold text-lg mb-2">{service.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
              {service.description || 'No description yet'}
            </p>
            {service.features.length > 0 && (
              <ul className="space-y-1 mb-4">
                {service.features.slice(0, 3).map((f, j) => (
                  <li key={j} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {service.features.length > 3 && (
                  <li className="text-xs text-[var(--text-muted)]">+{service.features.length - 3} more</li>
                )}
              </ul>
            )}
            {service.startingPrice && (
              <p className="text-sm font-medium text-[var(--accent)]">From {service.startingPrice}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Edit Drawer */}
      <AnimatePresence>
        {editSlug && draft && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeEdit}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-surface)] border-l border-[var(--border)] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-clash font-semibold text-lg">Edit {draft.name}</h2>
                <button onClick={closeEdit} className="text-[var(--text-muted)] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <Input
                  label="Service Name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
                <Textarea
                  label="Description"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                    What's Included
                  </label>
                  <div className="space-y-2 mb-3">
                    {draft.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[var(--bg-elevated)] rounded px-3 py-2">
                        <span className="flex-1 text-sm">{f}</span>
                        <button
                          onClick={() => removeFeature(i)}
                          className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                          aria-label="Remove feature"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="Add feature..."
                      className="flex-1 bg-[var(--bg-elevated)] border border-[#333] rounded px-3 py-2 text-sm
                        text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                        focus:outline-none focus:border-[var(--accent)]"
                    />
                    <Button type="button" variant="secondary" size="sm" icon={<Plus size={12} />} onClick={addFeature}>
                      Add
                    </Button>
                  </div>
                </div>
                <Input
                  label="Starting Price"
                  value={draft.startingPrice}
                  onChange={(e) => setDraft({ ...draft, startingPrice: e.target.value })}
                  placeholder="e.g. $500 or Custom"
                />
                <Input
                  label="CTA Label"
                  value={draft.ctaLabel}
                  onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
                  placeholder="e.g. Get a Quote"
                />
              </div>
              <div className="px-6 py-4 border-t border-[var(--border)]">
                <Button variant="primary" className="w-full justify-center" loading={saving} onClick={save}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
