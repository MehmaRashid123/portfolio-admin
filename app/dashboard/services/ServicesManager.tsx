'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, X, Plus, Trash2, Sparkles, Tag } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Service {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  startingPrice: string;
  ctaLabel: string;
}

interface Category {
  _id: string;
  slug: string;
  label: string;
  order: number;
}

const EMPTY_SERVICE: Omit<Service, '_id'> = {
  name: '', slug: '', description: '', features: [], startingPrice: '', ctaLabel: 'Get a Quote',
};

export default function ServicesManager() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');

  // Service edit drawer
  const [editService, setEditService] = useState<Service | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [deletingService, setDeletingService] = useState(false);

  // Category management
  const [newCatLabel, setNewCatLabel] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([fetch('/api/services'), fetch('/api/categories')]);
      const [sData, cData] = await Promise.all([sRes.json(), cRes.json()]);
      if (sData.success) setServices(sData.data);
      if (cData.success) setCategories(cData.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Service handlers ──
  const openNew = () => {
    setEditService({ ...EMPTY_SERVICE });
    setIsNewService(true);
    setNewFeature('');
  };

  const openEdit = (s: Service) => {
    setEditService({ ...s });
    setIsNewService(false);
    setNewFeature('');
  };

  const closeDrawer = () => { setEditService(null); setIsNewService(false); };

  const addFeature = () => {
    if (!newFeature.trim() || !editService) return;
    setEditService({ ...editService, features: [...editService.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (i: number) => {
    if (!editService) return;
    setEditService({ ...editService, features: editService.features.filter((_, idx) => idx !== i) });
  };

  const saveService = async () => {
    if (!editService) return;
    if (!editService.name.trim()) { toast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      if (isNewService) {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editService }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setServices((prev) => [...prev, data.data]);
        toast('Service created', 'success');
      } else {
        const res = await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editService),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setServices((prev) => prev.map((s) => (s.slug === editService.slug ? { ...editService, _id: data.data._id } : s)));
        toast('Service updated', 'success');
      }
      closeDrawer();
    } catch (err: any) {
      toast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async () => {
    if (!deleteServiceId) return;
    setDeletingService(true);
    try {
      const res = await fetch(`/api/services/${deleteServiceId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setServices((prev) => prev.filter((s) => s._id !== deleteServiceId));
      toast('Service deleted', 'success');
    } catch {
      toast('Failed to delete service', 'error');
    } finally {
      setDeletingService(false);
      setDeleteServiceId(null);
    }
  };

  // ── Category handlers ──
  const addCategory = async () => {
    if (!newCatLabel.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newCatLabel.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCategories((prev) => [...prev, data.data]);
      setNewCatLabel('');
      toast('Category added', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to add category', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteCatId) return;
    setDeletingCat(true);
    try {
      const res = await fetch(`/api/categories/${deleteCatId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCategories((prev) => prev.filter((c) => c._id !== deleteCatId));
      toast('Category deleted', 'success');
    } catch {
      toast('Failed to delete category', 'error');
    } finally {
      setDeletingCat(false);
      setDeleteCatId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Services & Categories"
        description="Manage your service offerings and project categories"
        actions={
          activeTab === 'services' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={openNew}>
              Add Service
            </Button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-1 w-fit">
        {(['services', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-150 capitalize ${
              activeTab === tab
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {tab === 'services' ? <span className="flex items-center gap-2"><Sparkles size={13} />Services</span>
              : <span className="flex items-center gap-2"><Tag size={13} />Categories</span>}
          </button>
        ))}
      </div>

      {/* ── Services Tab ── */}
      {activeTab === 'services' && (
        <div className="grid md:grid-cols-3 gap-6">
          {services.length === 0 && (
            <div className="md:col-span-3 text-center py-16 text-[var(--text-muted)] text-sm">
              No services yet. Click "Add Service" to create one.
            </div>
          )}
          {services.map((service, i) => (
            <motion.div
              key={service._id || service.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--accent)] transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[var(--accent-dim)] rounded-sm flex items-center justify-center">
                  <Sparkles size={18} className="text-[var(--accent)]" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors rounded"
                    aria-label="Edit service"
                  >
                    <Pencil size={14} />
                  </button>
                  {service._id && (
                    <button
                      onClick={() => setDeleteServiceId(service._id!)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded"
                      aria-label="Delete service"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-clash font-bold text-lg mb-1">{service.name}</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] mb-3">/{service.slug}</p>
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
      )}

      {/* ── Categories Tab ── */}
      {activeTab === 'categories' && (
        <div className="max-w-lg space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Categories are used to filter projects on the work page and in the admin. Changes apply everywhere instantly.
          </p>

          {/* Add new */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Category name, e.g. Motion Design"
              className="flex-1 bg-[var(--bg-surface)] border border-[#333] rounded px-3.5 py-2.5 text-sm
                text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-dim)]"
            />
            <Button variant="primary" size="md" icon={<Plus size={14} />} loading={addingCat} onClick={addCategory}>
              Add
            </Button>
          </div>

          {/* List */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
            {categories.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">No categories yet.</p>
            ) : (
              <ul className="divide-y divide-[#1a1a1a]">
                {categories.map((cat, i) => (
                  <motion.li
                    key={cat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{cat.label}</span>
                      <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">/{cat.slug}</span>
                    </div>
                    <button
                      onClick={() => setDeleteCatId(cat._id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded opacity-0 group-hover:opacity-100"
                      aria-label={`Delete ${cat.label}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Service Edit Drawer ── */}
      <AnimatePresence>
        {editService && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-surface)] border-l border-[var(--border)] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-clash font-semibold text-lg">
                  {isNewService ? 'New Service' : `Edit ${editService.name}`}
                </h2>
                <button onClick={closeDrawer} className="text-[var(--text-muted)] hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <Input
                  label="Service Name *"
                  value={editService.name}
                  onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                  placeholder="e.g. Motion Design"
                />
                {!isNewService && (
                  <Input
                    label="Slug"
                    value={editService.slug}
                    mono
                    disabled
                    hint="Slug cannot be changed after creation"
                  />
                )}
                <Textarea
                  label="Description"
                  value={editService.description}
                  onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                  placeholder="Describe this service..."
                />
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                    What's Included
                  </label>
                  <div className="space-y-2 mb-3">
                    {editService.features.map((f, i) => (
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
                  value={editService.startingPrice}
                  onChange={(e) => setEditService({ ...editService, startingPrice: e.target.value })}
                  placeholder="e.g. $500 or Custom"
                />
                <Input
                  label="CTA Label"
                  value={editService.ctaLabel}
                  onChange={(e) => setEditService({ ...editService, ctaLabel: e.target.value })}
                  placeholder="e.g. Get a Quote"
                />
              </div>
              <div className="px-6 py-4 border-t border-[var(--border)]">
                <Button variant="primary" className="w-full justify-center" loading={saving} onClick={saveService}>
                  {isNewService ? 'Create Service' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm delete service */}
      <ConfirmDialog
        open={!!deleteServiceId}
        onClose={() => setDeleteServiceId(null)}
        onConfirm={deleteService}
        title="Delete Service"
        message="This will permanently remove this service from the public site."
        confirmLabel="Delete"
        loading={deletingService}
      />

      {/* Confirm delete category */}
      <ConfirmDialog
        open={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={deleteCategory}
        title="Delete Category"
        message="Deleting this category won't delete existing projects, but they'll no longer match any filter. Are you sure?"
        confirmLabel="Delete"
        loading={deletingCat}
      />
    </div>
  );
}
