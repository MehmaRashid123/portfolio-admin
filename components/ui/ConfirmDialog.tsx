'use client';

import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Delete',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={22} className="text-[var(--danger)]" />
        </div>
        <div>
          <h3 className="font-clash font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
