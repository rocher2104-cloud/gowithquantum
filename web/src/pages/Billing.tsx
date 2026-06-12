import { Button, Card, makeStyles, ProgressBar, tokens } from "@fluentui/react-components";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { accents } from "../theme/brand";

const useStyles = makeStyles({
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" },
  stat: { padding: "20px", border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, background: tokens.colorNeutralBackground1 },
  statLabel: { fontSize: "12px", color: tokens.colorNeutralForeground3, fontWeight: 500, marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: tokens.fontFamilyBase },
  statSub: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "4px" },
  creditCard: { padding: "20px", marginBottom: "28px" },
  creditBar: { marginTop: "10px" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  tableWrap: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, overflow: "hidden" },
  th: { padding: "10px 14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: tokens.colorNeutralForeground3, background: tokens.colorNeutralBackground3, textAlign: "left" as const, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  td: { padding: "10px 14px", fontSize: "13px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  tdMono: { fontFamily: tokens.fontFamilyBase, fontSize: "12px" },
  budgetRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, marginBottom: "8px" },
  budgetLabel: { fontWeight: 600, fontSize: "14px" },
  budgetSub: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "2px" },
});

const SPEND_ROWS = [
  { ws: "Logistics R&D", jobs: 4, cost: "$22.40" },
  { ws: "Drug Discovery", jobs: 2, cost: "$15.80" },
  { ws: "Risk & Markets", jobs: 1, cost: "$7.50" },
];

const BUDGET_LIMITS = [
  { label: "Monthly spend cap", sub: "Alert at 80%, block at 100%", limit: "$200", used: 45.70 },
  { label: "Per-job limit", sub: "Single job cannot exceed this amount", limit: "$50", used: null },
  { label: "Hardware gate default", sub: "Require my approval before hardware runs", limit: "On", used: null },
];

export function Billing() {
  const s = useStyles();
  const usedPct = 45.70 / 200;

  return (
    <>
      <PageHeader kicker="Account" title="Billing & usage" sub="Compute credits, spend by project, and budget controls." />

      <div className={s.statsRow}>
        {[
          { label: "Credits remaining", value: "$154.30", sub: "of $200.00 monthly" },
          { label: "Spent this month", value: "$45.70", sub: "across 7 jobs" },
          { label: "Avg cost per job", value: "$6.53", sub: "last 30 days" },
        ].map((s2) => (
          <div key={s2.label} className={s.stat}>
            <div className={s.statLabel}>{s2.label}</div>
            <div className={s.statValue}>{s2.value}</div>
            <div className={s.statSub}>{s2.sub}</div>
          </div>
        ))}
      </div>

      <Card className={s.creditCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Monthly credit usage</strong>
          <span style={{ fontFamily: tokens.fontFamilyBase, fontSize: "13px" }}>$45.70 / $200.00</span>
        </div>
        <div className={s.creditBar}>
          <ProgressBar value={usedPct} thickness="large" color="brand" />
        </div>
        <div style={{ fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "6px" }}>
          {Math.round(usedPct * 100)}% of monthly budget used · resets July 1
        </div>
      </Card>

      <SectionRow title="Spend by workspace" />
      <div className={s.tableWrap} style={{ marginBottom: 28 }}>
        <table className={s.table}>
          <thead>
            <tr>{["Workspace", "Jobs run", "Total cost"].map((h) => <th key={h} className={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {SPEND_ROWS.map((r) => (
              <tr key={r.ws}>
                <td className={s.td}>{r.ws}</td>
                <td className={`${s.td} ${s.tdMono}`}>{r.jobs}</td>
                <td className={`${s.td} ${s.tdMono}`}>{r.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionRow title="Budget controls" />
      <div>
        {BUDGET_LIMITS.map((b) => (
          <div key={b.label} className={s.budgetRow}>
            <div>
              <div className={s.budgetLabel}>{b.label}</div>
              <div className={s.budgetSub}>{b.sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: tokens.fontFamilyBase, fontWeight: 600 }}>{b.limit}</span>
              <Button size="small" appearance="secondary">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
