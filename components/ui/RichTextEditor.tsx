'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimal?: boolean; // minimal = bold/italic/lists only
}

export default function RichTextEditor({ label, value, onChange, error, minimal = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const tools = minimal
    ? [
        { icon: <Bold size={14} />, cmd: 'bold', label: 'Bold' },
        { icon: <Italic size={14} />, cmd: 'italic', label: 'Italic' },
        { icon: <List size={14} />, cmd: 'insertUnorderedList', label: 'Bullet list' },
        { icon: <ListOrdered size={14} />, cmd: 'insertOrderedList', label: 'Numbered list' },
      ]
    : [
        { icon: <Bold size={14} />, cmd: 'bold', label: 'Bold' },
        { icon: <Italic size={14} />, cmd: 'italic', label: 'Italic' },
        { icon: <List size={14} />, cmd: 'insertUnorderedList', label: 'Bullet list' },
        { icon: <ListOrdered size={14} />, cmd: 'insertOrderedList', label: 'Numbered list' },
        { icon: <Quote size={14} />, cmd: 'formatBlock', label: 'Quote', val: 'blockquote' },
        { icon: <Code size={14} />, cmd: 'formatBlock', label: 'Code', val: 'pre' },
      ];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className={`border rounded overflow-hidden ${error ? 'border-[var(--danger)]' : 'border-[#333333]'} focus-within:border-[var(--accent)]`}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-elevated)] border-b border-[#333]">
          {tools.map((tool) => (
            <button
              key={tool.cmd + (tool as any).val}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(tool.cmd, (tool as any).val);
              }}
              className="p-1.5 rounded text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)] transition-colors"
            >
              {tool.icon}
            </button>
          ))}
        </div>
        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="
            min-h-[160px] p-4 text-sm text-[var(--text-primary)] bg-[var(--bg-surface)]
            outline-none font-satoshi leading-relaxed
            [&_strong]:font-bold [&_em]:italic
            [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
            [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--text-secondary)]
            [&_pre]:bg-[var(--bg-elevated)] [&_pre]:p-3 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-xs
          "
          data-placeholder="Start writing..."
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
