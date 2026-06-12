import type { LiteraturePaper } from "../../data/models";
import { accents } from "../../theme/brand";

interface CitationGraphProps {
  papers: LiteraturePaper[];
  onSelect?: (paper: LiteraturePaper) => void;
}

const FAMILY_COLORS: Record<string, string> = {
  QAOA: accents.quantum,
  VQE: accents.info,
  HHL: accents.advantage,
  Grover: "#f59e0b",
  Annealing: "#ef4444",
  Shor: "#8b5cf6",
  QMC: "#06b6d4",
};

// Fixed positions for up to 8 papers in a circle layout
const POSITIONS = [
  [200, 100], [340, 130], [420, 230], [360, 350],
  [220, 380], [90, 310], [50, 180], [130, 60],
];

export function CitationGraph({ papers, onSelect }: CitationGraphProps) {
  const shown = papers.slice(0, 8);
  const maxCitations = Math.max(...shown.map((p) => p.citationCount), 1);

  return (
    <svg viewBox="0 0 480 440" width="100%" style={{ maxHeight: 440 }} aria-label="Citation graph">
      {/* Background */}
      <rect width="480" height="440" fill="#f8fafc" rx={8} />

      {/* Edges (simple connections between adjacent nodes for visual structure) */}
      {shown.map((_, i) => {
        const [x1, y1] = POSITIONS[i];
        const j = (i + 1) % shown.length;
        const [x2, y2] = POSITIONS[j];
        return (
          <line key={`e-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
        );
      })}

      {/* Nodes */}
      {shown.map((paper, i) => {
        const [cx, cy] = POSITIONS[i];
        const r = 14 + (paper.citationCount / maxCitations) * 22;
        const color = FAMILY_COLORS[paper.algorithmFamily] ?? "#64748b";
        const initials = paper.algorithmFamily.slice(0, 2);

        return (
          <g key={paper.id} style={{ cursor: "pointer" }} onClick={() => onSelect?.(paper)}>
            <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.18} />
            <circle cx={cx} cy={cy} r={r - 3} fill={color} opacity={0.85} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight="700" fill="#fff">{initials}</text>
            <text x={cx} y={cy + r + 12} textAnchor="middle" fontSize={9} fill="#334155"
              style={{ maxWidth: 80 }}>
              {paper.year}
            </text>
            <text x={cx} y={cy + r + 22} textAnchor="middle" fontSize={8} fill="#64748b">
              {paper.citationCount.toLocaleString()} cit.
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {Object.entries(FAMILY_COLORS).slice(0, 5).map(([family, color], i) => (
        <g key={family}>
          <circle cx={12} cy={16 + i * 16} r={5} fill={color} />
          <text x={22} y={20 + i * 16} fontSize={9} fill="#334155">{family}</text>
        </g>
      ))}
    </svg>
  );
}
