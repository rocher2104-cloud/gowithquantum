import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { ArrowDownloadRegular, DismissRegular } from "@fluentui/react-icons";
import { ReportPanel } from "./ReportPanel";
import { DEFAULT_RESULT } from "../../data/mock";

const useStyles = makeStyles({
  surface: { maxWidth: "660px", maxHeight: "88vh" },
  kicker: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, marginBottom: "4px" },
  content: { overflowY: "auto" },
  stats: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px", background: tokens.colorNeutralStroke2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium, overflow: "hidden", margin: "12px 0",
  },
  stat: { background: tokens.colorNeutralBackground1, padding: "12px 14px" },
  statK: { fontSize: "11px", color: tokens.colorNeutralForeground3, marginBottom: "4px", fontWeight: 500 },
  statV: { fontFamily: "'DM Mono', monospace", fontSize: "17px", fontWeight: 600 },
});

export function ReportDialog({
  open,
  onClose,
  title,
  wsName,
  markdown,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  wsName: string;
  markdown?: string;
}) {
  const s = useStyles();
  const md = markdown ?? DEFAULT_RESULT.reportMarkdown;

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface className={s.surface}>
        <DialogBody>
          <DialogTitle
            action={
              <Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />
            }
          >
            <div className={s.kicker}>Report · {wsName}</div>
            {title}
          </DialogTitle>
          <DialogContent className={s.content}>
            <div className={s.stats}>
              {DEFAULT_RESULT.stats.map(([k, v]) => (
                <div key={k} className={s.stat}>
                  <div className={s.statK}>{k}</div>
                  <div className={s.statV}>{v}</div>
                </div>
              ))}
            </div>
            <ReportPanel markdown={md} />
          </DialogContent>
          <DialogActions>
            <Button icon={<ArrowDownloadRegular />} appearance="primary">
              Download .pdf
            </Button>
            <Button appearance="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
