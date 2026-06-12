import { useNavigate } from "react-router-dom";
import { Button, Card, makeStyles, tokens } from "@fluentui/react-components";
import { DocumentRegular } from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { PageHeader } from "../components/shared/PageHeader";
import { EmptyState } from "../components/shared/EmptyState";
import { timeAgo } from "../lib/time";

const useStyles = makeStyles({
  card: { display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", cursor: "pointer" },
  ic: {
    width: "36px", height: "36px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground3, display: "grid", placeItems: "center", flexShrink: 0,
  },
  mid: { flex: 1, minWidth: 0 },
  title: { fontSize: "14px", fontWeight: 600, color: tokens.colorNeutralForeground1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  meta: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "2px" },
});

export function Outputs() {
  const s = useStyles();
  const navigate = useNavigate();
  const { jobs, currentWs } = useApp();
  const done = jobs.filter((j) => j.ws === currentWs && j.status === "done");

  return (
    <>
      <PageHeader
        title="Outputs"
        sub="A complete record of every result this workspace has produced. Nothing gets lost."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {done.length > 0 ? (
          done.map((j) => (
            <Card key={j.id} className={s.card} onClick={() => navigate(`/run/${j.id}`)}>
              <div className={s.ic}><DocumentRegular fontSize={18} color="gray" /></div>
              <div className={s.mid}>
                <div className={s.title}>{j.title}</div>
                <div className={s.meta}>Report · {timeAgo(j.createdAt)}</div>
              </div>
              <Button appearance="secondary" size="small">View report</Button>
            </Card>
          ))
        ) : (
          <EmptyState title="No outputs yet">Finished problems will appear here.</EmptyState>
        )}
      </div>
    </>
  );
}
