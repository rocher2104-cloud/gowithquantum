import { Badge, makeStyles } from "@fluentui/react-components";
import type { JobStatus } from "../../data/models";

const LABEL: Record<JobStatus, string> = {
  queued: "Queued",
  running: "Running",
  needs: "Needs you",
  done: "Done",
  failed: "Failed",
};

type FluentColor = "brand" | "danger" | "important" | "informative" | "severe" | "subtle" | "success" | "warning";

const COLOR: Record<JobStatus, FluentColor> = {
  queued: "subtle",
  running: "informative",
  needs: "warning",
  done: "success",
  failed: "danger",
};

const useStyles = makeStyles({
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "currentColor",
    display: "inline-block",
    marginRight: "5px",
  },
  pulse: { animationName: { "50%": { opacity: 0.25 } }, animationDuration: "1.3s", animationIterationCount: "infinite" },
});

export function StatusBadge({ status }: { status: JobStatus }) {
  const s = useStyles();
  const pulsing = status === "running" || status === "needs";
  return (
    <Badge appearance="tint" color={COLOR[status]} size="medium">
      <span className={`${s.dot} ${pulsing ? s.pulse : ""}`} />
      {LABEL[status]}
    </Badge>
  );
}
