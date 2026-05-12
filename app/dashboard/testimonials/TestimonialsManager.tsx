'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FileUpload from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';

interface Testimonial {
  _id: string;
  clientName: string;
  company?: string;
  quote: string;
  rating: number;
  status: string;
  avatar?: { url: string; publicId: string };
  createdAt: string;
}

const EMPTY = { clientName: '', company: '', quote: '', rating: 5, status: 'draft', avatar: undefined as any };

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`transition-colors ${s <= value ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
          aria-label={`${s} star`}
        >
          <Star size={18} fill={s <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const res = await fetch('/api/testimonials');
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setModalOpen(true); };
  const openEdit = (t: Testimonial) => {
    setForm({ clientName: t.clientName, company: t.company ?? '', quote: t.quote, rating: t.rating, status: t.status, avatar: t.avatar as any });
    setEditId(t._id);
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.clientName || !form.quote) return toast('Client name and quote are required', 'error');
    setSaving(true);
    try {
      const url = editId ? `/api/testimonials/${editId}` : '/api/testimonials';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast(editId ? 'Updated' : 'Added', 'success');
      setModalOpen(false);
      load();
    } catch { toast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setItems((prev) => prev.filter((t) => t._id !== deleteId));
    try {
      await fetch(`/api/testimonials/${deleteId}`, { method: 'DELETE' });
      toast('Deleted', 'success');
    } catch { toast('Failed to delete', 'error'); load(); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const columns: Column<Testimonial>[] = [
    { key: 'clientName', header: 'Client', render: (r) => <span className="font-medium">{r.clientName}</span> },
    { key: 'company', header: 'Company', render: (r) => <span className="text-[var(--text-secondary)]">{r.company || '—'}</span> },
    {
      key: 'rating', header: 'Rating',
      render: (r) => (
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={12} className={s <= r.rating ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} fill={s <= r.rating ? 'currentColor' : 'none'} />
          ))}
        </div>
      ),
    },
    { key: 'quote', header: 'Quote', render: (r) => <span className="text-sm text-[var(--text-secondary)] line-clamp-1 max-w-xs">{r.quote}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status as any}>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions', width: '80px',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors" aria-label="Edit"><Pencil size={14} /></button>
          <button onClick={() => setDeleteId(r._id)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Testimonials" badge={items.length} actions={<Button variant="primary" icon={<Plus size={14} />} onClick={openNew}>Add Testimonial</Button>} />
      <DataTable columns={columns} data={items} loading={loading} keyExtractor={(r) => r._id} emptyTitle="No testimonials yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4">
          <FileUpload label="Avatar (optional)" value={form.avatar ?? null} onChange={(v) => setForm({ ...form, avatar: v as any })} />
          <Input label="Client Name *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Textarea label="Quote *" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider block mb-2">Rating</label>
            <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 justify-center" loading={saving} onClick={save}>{editId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Testimonial" message="Are you sure you want to delete this testimonial?" />
    </div>
  );
}
