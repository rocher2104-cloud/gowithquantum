import { makeStyles, tokens } from "@fluentui/react-components";
import type { ResultData } from "../../data/models";
import { accents } from "../../theme/brand";
import { GlossaryTerm } from "../shared/GlossaryTerm";

const useStyles = makeStyles({
  section: { marginBottom: "24px" },
  h: { fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, marginBottom: "14px" },
  metricRow: { marginBottom: "14px" },
  metricLabel: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" },
  metricName: { fontWeight: 600 },
  legend: { display: "flex", gap: "16px", marginBottom: "8px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", display: "inline-block", marginRight: "5px" },
  barTrack: { height: "10px", borderRadius: "5px", background: tokens.colorNeutralBackground4, overflow: "hidden", marginBottom: "3px", position: "relative" },
  barLabel: { fontSize: "11px", color: tokens.colorNeutralForeground3, textAlign: "right" as const },
  crossover: {
    marginTop: "8px",
    padding: "10px 14px",
    background: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
    borderLeft: `3px solid ${accents.quantum}`,
  },
});

function ScalingChart({ data, crossover }: { data: ResultData["advantage"]["scaling"]; crossover: number }) {
  const W = 480, H = 180, PL = 50, PB = 32, PT = 16;
  const chartW = W - PL - 16;
  const chartH = H - PB - PT;

  const sizes = data.map((d) => d.size);
  const allVals = data.flatMap((d) => [d.classical, d.quantum]);
  const maxV = Math.max(...allVals);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  const xScale = (size: number) => PL + ((size - minSize) / (maxSize - minSize)) * chartW;
  const yScale = (v: number) => PT + chartH * (1 - v / maxV);

  const classPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.size)},${yScale(d.classical)}`).join(" ");
  const qPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.size)},${yScale(d.quantum)}`).join(" ");

  const xCross = xScale(crossover);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 190 }}>
      {/* axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + chartH} stroke="#e2e8f0" strokeWidth={1.5} />
      <line x1={PL} y1={PT + chartH} x2={W - 16} y2={PT + chartH} stroke="#e2e8f0" strokeWidth={1.5} />

      {/* crossover line */}
      <line x1={xCross} y1={PT} x2={xCross} y2={PT + chartH} stroke={accents.quantum} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />
      <text x={xCross + 4} y={PT + 12} fontSize={10} fill={accents.quantum}>~{crossover} nodes</text>
      <text x={xCross + 4} y={PT + 23} fontSize={9} fill={accents.quantum}>crossover</text>

      {/* classical curve */}
      <path d={classPath} fill="none" stroke="#94a3b8" strokeWidth={2} />

      {/* quantum curve */}
      <path d={qPath} fill="none" stroke={accents.quantum} strokeWidth={2.5} />

      {/* x labels */}
      {data.filter((_, i) => i % 2 === 0).map((d) => (
        <text key={d.size} x={xScale(d.size)} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.size}</text>
      ))}

      {/* y-axis label */}
      <text x={12} y={PT + chartH / 2} textAnchor="middle" fontSize={10} fill="#94a3b8"
        transform={`rotate(-90, 12, ${PT + chartH / 2})`}>Runtime</text>
    </svg>
  );
}

export function AdvantagePanel({ advantage }: { advantage: ResultData["advantage"] }) {
  const s = useStyles();

  return (
    <div>
      <div className={s.section}>
        <div className={s.h}>
          Quantum vs Classical — <GlossaryTerm term="quantum advantage">Advantage</GlossaryTerm> comparison
        </div>
        <div className={s.legend}>
          <span><span className={s.dot} style={{ background: accents.quantum }} />Quantum</span>
          <span><span className={s.dot} style={{ background: "#94a3b8" }} />Classical</span>
        </div>

        {advantage.metrics.map((m) => (
          <div key={m.label} className={s.metricRow}>
            <div className={s.metricLabel}>
              <span className={s.metricName}>{m.label}</span>
              <span style={{ fontSize: "12px", color: tokens.colorNeutralForeground3, fontFamily: "'DM Mono', monospace" }}>
                Q: {m.quantumLabel} · C: {m.classicalLabel}
              </span>
            </div>
            <div className={s.barTrack}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${m.quantum * 100}%`, background: accents.quantum, borderRadius: "5px", opacity: 0.75 }} />
            </div>
            <div className={s.barTrack} style={{ marginTop: 2 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${m.classical * 100}%`, background: "#94a3b8", borderRadius: "5px" }} />
            </div>
            <div className={s.barLabel}>
              {m.label === "Time to solution"
                ? "Classical is faster today"
                : m.label === "Cost per run"
                ? "Classical is cheaper today"
                : "Equal quality"}
            </div>
          </div>
        ))}
      </div>

      <div className={s.section}>
        <div className={s.h}>Scaling — where the advantage appears</div>
        <ScalingChart data={advantage.scaling} crossover={advantage.crossover} />
        <div className={s.crossover}>
          At ~{advantage.crossover} stops (problem nodes), quantum overtakes classical on runtime. Your current problem has 40 nodes — classical is still faster today, but you're on the right trajectory.
        </div>
      </div>
    </div>
  );
}
