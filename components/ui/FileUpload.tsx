'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  label?: string;
  value?: { url: string; publicId: string } | null;
  onChange: (value: { url: string; publicId: string } | null) => void;
  accept?: string;
  error?: string;
}

export default function FileUpload({ label, value, onChange, accept = 'image/*', error }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onChange(data.data);
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded overflow-hidden border border-[#333] w-full aspect-video bg-[var(--bg-surface)]">
          <Image src={value.url} alt="Upload preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-[var(--danger)] text-white rounded-full p-1.5"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`
            flex flex-col items-center justify-center gap-3
            border-2 border-dashed rounded cursor-pointer
            py-10 px-6 transition-all duration-200
            ${dragOver ? 'border-[var(--accent)] bg-[var(--accent-dim)]' : 'border-[#333] hover:border-[var(--accent)]'}
            ${error ? 'border-[var(--danger)]' : ''}
          `}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
          ) : (
            <Upload size={24} className="text-[var(--accent)]" />
          )}
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {uploading ? 'Uploading...' : 'Drop file or click to browse'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, WebP up to 10MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
