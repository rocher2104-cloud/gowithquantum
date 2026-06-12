import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Dropdown, Field, Option, Slider, Switch,
  Tab, TabList, Text, makeStyles, tokens,
} from "@fluentui/react-components";
import { PageHeader } from "../components/shared/PageHeader";
import { HITLGateCard } from "../components/workflow/HITLGateCard";
import { ConvergenceChart } from "../components/workflow/ConvergenceChart";
import { useApp } from "../store/AppStore";
import { accents } from "../theme/brand";

const METRICS = [
  { label: "Approximation ratio", noiseless: "89.2%", noisy: "76.1%", hardware: "81.4%", classical: "94.0%" },
  { label: "Energy estimate", noiseless: "−1.984", noisy: "−1.701", hardware: "−1.823", classical: "−2.100" },
  { label: "Top bitstring freq.", noiseless: "40.2%", noisy: "31.2%", hardware: "35.8%", classical: "100%" },
  { label: "TVD from ideal", noiseless: "0.04", noisy: "0.18", hardware: "0.11", classical: "0.00" },
];

const ERROR_SOURCES = [
  { label: "Gate errors (2Q)", coherent: 0.32, incoherent: 0.18 },
  { label: "Decoherence (T1/T2)", coherent: 0.08, incoherent: 0.42 },
  { label: "Readout errors", coherent: 0.12, incoherent: 0.26 },
  { label: "Crosstalk", coherent: 0.28, incoherent: 0.09 },
  { label: "SPAM errors", coherent: 0.20, incoherent: 0.05 },
];

const CALIBRATION_LOG = [
  { ts: "today 09:00", backend: "IBM Heron r2", t1: "287 μs", t2: "198 μs", twoQ: "0.089%", notes: "Post-tune-up" },
  { ts: "yesterday", backend: "IBM Heron r2", t1: "261 μs", t2: "182 μs", twoQ: "0.103%", notes: "" },
  { ts: "3 days ago", backend: "IBM Heron r2", t1: "244 μs", t2: "171 μs", twoQ: "0.121%", notes: "Pre-tune-up" },
];

const CONV_DATA = Array.from({ length: 30 }, (_, i) => ({
  iteration: i + 1,
  energy: -1.2 - 0.8 * (1 - Math.exp(-i / 8)),
}));

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 260px",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  main: { display: "flex", flexDirection: "column", gap: "16px" },
  table: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  th: {
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
    textAlign: "left",
    background: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  td: { padding: "10px 12px", fontSize: "12px", borderBottom: `1px solid ${tokens.colorNeutralStroke1}` },
  mono: { fontFamily: tokens.fontFamilyMonospace, fontSize: "12px" },
  sidebar: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    position: "sticky",
    top: "16px",
  },
  sidebarHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
  },
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  errorCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "14px 16px",
    background: tokens.colorNeutralBackground1,
    flex: "1 1 0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  errorRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  barOuter: {
    height: "8px",
    borderRadius: "4px",
    background: tokens.colorNeutralBackground3,
    overflow: "hidden",
  },
});

type TabId = "comparison" | "errors" | "qubitmap" | "calibration";

export function AnalysisDebug() {
  const s = useStyles();
  const [tab, setTab] = useState<TabId>("comparison");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [benchmark, setBenchmark] = useState("Approximation ratio");
  const [baselineSolver, setBaselineSolver] = useState("MILP");
  const [showRB, setShowRB] = useState(false);
  const [iterateDecision, setIterateDecision] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        kicker="Step 6 · Analyze"
        title="Analysis & Debugging"
        sub="Compare noiseless, noisy, and hardware results. Identify error sources, inspect qubit mapping, and decide whether to iterate or accept."
      />

      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as TabId)} style={{ marginBottom: 16 }}>
        <Tab value="comparison">Comparison</Tab>
        <Tab value="errors">Error Analysis</Tab>
        <Tab value="qubitmap">Qubit Map</Tab>
        <Tab value="calibration">Calibration Log</Tab>
      </TabList>

      <div className={s.layout}>
        <div className={s.main}>
          {/* COMPARISON TAB */}
          {tab === "comparison" && (
            <>
              <div className={s.table}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className={s.th}>Metric</th>
                      <th className={s.th}>Noiseless sim</th>
                      <th className={s.th}>Noisy sim</th>
                      <th className={s.th}>Hardware</th>
                      <th className={s.th}>{baselineSolver} (classical)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map((m) => (
                      <tr key={m.label}>
                        <td className={s.td}><Text weight="semibold" size={200}>{m.label}</Text></td>
                        <td className={s.td}><Text className={s.mono} style={{ color: accents.quantum }}>{m.noiseless}</Text></td>
                        <td className={s.td}><Text className={s.mono} style={{ color: accents.human }}>{m.noisy}</Text></td>
                        <td className={s.td}><Text className={s.mono} style={{ color: accents.info }}>{m.hardware}</Text></td>
                        <td className={s.td}><Text className={s.mono} style={{ color: accents.advantage }}>{m.classical}</Text></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "14px 16px", border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, background: tokens.colorNeutralBackground1 }}>
                <Text weight="semibold" style={{ display: "block", marginBottom: 12 }}>Convergence comparison</Text>
                <ConvergenceChart data={CONV_DATA} noisyData={CONV_DATA.map((d) => ({ ...d, energy: d.energy + 0.18 }))} />
              </div>

              {iterateDecision ? (
                <div style={{ padding: "14px 16px", borderRadius: tokens.borderRadiusMedium, background: accents.advantageBg, border: `1px solid ${accents.advantageBorder}` }}>
                  <Text weight="semibold" style={{ color: accents.advantage }}>
                    {iterateDecision === "accept" ? "✓ Result accepted — proceed to reports" : "↩ Iterating — return to Algorithm Design to refine"}
                  </Text>
                </div>
              ) : (
                <HITLGateCard gate="accept" onAction={(a) => setIterateDecision(a)} />
              )}
            </>
          )}

          {/* ERROR ANALYSIS TAB */}
          {tab === "errors" && (
            <>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div className={s.errorCard}>
                  <Text weight="semibold">Coherent Errors</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Systematic gate miscalibration — affects all runs equally</Text>
                  {ERROR_SOURCES.map((e) => (
                    <div key={e.label} className={s.errorRow}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text size={200}>{e.label}</Text>
                        <Text size={200} className={s.mono}>{(e.coherent * 100).toFixed(0)}%</Text>
                      </div>
                      <div className={s.barOuter}>
                        <div style={{ height: "100%", width: `${e.coherent * 100}%`, background: accents.quantum, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={s.errorCard}>
                  <Text weight="semibold">Incoherent Errors</Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>T1/T2 decoherence and readout noise — random each shot</Text>
                  {ERROR_SOURCES.map((e) => (
                    <div key={e.label} className={s.errorRow}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text size={200}>{e.label}</Text>
                        <Text size={200} className={s.mono}>{(e.incoherent * 100).toFixed(0)}%</Text>
                      </div>
                      <div className={s.barOuter}>
                        <div style={{ height: "100%", width: `${e.incoherent * 100}%`, background: accents.human, borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 14px", border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, background: tokens.colorNeutralBackground1 }}>
                <Switch label="Show randomized benchmarking reference line" checked={showRB} onChange={(_, d) => setShowRB(d.checked)} />
                {showRB && (
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: 8 }}>
                    RB reference: average gate fidelity F_avg = 0.9991 across all 156 qubits (Heron r2, calibrated today 09:00)
                  </Text>
                )}
              </div>
            </>
          )}

          {/* QUBIT MAP TAB */}
          {tab === "qubitmap" && (
            <div style={{ border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, padding: 16, background: tokens.colorNeutralBackground1 }}>
              <Text weight="semibold" style={{ display: "block", marginBottom: 12 }}>Physical qubit mapping — IBM Heron r2</Text>
              <svg viewBox="0 0 520 200" width="100%" aria-label="Full qubit mapping">
                {/* Grid of qubits */}
                {Array.from({ length: 12 }, (_, i) => {
                  const used = [0, 2, 4, 7, 9, 11].includes(i);
                  const cx = 30 + (i % 6) * 80;
                  const cy = 40 + Math.floor(i / 6) * 80;
                  const logical = [0, 1, 2, 3, 4, 5].indexOf([0, 2, 4, 7, 9, 11].indexOf(i));
                  return (
                    <g key={i}>
                      {i < 6 && <line x1={cx} y1={cy} x2={cx + 80} y2={cy} stroke="#e2e8f0" strokeWidth={1.5} />}
                      {i < 6 && <line x1={cx} y1={cy} x2={cx} y2={cy + 80} stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray={used ? "0" : "3 3"} />}
                      <circle cx={cx} cy={cy} r={20} fill={used ? accents.quantum : tokens.colorNeutralBackground3} opacity={used ? 0.9 : 1} />
                      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill={used ? "#fff" : "#94a3b8"}>q{i}</text>
                      {used && logical >= 0 && (
                        <text x={cx} y={cy + 32} textAnchor="middle" fontSize={9} fill={accents.quantum}>L{logical}</text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: accents.quantum }} />
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Used logical qubits (L0–L5 → q0, q2, q4, q7, q9, q11)</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: tokens.colorNeutralBackground3, border: "1px solid #cbd5e1" }} />
                  <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Idle physical qubits</Text>
                </div>
              </div>
            </div>
          )}

          {/* CALIBRATION LOG TAB */}
          {tab === "calibration" && (
            <div className={s.table}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className={s.th}>Timestamp</th>
                    <th className={s.th}>Backend</th>
                    <th className={s.th}>T1 avg</th>
                    <th className={s.th}>T2 avg</th>
                    <th className={s.th}>2Q error rate</th>
                    <th className={s.th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {CALIBRATION_LOG.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < CALIBRATION_LOG.length - 1 ? `1px solid ${tokens.colorNeutralStroke1}` : "none" }}>
                      <td className={s.td}><Text className={s.mono}>{row.ts}</Text></td>
                      <td className={s.td}><Text size={200}>{row.backend}</Text></td>
                      <td className={s.td}><Text className={s.mono} style={{ color: accents.quantum }}>{row.t1}</Text></td>
                      <td className={s.td}><Text className={s.mono} style={{ color: accents.info }}>{row.t2}</Text></td>
                      <td className={s.td}><Text className={s.mono}>{row.twoQ}</Text></td>
                      <td className={s.td}><Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{row.notes}</Text></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Settings */}
        <div className={s.sidebar}>
          <div className={s.sidebarHeader}>Analysis Settings</div>
          <Accordion multiple collapsible defaultOpenItems={["settings"]}>
            <AccordionItem value="settings">
              <AccordionHeader size="small">Settings</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label={`Confidence threshold: ${(confidenceThreshold * 100).toFixed(0)}%`}>
                      <Slider min={0.5} max={0.99} step={0.01} value={confidenceThreshold}
                        onChange={(_, d) => setConfidenceThreshold(d.value)} />
                    </Field>
                    <Field label="Benchmark metric">
                      <Dropdown value={benchmark} onOptionSelect={(_, d) => setBenchmark(d.optionValue ?? benchmark)}>
                        <Option value="Approximation ratio">Approximation ratio</Option>
                        <Option value="Fidelity">Fidelity</Option>
                        <Option value="TVD">TVD (Total Variation Distance)</Option>
                      </Dropdown>
                    </Field>
                    <Field label="Classical baseline">
                      <Dropdown value={baselineSolver} onOptionSelect={(_, d) => setBaselineSolver(d.optionValue ?? baselineSolver)}>
                        <Option value="MILP">MILP (Mixed Integer LP)</Option>
                        <Option value="Simulated Annealing">Simulated Annealing</Option>
                        <Option value="Random greedy">Random greedy</Option>
                      </Dropdown>
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
