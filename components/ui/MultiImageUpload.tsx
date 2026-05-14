'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import Image from 'next/image';

export interface ImageItem {
  url: string;
  publicId: string;
  order: number;
}

interface MultiImageUploadProps {
  label?: string;
  value: ImageItem[];
  onChange: (value: ImageItem[]) => void;
}

export default function MultiImageUpload({ label, value, onChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<ImageItem | null> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(arr.map(uploadFile));
      const valid = results.filter(Boolean) as { url: string; publicId: string }[];
      const startOrder = value.length;
      const newItems: ImageItem[] = valid.map((r, i) => ({
        url: r.url,
        publicId: r.publicId,
        order: startOrder + i,
      }));
      onChange([...value, ...newItems]);
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i }));
    onChange(next);
  };

  // Drag-to-reorder
  const onDragStart = (i: number) => setDragIndex(i);
  const onDragEnter = (i: number) => setDragOverIndex(i);
  const onDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const next = [...value];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dragOverIndex, 0, moved);
      onChange(next.map((img, i) => ({ ...img, order: i })));
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Existing images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-1">
          {value.map((img, i) => (
            <div
              key={img.publicId}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative group aspect-video rounded overflow-hidden border transition-all duration-150 cursor-grab active:cursor-grabbing ${
                dragOverIndex === i && dragIndex !== i
                  ? 'border-[var(--accent)] scale-[1.02]'
                  : 'border-[#333]'
              } ${dragIndex === i ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* GIF: use <img> to preserve animation */}
              {img.url.toLowerCase().includes('.gif') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <Image src={img.url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="200px" />
              )}

              {/* Order badge */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
                {i + 1}
              </div>

              {/* Drag handle */}
              <div className="absolute top-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} className="text-white drop-shadow" />
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-[var(--danger)] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`
          flex flex-col items-center justify-center gap-2
          border-2 border-dashed rounded cursor-pointer
          py-6 px-4 transition-all duration-200 text-center
          ${dragOver ? 'border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[#333] hover:border-[var(--accent)]'}
        `}
      >
        {uploading ? (
          <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
        ) : (
          <Upload size={20} className="text-[var(--accent)]" />
        )}
        <p className="text-sm text-[var(--text-secondary)]">
          {uploading ? 'Uploading...' : 'Drop images or click to browse'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          PNG, JPG, WebP, GIF — multiple files supported
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {value.length > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {value.length} image{value.length !== 1 ? 's' : ''} · Drag to reorder
        </p>
      )}
    </div>
  );
}
