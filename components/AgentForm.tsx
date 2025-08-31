'use client';

import { useState } from 'react';
import MetricsChart from './MetricsChart';
import { z } from 'zod';

const AgentResponseSchema = z.object({
  question: z.string().optional(),
  window: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  cac: z
    .object({
      current: z.string(),
      previous: z.string().optional().default(''),
      delta_pct: z.string().optional().default(''),
    })
    .optional(),
  roas: z
    .object({
      current: z.string(),
      previous: z.string().optional().default(''),
      delta_pct: z.string().optional().default(''),
    })
    .optional(),
});

type AgentResponse = z.infer<typeof AgentResponseSchema>;

type ChartData = {
  label: string;
  current: number;
  previous: number;
  deltaPct?: number;
};

export default function AgentForm() {
  const initialPrompt =
    '';

  const [prompt, setPrompt] = useState(initialPrompt);

  type ChatMsg =
    | { id: string; role: 'user'; text: string }
    | {
        id: string;
        role: 'agent';
        text?: string;
        chartData?: ChartData[] | null;
        meta?: { start?: string; end?: string } | null;
        loading?: boolean;
      };

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert string values from the API into numbers; returns NaN when absent
  function toNum(s?: string) {
    return s ? Number(s) : NaN;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const text = prompt.trim();
    if (!text) {
      return;
    }

    const idUser =
      typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).substring(2);
    const idBot =
      typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).substring(2);

    // Append user message and placeholder agent message
    setMsgs((curr: ChatMsg[]) => [
      ...curr,
      { id: idUser, role: 'user', text },
      {
        id: idBot,
        role: 'agent',
        loading: true,
        text: 'Consultando…',
        chartData: null,
        meta: null,
      },
    ]);

    // Clear prompt for next input
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as unknown;
      const parsed = AgentResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Invalid agent response (schema).');
      }
      const data = parsed.data as AgentResponse;
      
      const cacCur = toNum(data.cac?.current);
      const cacPrev = toNum(data.cac?.previous);
      const roasCur = toNum(data.roas?.current);
      const roasPrev = toNum(data.roas?.previous);

      const periodData = [
        {
          period: 'Previous' as const,
          CAC: cacPrev,
          ROAS: roasPrev,
          CACRaw: data.cac?.previous ?? '',
          ROASRaw: data.roas?.previous ?? '',
        },
        {
          period: 'Current' as const,
          CAC: cacCur,
          ROAS: roasCur,
          CACRaw: data.cac?.current ?? '',
          ROASRaw: data.roas?.current ?? '',
        },
      ];
      
      const deltas = {
        CAC: toNum(data.cac?.delta_pct),
        ROAS: toNum(data.roas?.delta_pct),
      };
      

      // Transform agent data into chart rows
      const rows: ChartData[] = [];
      if (data.cac) {
        rows.push({
          label: 'CAC',
          current: toNum(data.cac.current),
          previous: toNum(data.cac.previous),
          deltaPct: toNum(data.cac.delta_pct),
        });
      }
      if (data.roas) {
        rows.push({
          label: 'ROAS',
          current: toNum(data.roas.current),
          previous: toNum(data.roas.previous),
          deltaPct: toNum(data.roas.delta_pct),
        });
      }

      // Replace placeholder agent message with final content
      setMsgs((curr) =>
        curr.map((m) =>
          m.id === idBot
            ? {
                id: idBot,
                role: 'agent',
                text: 'Here is your answer:',
                // ↓↓↓ substitua seu antigo m.chartData pelo novo shape ↓↓↓
                chartData: periodData as any,
                meta: { start: data.window?.start, end: data.window?.end },
                loading: false,
                // opcional: guarde os deltas na própria msg se quiser mostrar fora do gráfico
                deltas,
              }
            : m
        )
      );
    } catch (err: any) {
      // On error, replace loading bubble with error text
      setMsgs((curr: ChatMsg[]) =>
        curr.map((m: ChatMsg) =>
          m.role === 'agent' && m.loading
            ? { ...m, loading: false, text: 'Erro ao obter resposta.' }
            : m
        )
      );
      setError(err?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  // Format a delta percentage for display
  function fmtDelta(p?: number) {
    if (!Number.isFinite(p)) return '—';
    const v = ((p ?? 0) * 100).toFixed(2);
    const sign = (p ?? 0) > 0 ? '+' : '';
    return `${sign}${v}%`;
  }

  // Small badge for displaying delta percentage. Green for positive, red for negative.
  function DeltaBadge({ value }: { value?: number }) {
    if (!Number.isFinite(value)) return null;
    const up = (value as number) > 0;
    return (
      <span
        className={
          'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ' +
          (up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
        }
        title="Variação percentual (delta_pct)"
      >
        {up ? '▲' : '▼'} {fmtDelta(value)}
      </span>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Chat messages */}
      <div className="space-y-3">
        {msgs.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl border border-[#BBC7D4] bg-[#E5EDF6] px-4 py-2 text-sm text-gray-800">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id}>
              <div className="max-w-[95%] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {/* small pie icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                  >
                    <circle cx="16" cy="16" r="12" stroke="#6B8DA6" strokeWidth="2" fill="none" />
                    <path d="M16 16 L16 4 A12 12 0 0 1 28 16 Z" fill="#6B8DA6" />
                    <path d="M16 16 L28 16 A12 12 0 0 1 24.56 8.68 Z" fill="#14546F" />
                  </svg>
                  <span className="font-medium">
                    {m.loading ? 'Consultando…' : m.text || 'Resposta'}
                  </span>
                </div>
                {/* Chart and deltas */}
                {m.chartData && (
                  <>
                    {/* Quick summary of deltas as badges */}
                    <div className="mb-3 flex flex-wrap gap-2 text-sm">
                      {m.chartData.map((row) => (
                        <div
                          key={row.label}
                          className="inline-flex items-center rounded-xl border px-2 py-1"
                        >
                          <span className="mr-1 font-medium">{row.label}</span>
                          <DeltaBadge value={row.deltaPct} />
                        </div>
                      ))}
                    </div>
                    <MetricsChart
                      data={m.chartData as any}            // periodData
                      deltas={(m as any).deltas}           // { CAC, ROAS }
                      window={m.meta}
                    />
                    {m.meta?.start && m.meta?.end && (
                      <p className="mt-2 text-xs text-gray-500">
                        Window: {m.meta.start} → {m.meta.end}
                      </p>
                    )}
                  </>
                )}
                {/* When no chart data and not loading, show fallback */}
                {!m.chartData && !m.loading && (
                  <p className="text-sm text-gray-500">
                    Sem métricas retornadas pelo agente.
                  </p>
                )}
              </div>
            </div>
          )
        )}
        {/* Display a static pill with the initial prompt when there are no messages. This pill
            does not update as the user types; the chat history is created only after
            submission. */}
        {msgs.length === 0 && (
          <div className="flex justify-end">
            <div className="max-w-full overflow-auto whitespace-nowrap rounded-lg border border-[#BBC7D4] bg-[#E5EDF6] px-4 py-2 text-sm text-gray-700">
              {initialPrompt}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {/* Input bar */}
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          className="w-full rounded-full border border-[#BBC7D4] bg-[#D8E3EE] px-4 py-3 pr-14 text-sm text-gray-700 shadow-inner placeholder-gray-600 focus:outline-none"
          placeholder="Insert a time window to receive the KPI data."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#14546F] p-3 text-white shadow-md hover:bg-[#0f395a] disabled:opacity-60"
          aria-label="Send"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12h14M14 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}