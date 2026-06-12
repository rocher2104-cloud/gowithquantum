import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Dropdown, Field, Option, Slider, SpinButton,
  Text, makeStyles, tokens,
} from "@fluentui/react-components";
import { PageHeader } from "../components/shared/PageHeader";
import { ResourceEstimateCard } from "../components/workflow/ResourceEstimateCard";
import { useApp } from "../store/AppStore";
import type { ErrorCorrectionCode } from "../data/models";
import { accents } from "../theme/brand";

// Surface code physical qubit formula: Q_phys ≈ 2d² × Q_logical
// d ≈ 2 × ceil(log(1/ε_L) / log(1/ε_P)) + 1

function computeEstimate(logicalQubits: number, physicalErrorRate: number, logicalErrorRate: number, codeDistance: number, magicOverhead: number, problemSize: number, tGateCountBase: number) {
  const tGateCount = Math.round(tGateCountBase * Math.log2(problemSize + 2) * 10);
  const tGateDepth = Math.round(tGateCount / 8);
  const physicalQubits = Math.round(2 * codeDistance * codeDistance * logicalQubits * magicOverhead);
  const surfaceCodeCycles = tGateDepth * codeDistance * 10;
  const estimatedRuntimeHours = (surfaceCodeCycles * 1e-6) / 3600 * 1000;
  const availableQubitsIn2025 = 1000;
  const doublingYears = Math.log2(physicalQubits / availableQubitsIn2025);
  const hardwareReadinessYear = Math.round(2025 + doublingYears);

  return { tGateCount, tGateDepth, physicalQubits, surfaceCodeCycles, estimatedRuntimeHours, hardwareReadinessYear };
}

function TimelineChart({
  physicalQubits, readinessYear,
}: { physicalQubits: number; readinessYear: number }) {
  const W = 520;
  const H = 160;
  const PAD_L = 60;
  const PAD_B = 36;
  const PAD_T = 20;
  const PAD_R = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const yearStart = 2025;
  const yearEnd = 2038;

  const toX = (year: number) => PAD_L + ((year - yearStart) / (yearEnd - yearStart)) * chartW;

  // Available qubits: starts at 1000 in 2025, doubles every 2 years
  const available = (y: number) => 1000 * Math.pow(2, (y - yearStart) / 2);
  const requiredQubits = physicalQubits;

  const years = Array.from({ length: 27 }, (_, i) => yearStart + i * 0.5);
  const maxQ = Math.max(requiredQubits * 2, available(yearEnd));
  const toY = (q: number) => PAD_T + (1 - Math.log2(Math.max(q, 100)) / Math.log2(maxQ)) * chartH;

  const availablePts = years.map((y) => `${toX(y)},${toY(available(y))}`).join(" ");
  const yearTicks = [2025, 2027, 2029, 2031, 2033, 2035, 2037];
  const crossX = toX(readinessYear);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: H }} aria-label="FTQC advantage timeline">
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const q = Math.pow(2, t * Math.log2(maxQ));
        return (
          <g key={i}>
            <line x1={PAD_L} y1={toY(q)} x2={W - PAD_R} y2={toY(q)} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
            <text x={PAD_L - 4} y={toY(q) + 4} textAnchor="end" fontSize={8} fill="#94a3b8">
              {q >= 1000 ? (q / 1000).toFixed(0) + "k" : q.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Available (roadmap) line */}
      <polyline points={availablePts} fill="none" stroke={accents.info} strokeWidth={2} />

      {/* Required (flat) line */}
      <line x1={PAD_L} y1={toY(requiredQubits)} x2={W - PAD_R} y2={toY(requiredQubits)}
        stroke={accents.quantum} strokeWidth={2} strokeDasharray="6 3" />

      {/* Crossover */}
      {readinessYear <= yearEnd && (
        <>
          <line x1={crossX} y1={PAD_T} x2={crossX} y2={PAD_T + chartH}
            stroke={accents.human} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={crossX + 4} y={PAD_T + 12} fontSize={9} fill={accents.humanText}>
            Feasible ~{readinessYear}
          </text>
        </>
      )}

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1.5} />

      {/* Year ticks */}
      {yearTicks.map((y) => (
        <text key={y} x={toX(y)} y={H - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">{y}</text>
      ))}

      {/* Legend */}
      <line x1={W - PAD_R - 110} y1={PAD_T + 8} x2={W - PAD_R - 90} y2={PAD_T + 8} stroke={accents.quantum} strokeWidth={2} strokeDasharray="6 3" />
      <text x={W - PAD_R - 86} y={PAD_T + 12} fontSize={8} fill="#64748b">Required</text>
      <line x1={W - PAD_R - 110} y1={PAD_T + 20} x2={W - PAD_R - 90} y2={PAD_T + 20} stroke={accents.info} strokeWidth={2} />
      <text x={W - PAD_R - 86} y={PAD_T + 24} fontSize={8} fill="#64748b">Available (2× / 2yr)</text>

      <text x={10} y={PAD_T + chartH / 2} textAnchor="middle" fontSize={8} fill="#94a3b8"
        transform={`rotate(-90, 10, ${PAD_T + chartH / 2})`}>Physical qubits</text>
    </svg>
  );
}

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  sidebar: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
  },
  results: { display: "flex", flexDirection: "column", gap: "16px" },
  timelineCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "16px",
    background: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  narrativeBox: {
    padding: "12px 14px",
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground2,
    fontSize: "13px",
    lineHeight: 1.7,
    color: tokens.colorNeutralForeground2,
  },
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  logRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
});

export function ResourceEstimation() {
  const s = useStyles();
  const { addResourceEstimate, resourceEstimates, jobs } = useApp();
  const [algorithmName, setAlgorithmName] = useState("QAOA (p=3)");
  const [logicalQubits, setLogicalQubits] = useState(40);
  const [problemSizeN, setProblemSizeN] = useState(40);
  const [logicalErrorExp, setLogicalErrorExp] = useState(10);
  const [physicalErrorExp, setPhysicalErrorExp] = useState(3);
  const [codeType, setCodeType] = useState<ErrorCorrectionCode>("surface");
  const [codeDistance, setCodeDistance] = useState(17);
  const [magicOverhead, setMagicOverhead] = useState(10);
  const [estimate, setEstimate] = useState(resourceEstimates[0] ?? null);

  const run = () => {
    const logicalErrorRate = Math.pow(10, -logicalErrorExp);
    const physicalErrorRate = Math.pow(10, -physicalErrorExp);
    const out = computeEstimate(logicalQubits, physicalErrorRate, logicalErrorRate, codeDistance, magicOverhead, problemSizeN, 100);
    const saved = addResourceEstimate({
      jobId: jobs[0]?.id ?? "",
      algorithmName, logicalQubits, logicalErrorRate, physicalErrorRate,
      codeType, codeDistance, problemSizeN, magicStateOverhead: magicOverhead,
      ...out,
    });
    setEstimate(saved);
  };

  return (
    <>
      <PageHeader
        kicker="Step 7 · Analyze"
        title="Resource Estimation"
        sub="Compute fault-tolerant resource requirements: T-gate counts, physical qubit overhead, surface code cycles, and hardware readiness timeline."
      />

      <div className={s.layout}>
        {/* Left: Config */}
        <div className={s.sidebar}>
          <div className={s.sidebarHeader}>Parameters</div>
          <Accordion multiple collapsible defaultOpenItems={["algo", "rates", "code"]}>
            <AccordionItem value="algo">
              <AccordionHeader size="small">Algorithm & Problem</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Algorithm">
                      <Dropdown value={algorithmName} onOptionSelect={(_, d) => setAlgorithmName(d.optionValue ?? algorithmName)}>
                        <Option value="QAOA (p=3)">QAOA (p=3)</Option>
                        <Option value="VQE (reps=3)">VQE (reps=3)</Option>
                        <Option value="HHL">HHL</Option>
                        <Option value="Grover">Grover's Search</Option>
                        <Option value="Shor">Shor's Algorithm</Option>
                      </Dropdown>
                    </Field>
                    <Field label="Logical qubits">
                      <SpinButton value={logicalQubits} min={1} max={10000} step={5}
                        onChange={(_, d) => setLogicalQubits(d.value ?? logicalQubits)} />
                    </Field>
                    <Field label="Problem size N">
                      <SpinButton value={problemSizeN} min={2} max={100000} step={10}
                        onChange={(_, d) => setProblemSizeN(d.value ?? problemSizeN)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="rates">
              <AccordionHeader size="small">Error Rates</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label={`Target logical error rate: 1e-${logicalErrorExp}`}>
                      <Slider min={6} max={15} step={1} value={logicalErrorExp}
                        onChange={(_, d) => setLogicalErrorExp(d.value)} />
                    </Field>
                    <Field label={`Physical error rate: 1e-${physicalErrorExp}`}>
                      <Slider min={2} max={4} step={1} value={physicalErrorExp}
                        onChange={(_, d) => setPhysicalErrorExp(d.value)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="code">
              <AccordionHeader size="small">Error Correction</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Code type">
                      <Dropdown value={codeType} onOptionSelect={(_, d) => setCodeType((d.optionValue ?? codeType) as ErrorCorrectionCode)}>
                        <Option value="surface">Surface code</Option>
                        <Option value="color">Color code</Option>
                        <Option value="honeycomb">Honeycomb code</Option>
                      </Dropdown>
                    </Field>
                    <Field label="Code distance d (odd)">
                      <SpinButton value={codeDistance} min={3} max={51} step={2}
                        onChange={(_, d) => setCodeDistance(d.value ?? codeDistance)} />
                    </Field>
                    <Field label={`Magic state factory overhead: ${magicOverhead}×`}>
                      <Slider min={1} max={20} step={1} value={magicOverhead}
                        onChange={(_, d) => setMagicOverhead(d.value)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <div style={{ padding: "8px 16px 16px" }}>
            <Button appearance="primary" style={{ width: "100%" }} onClick={run}>
              Estimate Resources
            </Button>
          </div>
        </div>

        {/* Right: Results */}
        <div className={s.results}>
          {estimate ? (
            <>
              <ResourceEstimateCard estimate={estimate} />

              <div className={s.narrativeBox}>
                At current hardware improvement rates (~2× physical qubits every 2 years, starting from ~1,000 in 2025), {estimate.algorithmName} at problem size N={estimate.problemSizeN} becomes feasible on fault-tolerant hardware around <strong>{estimate.hardwareReadinessYear}</strong>. This assumes {estimate.codeType} codes with distance d={estimate.codeDistance} and a physical error rate of 1e-{physicalErrorExp}.
              </div>

              <div className={s.timelineCard}>
                <Text weight="semibold">Fault-Tolerant Hardware Readiness Timeline</Text>
                <TimelineChart physicalQubits={estimate.physicalQubits} readinessYear={estimate.hardwareReadinessYear} />
              </div>

              {resourceEstimates.length > 1 && (
                <div style={{ border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: tokens.colorNeutralBackground2, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                        {["Algorithm", "Phys. qubits", "Runtime", "Ready year"].map((h) => (
                          <th key={h} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resourceEstimates.map((est, i) => (
                        <tr key={est.id} style={{ borderBottom: i < resourceEstimates.length - 1 ? `1px solid ${tokens.colorNeutralStroke1}` : "none" }}>
                          <td style={{ padding: "8px 12px", fontSize: 12 }}>{est.algorithmName}</td>
                          <td style={{ padding: "8px 12px", fontSize: 12, fontFamily: tokens.fontFamilyMonospace }}>{est.physicalQubits.toLocaleString()}</td>
                          <td style={{ padding: "8px 12px", fontSize: 12, fontFamily: tokens.fontFamilyMonospace }}>{est.estimatedRuntimeHours.toFixed(1)}h</td>
                          <td style={{ padding: "8px 12px" }}>
                            <Badge appearance="tint" size="small"
                              color={est.hardwareReadinessYear <= 2028 ? "success" : est.hardwareReadinessYear <= 2032 ? "warning" : "danger"}>
                              {est.hardwareReadinessYear}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: "60px 24px", textAlign: "center", border: `1px dashed ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium, color: tokens.colorNeutralForeground3 }}>
              <Text size={400} style={{ display: "block", marginBottom: 8 }}>No estimate yet</Text>
              <Text size={300}>Configure parameters and click "Estimate Resources"</Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
