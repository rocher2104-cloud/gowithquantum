import { useState } from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { ChatRegular } from "@fluentui/react-icons";
import { accents } from "../../theme/brand";

interface QA {
  q: string;
  a: string;
}

const QAS: QA[] = [
  {
    q: "What does 18% distance savings mean for my business?",
    a: "For a 5-truck fleet running 40 stops per day, an 18% reduction in total distance typically translates to 10–15% lower fuel costs and 1–2 fewer driving hours per day per truck. At average fleet operating costs, that's roughly $15,000–$25,000 in annual savings — and the routes are more predictable, which makes driver scheduling easier.",
  },
  {
    q: "Why did you use quantum computing here?",
    a: "Route optimisation is a combinatorial problem — as the number of stops grows, the number of possible routes explodes exponentially. Classical solvers handle 40 stops fine, but struggle above ~120. Quantum algorithms like QAOA explore many solutions simultaneously, so they stay practical at scales where classical methods stall. We ran quantum here to benchmark how your problem performs, and to prepare you for when your network grows.",
  },
  {
    q: "Is there a real quantum advantage in this result?",
    a: "Not yet at 40 stops — classical OR-Tools matched the quantum result at a fraction of the cost. That's the honest answer, and we always report it. The value right now is: (1) you have a baseline, (2) you've validated the workflow, and (3) when your network crosses ~120 nodes, you can re-run and see the crossover happen. The advantage is real — it just kicks in at larger scale.",
  },
  {
    q: "What should I do next?",
    a: "Keep this route plan as your working baseline and compare it against your current schedule. If you see the network growing — more stops, more trucks, tighter time windows — flag it and we'll re-run the quantum experiment. The scaling chart in the Technical view shows exactly when the quantum approach becomes the faster option.",
  },
];

const useStyles = makeStyles({
  root: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    overflow: "hidden",
    marginTop: "20px",
    background: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "13px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  qList: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" },
  qBtn: {
    display: "flex", alignItems: "flex-start", gap: "8px",
    padding: "10px 12px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`, background: "transparent",
    cursor: "pointer", textAlign: "left", fontSize: "14px", color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase, fontWeight: 500,
    ":hover": { background: tokens.colorNeutralBackground2, borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1 },
  },
  qBtnActive: { background: accents.infoBg, borderTopColor: accents.infoBorder, borderRightColor: accents.infoBorder, borderBottomColor: accents.infoBorder, borderLeftColor: accents.infoBorder, color: tokens.colorNeutralForeground1 },
  ans: {
    padding: "12px 16px 16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "14px", color: tokens.colorNeutralForeground2, lineHeight: 1.65,
    background: tokens.colorNeutralBackground2,
  },
  icon: { flexShrink: 0, marginTop: "1px", color: accents.quantum },
});

export function ExplainPanel() {
  const s = useStyles();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className={s.root}>
      <div className={s.header}>
        <ChatRegular fontSize={16} />
        Ask about this result
      </div>
      <div className={s.qList}>
        {QAS.map((qa, i) => (
          <button
            key={i}
            className={`${s.qBtn} ${active === i ? s.qBtnActive : ""}`}
            onClick={() => setActive(active === i ? null : i)}
          >
            <ChatRegular fontSize={16} className={s.icon} />
            {qa.q}
          </button>
        ))}
      </div>
      {active != null && (
        <div className={s.ans}>{QAS[active].a}</div>
      )}
    </div>
  );
}
