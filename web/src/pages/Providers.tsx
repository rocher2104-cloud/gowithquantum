import { Badge, Button, Card, makeStyles, tokens } from "@fluentui/react-components";
import { PROVIDERS } from "../data/mock";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { accents } from "../theme/brand";

const useStyles = makeStyles({
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px" },
  rowConnected: { borderTopColor: accents.advantageBorder, borderRightColor: accents.advantageBorder, borderBottomColor: accents.advantageBorder, borderLeftColor: accents.advantageBorder },
  ic: {
    width: "40px", height: "40px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`, background: tokens.colorNeutralBackground3,
    display: "grid", placeItems: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0,
    color: tokens.colorNeutralForeground2,
  },
  mid: { flex: 1, minWidth: 0 },
  name: { fontSize: "14px", fontWeight: 700 },
  meta: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "3px" },
  right: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  dot: { width: "7px", height: "7px", borderRadius: "50%", background: tokens.colorNeutralStroke1 },
  queue: { fontFamily: "'DM Mono', monospace", fontSize: "12px", color: tokens.colorNeutralForeground3 },
});

export function Providers() {
  const s = useStyles();
  return (
    <>
      <PageHeader
        kicker="Platform"
        title="Provider Integrations"
        sub="Connect to quantum cloud providers and hybrid solvers. Go With Quantum will route your experiments to the right backend automatically."
      />
      <SectionRow title="Connected & available" />
      <div className={s.list}>
        {PROVIDERS.map((p) => (
          <Card key={p.id} className={`${s.row} ${p.status === "connected" ? s.rowConnected : ""}`}>
            <div className={s.ic}>{p.name.split(" ").map((w) => w[0]).join("").slice(0, 3)}</div>
            <div className={s.mid}>
              <div className={s.name}>{p.name}</div>
              <div className={s.meta}>{p.backends}</div>
            </div>
            <div className={s.right}>
              <span
                className={s.dot}
                style={{
                  background:
                    p.status === "connected" ? accents.advantage :
                    p.status === "available" ? accents.human :
                    tokens.colorNeutralStroke1,
                }}
              />
              <span className={s.queue}>{p.queue}</span>
              {p.status === "connected" && <Button appearance="secondary" size="small">Connected ✓</Button>}
              {p.status === "available" && <Button appearance="primary" size="small">Connect</Button>}
              {p.status === "soon" && <Button disabled size="small">Coming soon</Button>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
