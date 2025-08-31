'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

type IngestResponse = {
  ok?: boolean;
  data?: any;         // JSON returned by n8n 
  error?: string;
};

export default function IngestButton() {
  const [loading, setLoading] = useState(false);

  async function runIngestion(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    // Show loading overlay
    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 z-[9999] grid place-items-center bg-black/20 backdrop-blur-sm';
    overlay.innerHTML = `
      <div class="flex flex-col items-center gap-3 rounded-2xl px-6 py-5 shadow-lg">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300"></div>
        <p class="text-lg text-green-700">Starting ingestion… wait</p>
      </div>
    `;
    document.body.appendChild(overlay);

    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      const json = (await res.json()) as IngestResponse;

      // Tira overlay antes do modal
      overlay.remove();
      setLoading(false);

      if (!res.ok || json?.error) {
        await Swal.fire({
          icon: 'error',
          title: 'Ingestion failed',
          text: json?.error || `HTTP ${res.status}`,
          confirmButtonText: 'OK',
        });
        return;
      }

      const d = json?.data ?? {};
      const rowsLoaded =
        d.rows_loaded ?? d.loaded ?? d.metrics?.rows_loaded ?? '—';
        

      const html = `
        <div style="text-align:center;font-size:30px;line-height:1.35">
          <div><b>Data (Rows) Loaded:</b> ${rowsLoaded}</div>
        </div>
      `;

      await Swal.fire({
        icon: 'success',
        title: 'Ingestion completed',
        html,
        confirmButtonText: 'OK',
        width: 520,
      });
    } catch (err: any) {
      overlay.remove();
      setLoading(false);
      await Swal.fire({
        icon: 'error',
        title: 'Unexpected error',
        text:
          err?.name === 'AbortError'
            ? 'Timeout waiting for server response.'
            : err?.message || 'Unknown failure',
      });
    }
  }

  return (
    <button
      onClick={runIngestion}
      disabled={loading}
      className="rounded-sm border bg-teal-700 px-4 py-2 text-white shadow-sm hover:bg-teal-800 disabled:opacity-30"
      title="Execute the ingestion workflow in n8n (synchronous)"
      aria-busy={loading}
    >
      {loading ? 'Executing…' : 'Dataset Ingestion '}
    </button>
  );
}
