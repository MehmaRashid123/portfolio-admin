'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useSession } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const EMPTY_NEW = { name: '', email: '', password: '', role: 'editor' };
const EMPTY_EDIT = { name: '', role: 'editor' };

export default function UsersManager() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const currentUserId = (session?.user as any)?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newForm, setNewForm] = useState(EMPTY_NEW);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addUser = async () => {
    if (!newForm.name || !newForm.email || !newForm.password) return toast('All fields required', 'error');
    setSaving(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('User created', 'success');
      setAddOpen(false);
      setNewForm(EMPTY_NEW);
      load();
    } catch (err: any) { toast(err.message || 'Failed to create user', 'error'); }
    finally { setSaving(false); }
  };

  const updateUser = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editUser._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast('User updated', 'success');
      setEditUser(null);
      load();
    } catch { toast('Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (user: User) => {
    if (user._id === currentUserId) return toast("Can't deactivate yourself", 'error');
    try {
      await fetch(`/api/users/${user._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !user.isActive }) });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast(user.isActive ? 'User deactivated' : 'User activated', 'info');
    } catch { toast('Failed to update', 'error'); }
  };

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'User',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[var(--bg-primary)]">
              {r.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (r) => <Badge variant={r.role as any}>{r.role}</Badge> },
    {
      key: 'isActive', header: 'Status',
      render: (r) => (
        <span className={`text-xs font-medium ${r.isActive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin', header: 'Last Login',
      render: (r) => <span className="text-xs text-[var(--text-secondary)]">{r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : 'Never'}</span>,
    },
    {
      key: 'actions', header: 'Actions', width: '80px',
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditUser(r); setEditForm({ name: r.name, role: r.role }); }}
            className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors"
            aria-label="Edit user"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => toggleActive(r)}
            className={`p-1.5 transition-colors ${r.isActive ? 'text-[var(--success)] hover:text-[var(--text-muted)]' : 'text-[var(--text-muted)] hover:text-[var(--success)]'}`}
            aria-label={r.isActive ? 'Deactivate user' : 'Activate user'}
            disabled={r._id === currentUserId}
          >
            {r.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" badge={users.length} actions={<Button variant="primary" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>Add User</Button>} />
      <DataTable columns={columns} data={users} loading={loading} keyExtractor={(r) => r._id} emptyTitle="No users found" />

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">
        <div className="space-y-4">
          <Input label="Full Name *" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} />
          <Input label="Email *" type="email" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} />
          <Input label="Temporary Password *" type="password" value={newForm.password} onChange={(e) => setNewForm({ ...newForm, password: e.target.value })} />
          <Select label="Role" value={newForm.role} onChange={(e) => setNewForm({ ...newForm, role: e.target.value })} options={[{ value: 'editor', label: 'Editor' }, { value: 'admin', label: 'Admin' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 justify-center" loading={saving} onClick={addUser}>Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="space-y-4">
          <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Select label="Role" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} options={[{ value: 'editor', label: 'Editor' }, { value: 'admin', label: 'Admin' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1 justify-center" loading={saving} onClick={updateUser}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
