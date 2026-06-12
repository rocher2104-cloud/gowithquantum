import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { ArrowDownloadRegular, DocumentRegular } from "@fluentui/react-icons";
import type { ResultData } from "../../data/models";
import { accents } from "../../theme/brand";

const VERDICT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  "vb-advantage": { bg: accents.advantageBg, color: accents.advantage, border: accents.advantageBorder },
  "vb-hybrid": { bg: accents.infoBg, color: accents.info, border: accents.infoBorder },
  "vb-neutral": { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

const useStyles = makeStyles({
  root: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    padding: "20px",
    marginTop: "20px",
  },
  badge: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px", borderRadius: tokens.borderRadiusSmall,
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: "14px",
  },
  headline: { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px", lineHeight: 1.3 },
  body: { color: tokens.colorNeutralForeground2, fontSize: "14px", margin: "0 0 14px", lineHeight: 1.6 },
  stats: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px", background: tokens.colorNeutralStroke2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium, overflow: "hidden", marginBottom: "16px",
  },
  stat: { background: tokens.colorNeutralBackground1, padding: "12px 14px" },
  statK: { fontSize: "11px", color: tokens.colorNeutralForeground3, marginBottom: "4px", fontWeight: 500 },
  statV: { fontFamily: "'DM Mono', monospace", fontSize: "19px", fontWeight: 600 },
  verdict: { color: tokens.colorNeutralForeground2, fontSize: "14px", margin: "0 0 16px", lineHeight: 1.6 },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" },
});

export function ResultCard({
  result,
  onViewReport,
}: {
  result: ResultData;
  onViewReport: () => void;
}) {
  const s = useStyles();
  const vs = VERDICT_STYLES[result.verdictClass] ?? VERDICT_STYLES["vb-neutral"];

  return (
    <div className={s.root}>
      <div
        className={s.badge}
        style={{ background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}
      >
        {result.verdictLabel}
      </div>
      <h3 className={s.headline}>{result.headline}</h3>
      <p className={s.body}>{result.body}</p>
      <div className={s.stats}>
        {result.stats.map(([k, v]) => (
          <div key={k} className={s.stat}>
            <div className={s.statK}>{k}</div>
            <div className={s.statV}>{v}</div>
          </div>
        ))}
      </div>
      <p className={s.verdict}>{result.verdict.replace(/\*(.*?)\*/g, "$1")}</p>
      <div className={s.actions}>
        <Button appearance="primary" icon={<DocumentRegular />} onClick={onViewReport}>
          View full report
        </Button>
        <Button icon={<ArrowDownloadRegular />}>Download</Button>
        <Button appearance="subtle">Save to Outputs</Button>
      </div>
    </div>
  );
}
