import { useState } from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { ArrowRightRegular } from "@fluentui/react-icons";
import { ALGORITHMS } from "../data/mock";
import { PageHeader } from "../components/shared/PageHeader";

const useStyles = makeStyles({
  filters: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" },
  filter: {
    padding: "5px 12px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2, fontSize: "13px", fontWeight: 500, cursor: "pointer",
    ":hover": { borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, color: tokens.colorNeutralForeground1 },
  },
  filterActive: {
    background: "#EFF6FF", borderTopColor: "#BFDBFE", borderRightColor: "#BFDBFE", borderBottomColor: "#BFDBFE", borderLeftColor: "#BFDBFE", color: "#1D4ED8",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" },
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1, padding: "16px",
    display: "flex", flexDirection: "column",
    ":hover": { borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, background: tokens.colorNeutralBackground2 },
  },
  cat: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, marginBottom: "6px" },
  name: { fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "6px" },
  desc: { fontSize: "13px", color: tokens.colorNeutralForeground2, lineHeight: 1.5, marginBottom: "12px", flex: 1 },
  fits: { display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px" },
  fit: {
    padding: "2px 8px", borderRadius: tokens.borderRadiusSmall,
    background: tokens.colorNeutralBackground3, border: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "11px", color: tokens.colorNeutralForeground2, fontWeight: 500,
  },
  useBtn: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, color: "#2563EB", background: "none", border: "none", cursor: "pointer" },
});

export function Library() {
  const s = useStyles();
  const cats = ["All", ...new Set(ALGORITHMS.map((a) => a.cat))];
  const [active, setActive] = useState("All");
  const list = active === "All" ? ALGORITHMS : ALGORITHMS.filter((a) => a.cat === active);

  return (
    <>
      <PageHeader
        kicker="Platform"
        title="Algorithm Library"
        sub="Proven quantum and hybrid workflows, ready to apply to your problem."
      />
      <div className={s.filters}>
        {cats.map((c) => (
          <button key={c} className={`${s.filter} ${active === c ? s.filterActive : ""}`} onClick={() => setActive(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className={s.grid}>
        {list.map((a) => (
          <div key={a.name} className={s.card}>
            <div className={s.cat}>{a.cat}</div>
            <div className={s.name}>{a.name}</div>
            <div className={s.desc}>{a.desc}</div>
            <div className={s.fits}>{a.fits.map((f) => <span key={f} className={s.fit}>{f}</span>)}</div>
            <button className={s.useBtn}>Use this <ArrowRightRegular fontSize={14} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
