import { useState } from "react";
import { Button, Card, Input, Field, Switch, makeStyles, tokens } from "@fluentui/react-components";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { useApp } from "../store/AppStore";

const useStyles = makeStyles({
  section: { marginBottom: "28px" },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium, marginBottom: "8px",
    background: tokens.colorNeutralBackground1,
  },
  rowLabel: { fontWeight: 600, fontSize: "14px" },
  rowSub: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "2px" },
  apiKey: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 14px", border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium, marginBottom: "8px",
    background: tokens.colorNeutralBackground1,
  },
  keyLabel: { fontWeight: 600, fontSize: "13px", minWidth: "100px" },
  keyValue: { flex: 1, fontFamily: "'DM Mono', monospace", fontSize: "12px", color: tokens.colorNeutralForeground2 },
  profileGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
});

export function Settings() {
  const s = useStyles();
  const { userName, setUserName, uiMode, setUiMode } = useApp();
  const [nameDraft, setNameDraft] = useState(userName);
  return (
    <>
      <PageHeader kicker="Account" title="Settings" sub="Profile, interface mode, API keys, provider defaults, and notification preferences." />

      <SectionRow title="Profile" />
      <Card style={{ padding: "20px", marginBottom: 28 }}>
        <div className={s.profileGrid}>
          <Field label="Name"><Input value={nameDraft} onChange={(_, d) => setNameDraft(d.value)} /></Field>
          <Field label="Email"><Input defaultValue="rocher@gowithquantum.com" /></Field>
          <Field label="Organisation"><Input defaultValue="Go With Quantum" /></Field>
          <Field label="Role"><Input defaultValue="Founder" /></Field>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button appearance="primary" onClick={() => setUserName(nameDraft.trim() || userName)}>Save changes</Button>
        </div>
      </Card>

      <SectionRow title="Interface" />
      <div style={{ marginBottom: 28 }}>
        <div className={s.row}>
          <div>
            <div className={s.rowLabel}>Expert mode</div>
            <div className={s.rowSub}>
              Show the full research workbench in the sidebar (literature review, algorithm design,
              resource estimation…). In guided mode the agent does these steps for you and you reach
              them from a run's "Behind the scenes" panel.
            </div>
          </div>
          <Switch
            checked={uiMode === "expert"}
            onChange={(_, d) => setUiMode(d.checked ? "expert" : "guided")}
          />
        </div>
      </div>

      <SectionRow title="API keys" />
      <div style={{ marginBottom: 28 }}>
        {[
          { label: "Anthropic", value: "sk-ant-••••••••••••••••4Xf2" },
          { label: "IBM Quantum", value: "ibmq_••••••••••••••••a9b3" },
          { label: "D-Wave", value: "DEV-••••••••••••••••7c12" },
        ].map((k) => (
          <div key={k.label} className={s.apiKey}>
            <span className={s.keyLabel}>{k.label}</span>
            <span className={s.keyValue}>{k.value}</span>
            <Button size="small" appearance="secondary">Rotate</Button>
            <Button size="small" appearance="subtle">Remove</Button>
          </div>
        ))}
        <Button icon={null} appearance="secondary" style={{ marginTop: 4 }}>+ Add API key</Button>
      </div>

      <SectionRow title="Provider defaults" />
      <div style={{ marginBottom: 28 }}>
        {[
          { label: "Default quantum backend", sub: "Used when no provider is specified", value: "IBM Heron r2 (auto-select)" },
          { label: "Default shot count", sub: "Measurements per experiment run", value: "1,024" },
          { label: "Auto-transpile circuits", sub: "Optimise circuits for target hardware before submitting", value: null, toggle: true, on: true },
        ].map((r) => (
          <div key={r.label} className={s.row}>
            <div>
              <div className={s.rowLabel}>{r.label}</div>
              <div className={s.rowSub}>{r.sub}</div>
            </div>
            {r.toggle ? (
              <Switch defaultChecked={r.on} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>{r.value}</span>
                <Button size="small" appearance="secondary">Edit</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <SectionRow title="Notifications" />
      <div>
        {[
          { label: "Job completed", sub: "When a run finishes successfully" },
          { label: "Human decision needed", sub: "When a gate requires your input" },
          { label: "Job failed", sub: "When a run encounters an error" },
          { label: "Weekly digest", sub: "Summary of all experiment results" },
        ].map((n) => (
          <div key={n.label} className={s.row}>
            <div>
              <div className={s.rowLabel}>{n.label}</div>
              <div className={s.rowSub}>{n.sub}</div>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </>
  );
}
