import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { EXPERIMENTS } from "../data/mock";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { StatusBadge } from "../components/shared/StatusBadge";
import type { JobStatus } from "../data/models";

const useStyles = makeStyles({
  wrap: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    padding: "10px 14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
    textTransform: "uppercase", color: tokens.colorNeutralForeground3,
    background: tokens.colorNeutralBackground3, textAlign: "left" as const,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  td: {
    padding: "10px 14px", fontSize: "13px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ":last-child": { borderBottom: "0" },
  },
  tdMono: { fontFamily: "'DM Mono', monospace", fontSize: "12px" },
  method: { fontWeight: 500 },
  verdict: { color: tokens.colorNeutralForeground2 },
});

const EXP_STATUS_MAP: Record<string, JobStatus> = {
  done: "done", running: "running", failed: "failed", queued: "queued",
};

export function Experiments() {
  const s = useStyles();
  return (
    <>
      <PageHeader
        title="Experiment Lab"
        sub="Every algorithm run, side by side. Compare approaches, track cost, and see where quantum made a difference."
      />
      <SectionRow title="All runs" action={<Button size="small" appearance="subtle">Export CSV</Button>} />
      <div className={s.wrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {["Run", "Method", "Status", "Cost", "Quality", "Verdict"].map((h) => (
                <th key={h} className={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EXPERIMENTS.map((e) => (
              <tr key={e.run}>
                <td className={`${s.td} ${s.tdMono}`}>{e.run}</td>
                <td className={`${s.td} ${s.method}`}>{e.method}</td>
                <td className={s.td}><StatusBadge status={EXP_STATUS_MAP[e.status]} /></td>
                <td className={`${s.td} ${s.tdMono}`}>{e.cost}</td>
                <td className={`${s.td} ${s.tdMono}`}>{e.quality}</td>
                <td className={`${s.td} ${s.verdict}`}>{e.verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
