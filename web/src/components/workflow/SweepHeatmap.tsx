import { accents } from "../../theme/brand";

interface SweepHeatmapProps {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
  xLabel?: string;
  yLabel?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function heatColor(value: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  // White (#ffffff) → Violet (#7C3AED)
  const r = Math.round(lerp(255, 124, t));
  const g = Math.round(lerp(255, 58, t));
  const b = Math.round(lerp(255, 237, t));
  return `rgb(${r},${g},${b})`;
}

const PAD_L = 40;
const PAD_B = 36;
const PAD_T = 16;
const PAD_R = 16;
const CELL_W = 28;
const CELL_H = 24;

export function SweepHeatmap({ data, xLabels, yLabels, xLabel = "gamma", yLabel = "beta" }: SweepHeatmapProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const allVals = data.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  const w = PAD_L + cols * CELL_W + PAD_R;
  const h = PAD_T + rows * CELL_H + PAD_B;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxHeight: h }} aria-label="Hyperparameter sweep heatmap">
      {/* Cells */}
      {data.map((row, ri) =>
        row.map((val, ci) => {
          const x = PAD_L + ci * CELL_W;
          const y = PAD_T + ri * CELL_H;
          const color = heatColor(val, minVal, maxVal);
          return (
            <g key={`${ri}-${ci}`}>
              <rect x={x} y={y} width={CELL_W - 1} height={CELL_H - 1} fill={color} />
              {CELL_W >= 24 && CELL_H >= 20 && (
                <text x={x + CELL_W / 2} y={y + CELL_H / 2 + 3} textAnchor="middle" fontSize={7} fill={val > (minVal + maxVal) / 2 ? "#fff" : "#334155"}>
                  {val.toFixed(2)}
                </text>
              )}
            </g>
          );
        })
      )}

      {/* X axis labels */}
      {xLabels.map((label, ci) => (
        <text key={ci} x={PAD_L + ci * CELL_W + CELL_W / 2} y={h - PAD_B + 12}
          textAnchor="middle" fontSize={8} fill="#64748b">{label}</text>
      ))}

      {/* Y axis labels */}
      {yLabels.map((label, ri) => (
        <text key={ri} x={PAD_L - 4} y={PAD_T + ri * CELL_H + CELL_H / 2 + 3}
          textAnchor="end" fontSize={8} fill="#64748b">{label}</text>
      ))}

      {/* Axis labels */}
      <text x={PAD_L + cols * CELL_W / 2} y={h - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">{xLabel}</text>
      <text x={8} y={PAD_T + rows * CELL_H / 2} textAnchor="middle" fontSize={9} fill="#94a3b8"
        transform={`rotate(-90, 8, ${PAD_T + rows * CELL_H / 2})`}>{yLabel}</text>

      {/* Color scale */}
      <defs>
        <linearGradient id="heatScale" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={accents.quantum} />
        </linearGradient>
      </defs>
      <rect x={w - PAD_R - 60} y={PAD_T} width={44} height={8} fill="url(#heatScale)" />
      <text x={w - PAD_R - 60} y={PAD_T + 18} fontSize={7} fill="#94a3b8">lo</text>
      <text x={w - PAD_R - 20} y={PAD_T + 18} textAnchor="end" fontSize={7} fill="#94a3b8">hi</text>
    </svg>
  );
}
