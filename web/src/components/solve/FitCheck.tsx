import { makeStyles, tokens } from "@fluentui/react-components";
import { accents } from "../../theme/brand";
import { GlossaryTerm } from "../shared/GlossaryTerm";
import { detectFit, type FitVerdict } from "../../data/fit";

const VERDICT_COLORS: Record<FitVerdict, { fg: string; bg: string; border: string }> = {
  "advantage-today": { fg: accents.advantage, bg: accents.advantageBg, border: accents.advantageBorder },
  "advantage-at-scale": { fg: accents.info, bg: accents.infoBg, border: accents.infoBorder },
  "classical-better": { fg: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
};

const useStyles = makeStyles({
  root: {
    marginTop: "12px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    animation: "fadeIn 0.3s ease",
  },
  head: {
    display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  kicker: {
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  verdictChip: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "3px 10px", borderRadius: "999px",
    fontSize: "12px", fontWeight: 700,
  },
  body: { padding: "12px 16px", fontSize: "13px", color: tokens.colorNeutralForeground2, lineHeight: 1.55 },
  facts: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1px", background: tokens.colorNeutralStroke2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  fact: { background: tokens.colorNeutralBackground1, padding: "10px 16px" },
  factK: { fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, marginBottom: "3px" },
  factV: { fontSize: "13px", fontWeight: 600, color: tokens.colorNeutralForeground1 },
  honesty: {
    padding: "10px 16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "12px", color: tokens.colorNeutralForeground3, lineHeight: 1.5,
    background: tokens.colorNeutralBackground2,
  },
});

const LITERATURE_LABEL: Record<string, string> = {
  proven: "Proven in the literature",
  conjectured: "Conjectured in the literature",
  none: "No known advantage",
  unknown: "Unknown",
};

export function FitCheck({ prompt, domain }: { prompt: string; domain: string }) {
  const s = useStyles();
  const fit = detectFit(prompt, domain);
  const c = VERDICT_COLORS[fit.verdict];

  return (
    <div className={s.root}>
      <div className={s.head}>
        <span className={s.kicker}>⚡ Quantum fit check</span>
        <span className={s.verdictChip} style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}>
          {fit.verdictLabel}
        </span>
      </div>
      <div className={s.body}>
        {fit.message}{" "}
        {fit.verdict !== "classical-better" && (
          <>
            Recommended approach: <GlossaryTerm term={fit.algorithmKey}>{fit.algorithm}</GlossaryTerm>.
          </>
        )}
        {fit.crossoverNote && <> {fit.crossoverNote}</>}
      </div>
      <div className={s.facts}>
        <div className={s.fact}>
          <div className={s.factK}>Evidence</div>
          <div className={s.factV}>{LITERATURE_LABEL[fit.advantageLiterature]}</div>
        </div>
        <div className={s.fact}>
          <div className={s.factK}>Est. cost</div>
          <div className={s.factV}>{fit.estimatedCost}</div>
        </div>
        <div className={s.fact}>
          <div className={s.factK}>Est. time</div>
          <div className={s.factV}>{fit.estimatedTime}</div>
        </div>
        <div className={s.fact}>
          <div className={s.factK}>Backend</div>
          <div className={s.factV}>{fit.provider}</div>
        </div>
      </div>
      <div className={s.honesty}>
        We always benchmark against the best classical method and tell you plainly which one won — including
        when the answer is "don't use quantum for this."
      </div>
    </div>
  );
}
