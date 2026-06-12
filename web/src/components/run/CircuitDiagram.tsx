import type { CircuitModel } from "../../data/models";
import { accents } from "../../theme/brand";

const WIRE_H = 52;
const COL_W = 72;
const LEFT_PAD = 56;
const TOP_PAD = 24;

export function CircuitDiagram({ circuit }: { circuit: CircuitModel }) {
  const w = LEFT_PAD + (circuit.cols + 1) * COL_W + 20;
  const h = TOP_PAD + circuit.qubits * WIRE_H + 20;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ fontFamily: "'DM Mono', monospace", background: "#0d0d1a", borderRadius: 10, maxHeight: 260 }}
      aria-label="Quantum circuit diagram"
    >
      {/* qubit labels + wires */}
      {Array.from({ length: circuit.qubits }, (_, q) => {
        const y = TOP_PAD + q * WIRE_H + WIRE_H / 2;
        return (
          <g key={q}>
            <text x={LEFT_PAD - 8} y={y + 4} textAnchor="end" fontSize={12} fill="#a5b4fc">q[{q}]</text>
            <line x1={LEFT_PAD} y1={y} x2={w - 20} y2={y} stroke="#334155" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* gates */}
      {circuit.gates.map((gate, i) => {
        const cx = LEFT_PAD + (gate.col + 0.5) * COL_W + COL_W * 0.2;
        const cy = TOP_PAD + gate.q * WIRE_H + WIRE_H / 2;

        if (gate.measure) {
          return (
            <g key={i}>
              <rect x={cx - 14} y={cy - 13} width={28} height={26} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#a5b4fc">M</text>
              <path d={`M${cx - 6},${cy + 6} Q${cx},${cy - 4} ${cx + 6},${cy + 6}`} stroke="#818cf8" strokeWidth={1} fill="none" />
              <line x1={cx} y1={cy - 1} x2={cx + 7} y2={cy - 8} stroke="#818cf8" strokeWidth={1} />
            </g>
          );
        }

        if (gate.control != null) {
          const ctrlY = TOP_PAD + gate.control * WIRE_H + WIRE_H / 2;
          return (
            <g key={i}>
              <line x1={cx} y1={ctrlY} x2={cx} y2={cy} stroke="#818cf8" strokeWidth={1.5} />
              <circle cx={cx} cy={ctrlY} r={5} fill={accents.quantum} />
              <rect x={cx - 14} y={cy - 13} width={28} height={26} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#a5b4fc">{gate.label}</text>
            </g>
          );
        }

        const color = gate.label === "H" ? "#0ea5e9" : gate.label.startsWith("R") ? "#10b981" : "#818cf8";
        return (
          <g key={i}>
            <rect x={cx - 14} y={cy - 13} width={28} height={26} rx={4} fill="#1e1b4b" stroke={color} strokeWidth={1.5} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill={color}>{gate.label}</text>
          </g>
        );
      })}

      {/* measurement box at end */}
      <rect x={w - 36} y={TOP_PAD - 10} width={20} height={circuit.qubits * WIRE_H + 16} rx={3} fill="#0f172a" stroke="#1e293b" strokeWidth={1} />
    </svg>
  );
}
