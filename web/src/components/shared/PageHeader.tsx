import { makeStyles, tokens } from "@fluentui/react-components";
import type { ReactNode } from "react";

const useStyles = makeStyles({
  root: { marginBottom: "28px" },
  top: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" },
  kicker: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
  title: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2 },
  sub: { color: tokens.colorNeutralForeground2, fontSize: "15px", maxWidth: "580px", lineHeight: 1.6, margin: 0 },
});

export function PageHeader({
  kicker,
  title,
  sub,
  action,
}: {
  kicker?: ReactNode;
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  const s = useStyles();
  return (
    <div className={s.root}>
      <div className={s.top}>
        <div>
          {kicker && <div className={s.kicker}>{kicker}</div>}
          <h1 className={s.title}>{title}</h1>
          {sub && <p className={s.sub}>{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function SectionRow({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "32px 0 12px",
      }}
    >
      <h2
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tokens.colorNeutralForeground3,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}
