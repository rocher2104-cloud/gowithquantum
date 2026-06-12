import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, makeStyles, ProgressBar, tokens } from "@fluentui/react-components";
import { ArrowLeftRegular, BeakerRegular, PersonRegular } from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { useRunSimulation } from "../store/useRunSimulation";
import { StatusBadge } from "../components/shared/StatusBadge";
import { VerdictBadge } from "../components/shared/VerdictBadge";
import { PhaseBar } from "../components/run/PhaseBar";
import { PlanTimeline } from "../components/run/PlanTimeline";
import { ResultCard } from "../components/run/ResultCard";
import { Inspector } from "../components/run/Inspector";
import { ExplainPanel } from "../components/run/ExplainPanel";
import { ReportDialog } from "../components/run/ReportDialog";
import { STEPS } from "../data/mock";
import { generateResult } from "../protocol/generateResult";
import { timeAgo } from "../lib/time";
import { accents } from "../theme/brand";

const useStyles = makeStyles({
  back: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    color: tokens.colorNeutralForeground2, fontSize: "13px", fontWeight: 500,
    background: "transparent", border: "0", cursor: "pointer", padding: "6px 0", marginBottom: "16px",
    ":hover": { color: tokens.colorNeutralForeground1 },
  },
  head: { display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "8px" },
  title: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.25 },
  meta: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  progress: { margin: "20px 0 4px", display: "flex", alignItems: "center", gap: "12px" },
  rpTxt: { fontFamily: "'DM Mono', monospace", fontSize: "12px", color: tokens.colorNeutralForeground2, whiteSpace: "nowrap" },
  hitl: {
    display: "flex", alignItems: "center", gap: "12px",
    border: `1px solid ${accents.humanBorder}`, borderLeft: `3px solid ${accents.human}`,
    borderRadius: tokens.borderRadiusLarge, background: accents.humanBg,
    padding: "12px 14px", margin: "16px 0",
  },
  hitlIc: {
    width: "30px", height: "30px", borderRadius: tokens.borderRadiusMedium,
    background: accents.human, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0,
  },
  science: {
    marginTop: "20px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  scienceHead: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "13px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  scienceGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1px", background: tokens.colorNeutralStroke2,
  },
  artifact: {
    background: tokens.colorNeutralBackground1, padding: "12px 16px",
    border: 0, textAlign: "left", cursor: "pointer", fontFamily: tokens.fontFamilyBase,
    ":hover": { background: tokens.colorNeutralBackground2 },
  },
  artifactT: { fontSize: "13px", fontWeight: 600, color: tokens.colorNeutralForeground1, marginBottom: "3px" },
  artifactD: { fontSize: "11.5px", color: tokens.colorNeutralForeground3, lineHeight: 1.4 },
});

/** The researcher workflow, reframed as artifacts the agent produced for this
 * run. In guided mode this is the only doorway into those pages. */
const ARTIFACTS = [
  { label: "Problem brief", desc: "How we formalised your problem", path: "/intake" },
  { label: "Literature review", desc: "The papers that justify the approach", path: "/literature" },
  { label: "Algorithm design", desc: "The circuit and parameters we chose", path: "/algorithm" },
  { label: "Simulation results", desc: "Convergence and noise analysis", path: "/simulation" },
  { label: "Hardware execution", desc: "Backend, shots, and error mitigation", path: "/hardware" },
  { label: "Resource estimate", desc: "What full scale would require", path: "/resource-estimation" },
];

export function RunDetail() {
  const s = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, workspaces } = useApp();
  const job = id ? getJob(id) : undefined;
  const [reportOpen, setReportOpen] = useState(false);
  useRunSimulation(job?.id);

  if (!job) {
    return <div style={{ padding: 32, color: tokens.colorNeutralForeground3 }}>Job not found.</div>;
  }

  const ws = workspaces.find((w) => w.id === job.ws);
  const total = STEPS.length;
  const pct = job.status === "done" ? 100 : Math.round((job.step / total) * 100);
  const result = job.status === "done" ? job.result ?? generateResult(job.title, job.domain ?? "") : undefined;

  return (
    <>
      <button className={s.back} onClick={() => navigate(-1)}>
        <ArrowLeftRegular fontSize={15} /> Back
      </button>

      <div className={s.head}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className={s.title}>{job.title}</h1>
          <div className={s.meta}>
            <StatusBadge status={job.status} />
            {result && <VerdictBadge verdictClass={result.verdictClass} label={result.verdictLabel} size="medium" />}
            <span style={{ fontSize: "12px", color: tokens.colorNeutralForeground3 }}>
              {ws?.name} · Started {timeAgo(job.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className={s.progress}>
        <ProgressBar value={pct / 100} thickness="medium" color="brand" style={{ flex: 1 }} />
        <span className={s.rpTxt}>
          Step {job.status === "done" ? total : job.step} of {total} · {pct}%
        </span>
      </div>

      <PhaseBar job={job} />

      {job.status === "needs" && (
        <div className={s.hitl}>
          <div className={s.hitlIc}><PersonRegular fontSize={15} /></div>
          <div>
            <strong>Your decision needed.</strong>{" "}
            <span style={{ color: tokens.colorNeutralForeground2, fontSize: "13px" }}>
              We've paused here so you can review before we continue.
            </span>
          </div>
        </div>
      )}

      <PlanTimeline job={job} />

      {job.status === "done" && result && (
        <>
          <ResultCard result={result} onViewReport={() => setReportOpen(true)} />
          <Inspector result={result} />
          <ExplainPanel result={result} />
        </>
      )}

      <div className={s.science}>
        <div className={s.scienceHead}>
          <BeakerRegular fontSize={16} />
          Behind the scenes — the science for this run
        </div>
        <div className={s.scienceGrid}>
          {ARTIFACTS.map((a) => (
            <button key={a.path} className={s.artifact} onClick={() => navigate(a.path)}>
              <div className={s.artifactT}>{a.label}</div>
              <div className={s.artifactD}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={job.title}
        wsName={ws?.name ?? ""}
        markdown={job.report ?? result?.reportMarkdown}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
