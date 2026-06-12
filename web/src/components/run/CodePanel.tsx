import { Highlight, themes } from "prism-react-renderer";
import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  wrap: {
    borderRadius: tokens.borderRadiusLarge,
    overflow: "hidden",
    fontSize: "13px",
    lineHeight: "1.6",
    maxHeight: "340px",
    overflowY: "auto",
  },
  pre: { margin: 0, padding: "16px", overflowX: "auto" },
  lineNo: { display: "inline-block", minWidth: "28px", userSelect: "none", opacity: 0.35, paddingRight: "12px", textAlign: "right" },
});

export function CodePanel({ code }: { code: string }) {
  const s = useStyles();
  return (
    <div className={s.wrap}>
      <Highlight theme={themes.nightOwl} code={code.trim()} language="python">
        {({ className, style, tokens: lines, getLineProps, getTokenProps }) => (
          <pre className={`${className} ${s.pre}`} style={style}>
            {lines.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className={s.lineNo}>{i + 1}</span>
                {line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
