import { useState } from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import {
  CheckmarkCircleRegular,
  PersonRegular,
  ChevronDownRegular,
  ChevronUpRegular,
} from "@fluentui/react-icons";
import type { Job } from "../../data/models";
import { STEPS } from "../../data/mock";
import { accents } from "../../theme/brand";
import { GlossaryTerm } from "../shared/GlossaryTerm";
import { useRunSimulation } from "../../store/useRunSimulation";

type StepState = "done" | "running" | "needs" | "pending";

function stepState(index: number, job: Job): StepState {
  if (job.status === "done") return "done";
  if (index < job.step) return "done";
  if (index === job.step) {
    if (job.status === "needs") return "needs";
    if (job.status === "running") return "running";
    return "pending";
  }
  return "pending";
}

const useStyles = makeStyles({
  plan: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    marginTop: "20px",
  },
  planTop: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  step: { display: "grid", gridTemplateColumns: "22px 1fr", gap: "13px", padding: "0 16px" },
  rail: { display: "flex", flexDirection: "column", alignItems: "center" },
  line: { width: "2px", flex: 1, background: tokens.colorNeutralStroke2, margin: "4px 0", minHeight: "12px" },
  lineDone: { background: accents.advantage, opacity: 0.4 },
  smain: { paddingBottom: "13px", paddingTop: "9px", minWidth: 0 },
  head: { display: "flex", alignItems: "center", gap: "9px", cursor: "pointer" },
  title: { fontSize: "14px", fontWeight: 600 },
  titlePending: { color: tokens.colorNeutralForeground3 },
  owner: {
    display: "inline-flex", alignItems: "center", gap: "4px",
    fontSize: "11px", fontWeight: 600, color: tokens.colorNeutralForeground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusSmall,
    padding: "2px 6px",
  },
  ownerHuman: { color: accents.humanText, borderTopColor: accents.humanBorder, borderRightColor: accents.humanBorder, borderBottomColor: accents.humanBorder, borderLeftColor: accents.humanBorder, background: accents.humanBg },
  stat: { marginLeft: "auto", fontSize: "12px", color: tokens.colorNeutralForeground3 },
  statRunning: { color: accents.info },
  statNeeds: { color: accents.human },
  notes: { listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "6px" },
  note: {
    position: "relative", paddingLeft: "15px",
    fontSize: "13px", color: tokens.colorNeutralForeground2, lineHeight: 1.5,
    "::before": { content: '""', position: "absolute", left: "2px", top: "8px", width: "4px", height: "4px", borderRadius: "50%", background: tokens.colorNeutralStroke1 },
  },
  gate: {
    marginTop: "12px",
    border: `1px solid ${accents.humanBorder}`, borderLeft: `3px solid ${accents.human}`,
    borderRadius: tokens.borderRadiusMedium, background: accents.humanBg, padding: "14px",
  },
  gateQ: { fontSize: "14px", fontWeight: 600, marginBottom: "4px" },
  gateD: { fontSize: "13px", color: tokens.colorNeutralForeground2, marginBottom: "12px", lineHeight: 1.55 },
  gateActions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  costLine: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginBottom: "10px" },
  costAmt: { fontFamily: "'DM Mono', monospace", fontWeight: 600, color: tokens.colorNeutralForeground1 },
});

function NodeIcon({ state }: { state: StepState }) {
  if (state === "done") return <CheckmarkCircleRegular fontSize={22} style={{ color: accents.advantage, flexShrink: 0 }} />;
  if (state === "needs") return (
    <span style={{
      width: 22, height: 22, borderRadius: "50%", background: accents.human, color: "#fff",
      display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>!</span>
  );
  if (state === "running") return (
    <span style={{
      width: 22, height: 22, borderRadius: "50%", border: `2px solid ${tokens.colorNeutralStroke1}`,
      display: "grid", placeItems: "center", flexShrink: 0,
      borderTopColor: accents.info,
      animation: "spin 0.8s linear infinite",
    }} />
  );
  return <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${tokens.colorNeutralStroke2}`, flexShrink: 0 }} />;
}

export function PlanTimeline({ job }: { job: Job }) {
  const s = useStyles();
  const { resolveGate } = useRunSimulation(job.id);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const pct = job.status === "done" ? 100 : Math.round((job.step / 9) * 100);
  const toggleOpen = (i: number) => setOpen((prev) => ({ ...prev, [i]: !prev[i] }));
  const isOpen = (i: number, st: StepState) => open[i] ?? (st === "needs" || st === "running");

  return (
    <div className={s.plan}>
      <div className={s.planTop}>
        <span>Process plan</span>
        <span style={{ textTransform: "none", fontWeight: 500, color: tokens.colorNeutralForeground3 }}>
          Step {job.status === "done" ? 9 : job.step} of 9 · {pct}%
        </span>
      </div>
      {STEPS.map((step, i) => {
        const st = stepState(i, job);
        const expanded = isOpen(i, st);
        return (
          <div key={i} className={s.step}>
            <div className={s.rail}>
              <NodeIcon state={st} />
              {i < STEPS.length - 1 && (
                <div className={`${s.line} ${st === "done" ? s.lineDone : ""}`} />
              )}
            </div>
            <div className={s.smain}>
              <div className={s.head} onClick={() => toggleOpen(i)}>
                <span className={`${s.title} ${st === "pending" ? s.titlePending : ""}`}>{step.t}</span>
                <span className={`${s.owner} ${step.human ? s.ownerHuman : ""}`}>
                  {step.human && <PersonRegular fontSize={11} />}
                  {step.owner}
                </span>
                <span className={`${s.stat} ${st === "running" ? s.statRunning : st === "needs" ? s.statNeeds : ""}`}>
                  {st === "done" ? "Done" : st === "running" ? "Working…" : st === "needs" ? "Needs you" : ""}
                </span>
                {expanded ? <ChevronUpRegular fontSize={14} style={{ color: tokens.colorNeutralForeground3, marginLeft: "auto" }} /> : <ChevronDownRegular fontSize={14} style={{ color: tokens.colorNeutralForeground3, marginLeft: "auto" }} />}
              </div>
              {expanded && (
                <div>
                  <ul className={s.notes}>
                    {(st === "pending" ? [step.hint] : step.notes).map((n, ni) => (
                      <li key={ni} className={s.note}>{n}</li>
                    ))}
                  </ul>
                  {st === "needs" && step.gate && (
                    <GatePanel gate={step.gate} onAction={resolveGate} />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GatePanel({ gate, onAction }: { gate: "hardware" | "improve"; onAction: ReturnType<typeof useRunSimulation>["resolveGate"] }) {
  const s = useStyles();
  if (gate === "hardware") {
    return (
      <div className={s.gate}>
        <div className={s.gateQ}>Ready to run on a real quantum computer?</div>
        <div className={s.costLine}>
          Estimated cost: <span className={s.costAmt}>~$7.50</span> · Queue time: <span className={s.costAmt}>~6 min</span>
        </div>
        <div className={s.gateD}>
          This sends your experiment to actual quantum hardware. It uses some of your compute credits. You can keep using the simulator instead.
        </div>
        <div className={s.gateActions}>
          <Button appearance="primary" onClick={() => onAction("approve")}>Approve & run on hardware</Button>
          <Button appearance="secondary" onClick={() => onAction("sim")}>Keep using simulator</Button>
          <Button appearance="subtle" onClick={() => onAction("hold")}>Hold for now</Button>
        </div>
      </div>
    );
  }
  return (
    <div className={s.gate}>
      <div className={s.gateQ}>Refine further, or accept this result?</div>
      <div className={s.gateD}>
        A deeper circuit might improve the answer slightly, but takes longer and costs more credits. You decide how far to push it.
      </div>
      <div className={s.gateActions}>
        <Button appearance="secondary" onClick={() => onAction("iterate")}>Try to improve it</Button>
        <Button appearance="primary" onClick={() => onAction("accept")}>Accept this result</Button>
      </div>
    </div>
  );
}
