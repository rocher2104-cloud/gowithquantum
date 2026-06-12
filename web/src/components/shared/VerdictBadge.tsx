import type { VerdictClass } from "../../data/models";
import { accents } from "../../theme/brand";

/** The Advantage Verdict — our honest call on whether quantum won — rendered
 * the same everywhere: job cards, run pages, reports. */
const STYLES: Record<VerdictClass, { bg: string; color: string; border: string }> = {
  "vb-advantage": { bg: accents.advantageBg, color: accents.advantage, border: accents.advantageBorder },
  "vb-hybrid": { bg: accents.infoBg, color: accents.info, border: accents.infoBorder },
  "vb-neutral": { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

export function VerdictBadge({ verdictClass, label, size = "small" }: {
  verdictClass: VerdictClass;
  label: string;
  size?: "small" | "medium";
}) {
  const v = STYLES[verdictClass] ?? STYLES["vb-neutral"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "small" ? "1px 8px" : "4px 10px",
        borderRadius: "999px",
        fontSize: size === "small" ? "10px" : "11px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
      }}
    >
      {label}
    </span>
  );
}
