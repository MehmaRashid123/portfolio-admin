'use client';

import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  keyExtractor,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-surface)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-[#1a1a1a]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg-surface)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={keyExtractor(row)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-t border-[#1a1a1a] hover:bg-[var(--bg-surface)] transition-colors group"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
