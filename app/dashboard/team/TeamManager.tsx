'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: { url: string; publicId: string };
  socials?: { linkedin?: string; behance?: string; instagram?: string };
  displayOrder?: number;
}

const EMPTY: Omit<TeamMember, '_id'> = {
  name: '',
  role: '',
  bio: '',
  photo: undefined,
  socials: { linkedin: '', behance: '', instagram: '' },
  displayOrder: 0,
};

export default function TeamManager() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TeamMember, '_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const res = await fetch('/api/team');
    const data = await res.json();
    if (data.success) setMembers(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(EMPTY);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setForm({ name: m.name, role: m.role, bio: m.bio, photo: m.photo, socials: m.socials, displayOrder: m.displayOrder });
    setEditId(m._id);
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.role) return toast('Name and role are required', 'error');
    setSaving(true);
    try {
      const url = editId ? `/api/team/${editId}` : '/api/team';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast(editId ? 'Member updated' : 'Member added', 'success');
      setModalOpen(false);
      load();
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/team/${deleteId}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m._id !== deleteId));
      toast('Member removed', 'success');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Team"
        badge={members.length}
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={openNew}>
            Add Member
          </Button>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          title="No team members"
          description="Add your first team member to get started."
          action={{ label: 'Add Member', onClick: openNew }}
          icon={<User size={24} className="text-[var(--text-muted)]" />}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m, i) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 group hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0 relative">
                  {m.photo?.url ? (
                    <Image src={m.photo.url} alt={m.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={20} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-clash font-semibold truncate">{m.name}</p>
                  <p className="text-sm text-[var(--accent)]">{m.role}</p>
                  {m.bio && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{m.bio}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" icon={<Pencil size={12} />} onClick={() => openEdit(m)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" icon={<Trash2 size={12} />} onClick={() => setDeleteId(m._id)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Member' : 'Add Member'} size="md">
        <div className="space-y-4">
          <FileUpload
            label="Photo"
            value={form.photo ?? null}
            onChange={(v) => setForm({ ...form, photo: v ?? undefined })}
          />
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          <Input label="Role / Title *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Creative Director" />
          <Textarea label="Bio" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio..." />
          <div className="grid grid-cols-3 gap-3">
            <Input label="LinkedIn" value={form.socials?.linkedin ?? ''} onChange={(e) => setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })} placeholder="URL" />
            <Input label="Behance" value={form.socials?.behance ?? ''} onChange={(e) => setForm({ ...form, socials: { ...form.socials, behance: e.target.value } })} placeholder="URL" />
            <Input label="Instagram" value={form.socials?.instagram ?? ''} onChange={(e) => setForm({ ...form, socials: { ...form.socials, instagram: e.target.value } })} placeholder="URL" />
          </div>
          <Input
            label="Display Order"
            type="number"
            value={form.displayOrder ?? 0}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 justify-center" loading={saving} onClick={save}>
              {editId ? 'Update' : 'Add Member'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Member"
        message="Are you sure you want to remove this team member?"
      />
    </div>
  );
}
