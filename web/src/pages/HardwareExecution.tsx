import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Caption1, Dropdown, Field, Option, Slider, SpinButton,
  Text, makeStyles, tokens,
} from "@fluentui/react-components";
import { ArrowRightRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { HITLGateCard } from "../components/workflow/HITLGateCard";
import { useApp } from "../store/AppStore";
import { PROVIDERS } from "../data/mock";
import type { ErrorMitigationMethod, OptimizationLevel, RoutingAlgorithm } from "../data/models";
import { accents } from "../theme/brand";
import { useNavigate } from "react-router-dom";

const OPT_LABELS = ["No optimization", "Light", "Heavy", "Heaviest"];

const MITIGATION_DESCRIPTIONS: Record<ErrorMitigationMethod, string> = {
  none: "No error mitigation. Results reflect raw hardware noise.",
  ZNE: "Zero-Noise Extrapolation: intentionally amplify noise at multiple scale factors, then extrapolate to zero-noise limit.",
  PEC: "Probabilistic Error Cancellation: represent the ideal circuit as a combination of noisy circuits with quasi-probability weights.",
  measurement: "Measurement error mitigation: calibrate readout errors on all qubits and apply correction matrix to results.",
};

const COUPLING_MAPS: Record<string, [number, number][]> = {
  ibm: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,7],[7,8],[8,9]],
  dwave: [[0,1],[1,2],[2,3],[3,0],[0,2]],
  quantinuum: [[0,1],[1,2],[2,3],[3,4],[4,0]],
  braket: [[0,1],[1,2],[2,3]],
  default: [[0,1],[1,2],[2,3],[3,0]],
};

function CouplingMap({ providerId, usedQubits }: { providerId: string; usedQubits: number[] }) {
  const edges = COUPLING_MAPS[providerId] ?? COUPLING_MAPS.default;
  const qubits = Array.from(new Set(edges.flat())).sort((a, b) => a - b);
  const cx = (q: number) => 30 + (q % 5) * 44;
  const cy = (q: number) => 20 + Math.floor(q / 5) * 40;

  return (
    <svg viewBox="0 0 260 80" width="100%" style={{ maxHeight: 80 }} aria-label="Qubit coupling map">
      {edges.map(([a, b], i) => (
        <line key={i} x1={cx(a)} y1={cy(a)} x2={cx(b)} y2={cy(b)}
          stroke="#cbd5e1" strokeWidth={1.5} />
      ))}
      {qubits.map((q) => (
        <g key={q}>
          <circle cx={cx(q)} cy={cy(q)} r={12}
            fill={usedQubits.includes(q) ? accents.quantum : tokens.colorNeutralBackground3}
            opacity={usedQubits.includes(q) ? 0.9 : 1} />
          <text x={cx(q)} y={cy(q) + 4} textAnchor="middle" fontSize={9}
            fill={usedQubits.includes(q) ? "#fff" : "#64748b"}>q{q}</text>
        </g>
      ))}
    </svg>
  );
}

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  leftPanel: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  panelHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  backendTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  backendRow: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
  },
  td: { padding: "8px 12px", fontSize: "12px" },
  statCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "14px 16px",
    background: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  depthRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "12px",
    alignItems: "center",
  },
  depthBox: {
    padding: "10px 14px",
    background: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: "center",
  },
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "10px" },
});

export function HardwareExecution() {
  const s = useStyles();
  const navigate = useNavigate();
  const { addHwConfig, approveHwConfig, hwConfigs, jobs } = useApp();
  const [selectedProvider, setSelectedProvider] = useState("ibm");
  const [optLevel, setOptLevel] = useState<OptimizationLevel>(3);
  const [routing, setRouting] = useState<RoutingAlgorithm>("SABRE");
  const [mitigation, setMitigation] = useState<ErrorMitigationMethod>("ZNE");
  const [shots, setShots] = useState(4096);
  const [costThreshold, setCostThreshold] = useState(10);
  const [approved, setApproved] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider) ?? PROVIDERS[0];
  const estimatedCost = shots * 0.0018;
  const queueMin = provider.queue === "< 1 min" ? 1 : provider.id === "ibm" ? 6 : 3;
  const depthBefore = 47;
  const depthAfter = Math.round(depthBefore * (1 - optLevel * 0.1));
  const usedQubits = [0, 1, 2, 3, 5, 7];

  const handleApprove = () => {
    const config = addHwConfig({
      jobId: jobs[0]?.id ?? 0,
      providerId: selectedProvider,
      backend: provider.backends.split(",")[0].trim(),
      shots, optimizationLevel: optLevel,
      routingAlgorithm: routing, errorMitigation: mitigation,
      zneScaleFactors: [1, 2, 3],
      costThreshold, estimatedCost, estimatedQueueMin: queueMin,
      status: "queued",
    });
    approveHwConfig(config.id);
    setPendingId(config.id);
    setApproved(true);
    setTimeout(() => navigate("/queue"), 1500);
  };

  return (
    <>
      <PageHeader
        kicker="Step 5 · Experiment"
        title="Hardware Execution"
        sub="Select a quantum backend, configure transpilation and error mitigation, review the cost estimate, and approve the hardware submission."
      />

      <div className={s.layout}>
        {/* Left: Config */}
        <div className={s.leftPanel}>
          <div className={s.panelHeader}>Backend & Configuration</div>

          {/* Backend selector */}
          <div style={{ padding: "12px 0 0" }}>
            <table className={s.backendTable}>
              <thead>
                <tr style={{ background: tokens.colorNeutralBackground2, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                  <th style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>Provider</th>
                  <th style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>Status</th>
                  <th style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>Queue</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.filter((p) => p.status !== "soon").map((p) => (
                  <tr
                    key={p.id}
                    className={s.backendRow}
                    onClick={() => setSelectedProvider(p.id)}
                    style={{
                      background: selectedProvider === p.id ? tokens.colorBrandBackground2 : undefined,
                    }}
                  >
                    <td className={s.td}>
                      <Text weight={selectedProvider === p.id ? "semibold" : "regular"} size={200}>{p.name}</Text>
                    </td>
                    <td className={s.td}>
                      <Badge appearance="tint" size="small"
                        color={p.status === "connected" ? "success" : "informative"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className={s.td}>
                      <Text size={100} style={{ fontFamily: tokens.fontFamilyMonospace }}>{p.queue}</Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Accordion multiple collapsible defaultOpenItems={["transpile", "mitigation", "shots"]}>
            <AccordionItem value="transpile">
              <AccordionHeader size="small">Transpilation</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label={`Optimization level: ${optLevel} — ${OPT_LABELS[optLevel]}`}>
                      <Slider min={0} max={3} step={1} value={optLevel}
                        onChange={(_, d) => setOptLevel(d.value as OptimizationLevel)} />
                    </Field>
                    <Field label="Routing algorithm">
                      <Dropdown value={routing} onOptionSelect={(_, d) => setRouting((d.optionValue ?? routing) as RoutingAlgorithm)}>
                        <Option value="SABRE">SABRE (recommended)</Option>
                        <Option value="Basic">Basic</Option>
                        <Option value="Stochastic">Stochastic</Option>
                      </Dropdown>
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="mitigation">
              <AccordionHeader size="small">Error Mitigation</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Method">
                      <Dropdown value={mitigation} onOptionSelect={(_, d) => setMitigation((d.optionValue ?? mitigation) as ErrorMitigationMethod)}>
                        <Option value="none">None</Option>
                        <Option value="ZNE">ZNE (Zero-Noise Extrapolation)</Option>
                        <Option value="PEC">PEC (Probabilistic Error Cancellation)</Option>
                        <Option value="measurement">Measurement error mitigation</Option>
                      </Dropdown>
                    </Field>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, lineHeight: 1.6 }}>
                      {MITIGATION_DESCRIPTIONS[mitigation]}
                    </Caption1>
                    {mitigation === "ZNE" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1, 2, 3].map((sf) => (
                          <Badge key={sf} appearance="tint" color="brand">scale {sf}×</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="shots">
              <AccordionHeader size="small">Shots & Cost</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label={`Shot count: ${shots.toLocaleString()}`}>
                      <Slider min={1000} max={100000} step={1000} value={shots}
                        onChange={(_, d) => setShots(d.value)} />
                    </Field>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                      <Text size={200}>Estimated cost</Text>
                      <Text weight="semibold" style={{ fontFamily: tokens.fontFamilyMonospace }}>
                        ~${estimatedCost.toFixed(2)}
                      </Text>
                    </div>
                    <Field label="Cost alert threshold ($)">
                      <SpinButton value={costThreshold} min={0} max={500} step={5}
                        onChange={(_, d) => setCostThreshold(d.value ?? costThreshold)} />
                    </Field>
                    {estimatedCost > costThreshold && (
                      <Badge appearance="tint" color="danger">⚠ Estimated cost exceeds threshold</Badge>
                    )}
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right: Preview + HITL */}
        <div className={s.rightPanel}>
          {/* Transpilation preview */}
          <div className={s.statCard}>
            <Text weight="semibold">Transpilation Preview</Text>
            <div className={s.depthRow}>
              <div className={s.depthBox}>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>Before</Text>
                <Text weight="semibold" style={{ fontFamily: tokens.fontFamilyMonospace, fontSize: 20 }}>{depthBefore}</Text>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>layers</Text>
              </div>
              <ArrowRightRegular fontSize={24} style={{ color: tokens.colorNeutralForeground3 }} />
              <div className={s.depthBox} style={{ borderLeft: `3px solid ${accents.quantum}` }}>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>After (opt={optLevel})</Text>
                <Text weight="semibold" style={{ fontFamily: tokens.fontFamilyMonospace, fontSize: 20, color: accents.quantum }}>{depthAfter}</Text>
                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>layers</Text>
              </div>
            </div>
          </div>

          {/* Coupling map */}
          <div className={s.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text weight="semibold">Qubit Coupling Map</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{provider.name}</Text>
            </div>
            <CouplingMap providerId={selectedProvider} usedQubits={usedQubits} />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: accents.quantum }} />
                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Used ({usedQubits.length})</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tokens.colorNeutralBackground3, border: "1px solid #cbd5e1" }} />
                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Idle</Text>
              </div>
            </div>
          </div>

          {/* HITL approval */}
          {!approved ? (
            <HITLGateCard
              gate="hardware"
              estimatedCost={estimatedCost}
              estimatedQueueMin={queueMin}
              backend={provider.backends.split(",")[0].trim()}
              onAction={(action) => {
                if (action === "approve") handleApprove();
                else if (action === "sim") navigate("/simulation");
              }}
            />
          ) : (
            <div style={{
              padding: "16px", borderRadius: tokens.borderRadiusMedium,
              background: accents.advantageBg, border: `1px solid ${accents.advantageBorder}`,
              borderLeft: `3px solid ${accents.advantage}`,
            }}>
              <Text weight="semibold" style={{ color: accents.advantage }}>
                ✓ Submitted to {provider.name}
              </Text>
              <Text size={200} style={{ display: "block", marginTop: 4, color: accents.advantage }}>
                Job queued. Redirecting to queue...
              </Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
