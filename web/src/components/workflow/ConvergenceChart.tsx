import { accents } from "../../theme/brand";

interface DataPoint {
  iteration: number;
  energy: number;
}

interface ConvergenceChartProps {
  data: DataPoint[];
  noisyData?: DataPoint[];
  width?: number;
  height?: number;
}

const PAD_L = 48;
const PAD_B = 32;
const PAD_T = 16;
const PAD_R = 16;

export function ConvergenceChart({ data, noisyData, width = 500, height = 200 }: ConvergenceChartProps) {
  const allData = [...data, ...(noisyData ?? [])];
  const minE = Math.min(...allData.map((d) => d.energy)) - 0.05;
  const maxE = Math.max(...allData.map((d) => d.energy)) + 0.05;
  const maxIter = Math.max(...allData.map((d) => d.iteration));

  const chartW = width - PAD_L - PAD_R;
  const chartH = height - PAD_B - PAD_T;

  const toX = (i: number) => PAD_L + ((i - 1) / (maxIter - 1)) * chartW;
  const toY = (e: number) => PAD_T + (1 - (e - minE) / (maxE - minE)) * chartH;

  const polyline = (pts: DataPoint[]) =>
    pts.map((d) => `${toX(d.iteration)},${toY(d.energy)}`).join(" ");

  const yTicks = Array.from({ length: 5 }, (_, i) => minE + (i / 4) * (maxE - minE));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxHeight: height }}
      aria-label="Convergence chart"
    >
      {/* Grid lines */}
      {yTicks.map((e, i) => {
        const y = toY(e);
        return (
          <g key={i}>
            <line x1={PAD_L} y1={y} x2={width - PAD_R} y2={y} stroke="#e2e8f0" strokeWidth={i === 0 ? 1.5 : 1} strokeDasharray={i === 0 ? "0" : "3 3"} />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{e.toFixed(2)}</text>
          </g>
        );
      })}

      {/* X axis ticks */}
      {[1, Math.round(maxIter / 3), Math.round(maxIter * 2 / 3), maxIter].map((iter) => (
        <text key={iter} x={toX(iter)} y={height - 6} textAnchor="middle" fontSize={9} fill="#94a3b8">{iter}</text>
      ))}

      {/* Noisy line */}
      {noisyData && noisyData.length > 0 && (
        <polyline
          points={polyline(noisyData)}
          fill="none"
          stroke={accents.human}
          strokeWidth={1.5}
          strokeOpacity={0.7}
          strokeDasharray="4 2"
        />
      )}

      {/* Clean line */}
      <polyline
        points={polyline(data)}
        fill="none"
        stroke={accents.quantum}
        strokeWidth={2}
      />

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={PAD_L} y1={PAD_T + chartH} x2={width - PAD_R} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />

      {/* Labels */}
      <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" fontSize={9} fill="#94a3b8"
        transform={`rotate(-90, 12, ${PAD_T + chartH / 2})`}>Energy</text>
      <text x={PAD_L + chartW / 2} y={height - 1} textAnchor="middle" fontSize={9} fill="#94a3b8">Iteration</text>

      {/* Legend */}
      {noisyData && (
        <>
          <line x1={width - 90} y1={PAD_T + 8} x2={width - 70} y2={PAD_T + 8} stroke={accents.quantum} strokeWidth={2} />
          <text x={width - 66} y={PAD_T + 12} fontSize={9} fill="#64748b">Noiseless</text>
          <line x1={width - 90} y1={PAD_T + 20} x2={width - 70} y2={PAD_T + 20} stroke={accents.human} strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={width - 66} y={PAD_T + 24} fontSize={9} fill="#64748b">Noisy</text>
        </>
      )}
    </svg>
  );
}
