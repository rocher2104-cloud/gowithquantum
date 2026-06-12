import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, makeStyles, ProgressBar, tokens } from "@fluentui/react-components";
import { ArrowLeftRegular, PersonRegular } from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { useRunSimulation } from "../store/useRunSimulation";
import { StatusBadge } from "../components/shared/StatusBadge";
import { PhaseBar } from "../components/run/PhaseBar";
import { PlanTimeline } from "../components/run/PlanTimeline";
import { ResultCard } from "../components/run/ResultCard";
import { Inspector } from "../components/run/Inspector";
import { ExplainPanel } from "../components/run/ExplainPanel";
import { ReportDialog } from "../components/run/ReportDialog";
import { DEFAULT_RESULT } from "../data/mock";
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
});

export function RunDetail() {
  const s = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, workspaces } = useApp();
  const job = getJob(Number(id));
  const [reportOpen, setReportOpen] = useState(false);
  useRunSimulation(job?.id); // drives step progression

  if (!job) {
    return <div style={{ padding: 32, color: tokens.colorNeutralForeground3 }}>Job not found.</div>;
  }

  const ws = workspaces.find((w) => w.id === job.ws);
  const pct = job.status === "done" ? 100 : Math.round((job.step / 9) * 100);

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
            <span style={{ fontSize: "12px", color: tokens.colorNeutralForeground3 }}>
              {ws?.name} · Started {job.created}
            </span>
          </div>
        </div>
      </div>

      <div className={s.progress}>
        <ProgressBar value={pct / 100} thickness="medium" color="brand" style={{ flex: 1 }} />
        <span className={s.rpTxt}>
          Step {job.status === "done" ? 9 : job.step} of 9 · {pct}%
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

      {job.status === "done" && (
        <>
          <ResultCard result={DEFAULT_RESULT} onViewReport={() => setReportOpen(true)} />
          <Inspector result={DEFAULT_RESULT} />
          <ExplainPanel />
        </>
      )}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={job.title}
        wsName={ws?.name ?? ""}
        markdown={job.report}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
