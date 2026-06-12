import { useNavigate } from "react-router-dom";
import { Card, makeStyles, tokens, ProgressBar } from "@fluentui/react-components";
import type { Job } from "../../data/models";
import { useApp } from "../../store/AppStore";
import { StatusBadge } from "./StatusBadge";
import { accents } from "../../theme/brand";

const ACCENT: Record<Job["status"], string> = {
  running: accents.quantum,
  needs: accents.human,
  done: accents.advantage,
  failed: accents.error,
  queued: tokens.colorNeutralStroke1,
};

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px 16px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: "3px" },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  meta: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    paddingLeft: "1px",
  },
  bottomRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  progressWrap: { flex: 1 },
  pm: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
});

export function JobCard({ job }: { job: Job }) {
  const s = useStyles();
  const navigate = useNavigate();
  const { workspaces } = useApp();
  const ws = workspaces.find((w) => w.id === job.ws);
  const pct = job.status === "done" ? 100 : Math.round((job.step / 9) * 100);

  return (
    <Card className={s.card} onClick={() => navigate(`/run/${job.id}`)}>
      <span className={s.accent} style={{ background: ACCENT[job.status] }} />
      <div className={s.topRow}>
        <div className={s.title}>{job.title}</div>
        <StatusBadge status={job.status} />
      </div>
      <div className={s.meta}>
        {ws?.name} · {job.created}
      </div>
      <div className={s.bottomRow}>
        <div className={s.progressWrap}>
          <ProgressBar value={pct / 100} thickness="medium" color="brand" />
        </div>
        <span className={s.pm}>{job.step}/9</span>
      </div>
    </Card>
  );
}

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}
