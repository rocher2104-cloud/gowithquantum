import type { HistogramBar } from "../../data/models";
import { accents } from "../../theme/brand";

export function Histogram({ bars, shots }: { bars: HistogramBar[]; shots: number }) {
  const max = Math.max(...bars.map((b) => b.count));
  const W = 520;
  const H = 200;
  const PAD_L = 44;
  const PAD_B = 36;
  const PAD_T = 16;
  const chartW = W - PAD_L - 16;
  const chartH = H - PAD_B - PAD_T;
  const barW = Math.min(48, Math.floor(chartW / bars.length) - 8);
  const gap = (chartW - barW * bars.length) / (bars.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 220 }} aria-label="Measurement histogram">
      {/* y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD_T + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD_L} y1={y} x2={W - 16} y2={y} stroke="#e2e8f0" strokeWidth={t === 0 ? 1.5 : 1} strokeDasharray={t === 0 ? "0" : "3 3"} />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              {Math.round(t * max)}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {bars.map((bar, i) => {
        const bh = (bar.count / max) * chartH;
        const x = PAD_L + gap + i * (barW + gap);
        const y = PAD_T + chartH - bh;
        const pct = ((bar.count / shots) * 100).toFixed(1);
        return (
          <g key={bar.state}>
            <rect x={x} y={y} width={barW} height={bh} rx={3} fill={accents.quantum} opacity={0.85} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={accents.quantum} fontWeight={600}>{pct}%</text>
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="'DM Mono', monospace">{bar.state}</text>
          </g>
        );
      })}

      {/* axis */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={PAD_L} y1={PAD_T + chartH} x2={W - 16} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />

      {/* y-label */}
      <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" fontSize={10} fill="#94a3b8"
        transform={`rotate(-90, 12, ${PAD_T + chartH / 2})`}>Counts</text>
    </svg>
  );
}
