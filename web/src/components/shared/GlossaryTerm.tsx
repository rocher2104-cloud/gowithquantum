import { Tooltip, makeStyles, tokens } from "@fluentui/react-components";
import { GLOSSARY } from "../../data/glossary";

const useStyles = makeStyles({
  term: {
    borderBottom: `1px dotted ${tokens.colorBrandForeground1}`,
    cursor: "help",
    color: "inherit",
  },
  body: { maxWidth: "260px", fontSize: "13px", lineHeight: 1.5 },
});

/**
 * Wraps a jargon term in a tooltip definition. `term` keys into GLOSSARY;
 * children (or the term itself) is the visible text.
 */
export function GlossaryTerm({
  term,
  children,
}: {
  term: keyof typeof GLOSSARY | string;
  children?: React.ReactNode;
}) {
  const s = useStyles();
  const def = GLOSSARY[term];
  if (!def) return <>{children ?? term}</>;
  return (
    <Tooltip
      content={{ children: <span className={s.body}>{def}</span> }}
      relationship="description"
      withArrow
    >
      <span className={s.term} tabIndex={0}>
        {children ?? term}
      </span>
    </Tooltip>
  );
}
