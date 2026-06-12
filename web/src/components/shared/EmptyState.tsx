import { makeStyles, tokens } from "@fluentui/react-components";
import type { ReactNode } from "react";

const useStyles = makeStyles({
  root: {
    textAlign: "center",
    padding: "48px 20px",
    color: tokens.colorNeutralForeground3,
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
  },
  title: { color: tokens.colorNeutralForeground2, fontWeight: 600, fontSize: "14px", marginBottom: "3px" },
});

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  const s = useStyles();
  return (
    <div className={s.root}>
      <div className={s.title}>{title}</div>
      {children}
    </div>
  );
}
