import React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import type { Job } from "../../data/models";
import { accents } from "../../theme/brand";

const PHASES = [
  { label: "Problem intake", stepRange: [0, 0] },
  { label: "Formulation", stepRange: [1, 2] },
  { label: "Experiments", stepRange: [3, 6] },
  { label: "Results", stepRange: [7, 9] },
] as const;

const useStyles = makeStyles({
  bar: {
    display: "flex", alignItems: "center",
    padding: "14px 16px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    marginBottom: "4px",
  },
  step: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "5px", flex: "0 0 auto",
    fontSize: "11px", fontWeight: 600, color: tokens.colorNeutralForeground3,
    letterSpacing: "0.02em", textAlign: "center",
  },
  stepDone: { color: accents.advantage },
  stepActive: { color: tokens.colorNeutralForeground1 },
  dot: { width: "8px", height: "8px", borderRadius: "50%", background: tokens.colorNeutralStroke1 },
  dotDone: { background: accents.advantage },
  dotActive: { background: accents.info, boxShadow: `0 0 0 3px ${accents.infoBg}` },
  line: { flex: 1, height: "1px", background: tokens.colorNeutralStroke2, marginBottom: "14px" },
  lineDone: { background: accents.advantage, opacity: 0.5 },
});

export function PhaseBar({ job }: { job: Job }) {
  const s = useStyles();

  return (
    <div className={s.bar}>
      {PHASES.map((p, i) => {
        const done = job.status === "done" || job.step > p.stepRange[1];
        const active = !done && job.step >= p.stepRange[0] && job.step <= p.stepRange[1];
        return (
          <React.Fragment key={p.label}>
            <div className={`${s.step} ${done ? s.stepDone : active ? s.stepActive : ""}`}>
              <div className={`${s.dot} ${done ? s.dotDone : active ? s.dotActive : ""}`} />
              <span>{p.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`${s.line} ${done ? s.lineDone : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
