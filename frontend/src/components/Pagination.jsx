import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(255, 255, 255, 0.01)'
    }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page <= 1 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <button
          className="btn-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: page >= totalPages ? 0.4 : 1 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
