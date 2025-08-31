'use client';

import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

type PeriodRow = {
  period: 'Previous' | 'Current';
  CAC?: number;
  ROAS?: number;
  // valores crus vindos do agente (para labels e tooltip)
  CACRaw?: string;
  ROASRaw?: string;
};

type Props = {
  data: PeriodRow[]; // [{period:'Previous',...}, {period:'Current',...}]
  deltas?: { CAC?: number; ROAS?: number };
  window?: { start?: string; end?: string } | null;
};

const nfAxis = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});
const nfLabel = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  minimumFractionDigits: 0,
});

function fmtAxis(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? nfAxis.format(n) : '—';
}
function fmtLabel(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? nfLabel.format(n) : '—';
}
function fmtDelta(d?: number) {
  if (!Number.isFinite(d)) return '—';
  const sign = (d as number) > 0 ? '+' : '';
  return `${sign}${((d as number) * 100).toFixed(2)}%`;
}

export default function MetricsChart({ data, deltas, window }: Props) {
  const tooltipFormatter = (value: any, name: string, props: any) => {
    const row: PeriodRow | undefined = props?.payload;
    const isCurrent = row?.period === 'Current';

    const raw =
      name === 'CAC' ? row?.CACRaw ?? value : name === 'ROAS' ? row?.ROASRaw ?? value : value;

    let extra = '';
    if (isCurrent) {
      if (name === 'CAC' && Number.isFinite(deltas?.CAC)) extra = ` (Δ ${fmtDelta(deltas?.CAC)})`;
      if (name === 'ROAS' && Number.isFinite(deltas?.ROAS)) extra = ` (Δ ${fmtDelta(deltas?.ROAS)})`;
    }

    return [`${raw}${extra}`, name];
  };

  const labelCAC = (_: any, __: any, payload: any) =>
    payload?.payload?.CACRaw ?? fmtLabel(payload?.value);
  const labelROAS = (_: any, __: any, payload: any) =>
    payload?.payload?.ROASRaw ?? fmtLabel(payload?.value);

  return (
    <div className="h-80 w-full rounded-2xl border border-slate-200 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24} maxBarSize={56}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#334155', fontSize: 12 }}
            axisLine={{ stroke: '#CBD5E1' }}
          />
          <YAxis
            tick={{ fill: '#334155', fontSize: 12 }}
            tickFormatter={fmtAxis}
            tickCount={5}
            axisLine={{ stroke: '#CBD5E1' }}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(l: any) => `Period: ${l}`}
            contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0' }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ paddingBottom: 8 }}
          />
          <Bar dataKey="CAC" name="CAC" fill="#82A9FF" radius={[8, 8, 0, 0]}>
            <LabelList dataKey="CAC" position="top" formatter={labelCAC} fill="#0f172a" />
          </Bar>
          <Bar dataKey="ROAS" name="ROAS" fill="#F69B9B" radius={[8, 8, 0, 0]}>
            <LabelList dataKey="ROAS" position="top" formatter={labelROAS} fill="#0f172a" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
