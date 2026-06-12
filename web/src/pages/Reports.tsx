import { useState } from "react";
import {
  Badge, Button, Combobox, Divider, Dropdown, Field, Option,
  Radio, RadioGroup, SpinButton, Switch, Text, Textarea,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { DocumentRegular, ArrowDownloadRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { useApp } from "../store/AppStore";
import { timeAgo } from "../lib/time";

const JOURNAL_TARGETS = [
  "Nature", "Nature Physics", "Physical Review Letters", "Physical Review X",
  "npj Quantum Information", "PRX Quantum", "Science", "Science Advances",
  "Quantum (journal)", "IEEE Transactions on Quantum Engineering", "Custom",
];

const CITATION_STYLES = ["IEEE", "APA", "Chicago", "Vancouver"];

type ReportFormat = "internal" | "arxiv" | "journal" | "executive";

function generateReport(format: ReportFormat, algorithm: string, authors: string, abstractLen: number, includeCircuit: boolean, includeBenchmark: boolean, includeResource: boolean): string {
  const authorList = authors.split("\n").filter((a) => a.trim()).join(", ");
  const date = "2026-06-10";

  if (format === "executive") {
    return `## Executive Summary — Quantum Routing Experiment
**Date:** ${date}  **Authors:** ${authorList || "Quantum Research Team"}

### Result in plain terms
We tested a quantum computer on your 5-truck, 40-stop delivery problem. The quantum approach found a route plan that cuts total distance by **18%** compared to the current baseline.

### What this means for the business
At today's problem size, a classical solver also achieves similar quality — so there is no quantum cost advantage *yet*. However, as your network grows beyond ~120 stops, quantum approaches are projected to outperform classical methods significantly.

### Recommended action
Keep the quantum-derived route as the working baseline. Budget for a re-run when the network grows, or when improved quantum hardware becomes available (projected ~2031 at current rates).

### Confidence
High. The result appeared consistently across 1,024 hardware runs.`;
  }

  if (format === "arxiv") {
    return `# Quantum Approximate Optimization for Vehicle Routing: A NISQ-Era Demonstration

**Authors:** ${authorList || "Anonymous"}
**Date:** ${date}
**arXiv category:** quant-ph

## Abstract
We demonstrate the application of the Quantum Approximate Optimization Algorithm (QAOA) at depth p=3 to a Capacitated Vehicle Routing Problem instance with N=40 nodes on IBM's Heron r2 processor. Using Zero-Noise Extrapolation (ZNE) for error mitigation, we achieve an approximation ratio of 0.814 on hardware, compared to 0.892 in noiseless simulation and 0.940 for a classical MILP solver. While quantum advantage is not demonstrated at this scale, our results establish a practical baseline and identify N≈120 nodes as the projected quantum advantage crossover.

${includeCircuit ? "## Circuit Structure\nThe QAOA circuit consists of p=3 layers of cost and mixing Hamiltonians, transpiled to IBM's native gate set (CX, RZ, SX) using SABRE routing at optimization level 3. The resulting circuit has depth 28 after transpilation (47 before).\n\n" : ""}${includeBenchmark ? "## Benchmark Results\nWe compare against three classical baselines: MILP (94% optimal), Simulated Annealing (88% optimal), and Random Greedy (71% optimal). The QAOA result of 81.4% on hardware falls between SA and MILP.\n\n" : ""}${includeResource ? "## Resource Estimates for Fault-Tolerant Operation\nA fault-tolerant implementation using surface codes (d=17, 1e-3 physical error rate) requires approximately 14,480 physical qubits and 3.2 hours of runtime. This becomes feasible on projected hardware around 2031.\n\n" : ""}## Conclusion
QAOA at depth p=3 is a viable approach for routing problems at N=40 nodes on near-term hardware with error mitigation. Quantum advantage is expected when hardware error rates reach below 0.05% two-qubit gate fidelity and N>120 nodes.`;
  }

  return `## Technical Report — Quantum Routing Experiment
**Date:** ${date}
**Authors:** ${authorList || "Research Team"}
**Workspace:** Logistics R&D

### 1. Problem Formulation
The 5-truck, 40-stop Capacitated VRP was encoded as a QUBO with ${includeCircuit ? "penalty terms for capacity and time-window constraints. The resulting Ising Hamiltonian" : "binary decision variables"} has N=40 variables.

### 2. Algorithm
QAOA at p=3 with EfficientSU2 ansatz, COBYLA optimizer (500 max iterations). Circuit depth: 22 layers after transpilation.

### 3. Classical Simulation Results
- Noiseless approximation ratio: 89.2%
- Noisy (depolarizing p=0.2%): 76.1%
- Convergence achieved at iteration ~22

${includeBenchmark ? "### 4. Classical Benchmark\nMILP solver (OR-Tools): 94.0% in 1.1s. Quantum (hardware): 81.4% in 6.2s. No quantum advantage demonstrated at N=40.\n\n" : ""}### 5. Hardware Execution
Backend: IBM Heron r2 (156 qubits). Error mitigation: ZNE (scale factors [1,2,3]). Shots: 4,096.
Hardware approximation ratio: 81.4%.

${includeResource ? "### 6. Fault-Tolerant Resource Estimates\nPhysical qubits: ~14,480. Code: surface d=17. Est. runtime: 3.2 hours. Hardware readiness: ~2031.\n\n" : ""}### 7. Recommendation
Accept this result as baseline. Revisit at N>120 stops where quantum advantage is projected.`;
}

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  configPanel: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  previewCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  markdown: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: "13px",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    color: tokens.colorNeutralForeground1,
  },
  figureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  figureItem: {
    padding: "10px 12px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyTable: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: "hidden",
  },
});

export function Reports() {
  const s = useStyles();
  const { jobs, updateJob } = useApp();
  const [format, setFormat] = useState<ReportFormat>("internal");
  const [journal, setJournal] = useState("Nature");
  const [citationStyle, setCitationStyle] = useState("IEEE");
  const [authors, setAuthors] = useState("Rocher Botha\nAmara Osei\nWei Zhang");
  const [abstractLen, setAbstractLen] = useState(200);
  const [includeCircuit, setIncludeCircuit] = useState(true);
  const [includeBenchmark, setIncludeBenchmark] = useState(true);
  const [includeResource, setIncludeResource] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const handleGenerate = () => {
    const md = generateReport(format, "QAOA (p=3)", authors, abstractLen, includeCircuit, includeBenchmark, includeResource);
    setGeneratedReport(md);
    const job = jobs.find((j) => j.status === "done");
    if (job) updateJob(job.id, { report: md });
  };

  const figures = ["Convergence chart", "Measurement histogram", "Circuit diagram", "Scaling chart", "Qubit map"];

  return (
    <>
      <PageHeader
        kicker="Step 8 · Publish"
        title="Reports & Publication"
        sub="Generate structured reports in internal, arXiv preprint, journal, or executive summary format. Export figures and download in multiple formats."
      />

      <div className={s.layout}>
        {/* Left: Config */}
        <div className={s.configPanel}>
          <Text weight="semibold" size={300}>Report Configuration</Text>

          <Field label="Report format">
            <RadioGroup value={format} onChange={(_, d) => setFormat(d.value as ReportFormat)} layout="vertical">
              <Radio value="internal" label="Internal Technical Report" />
              <Radio value="arxiv" label="arXiv Preprint" />
              <Radio value="journal" label="Journal Submission" />
              <Radio value="executive" label="Executive Summary" />
            </RadioGroup>
          </Field>

          {format === "journal" && (
            <Field label="Journal target">
              <Combobox value={journal} onOptionSelect={(_, d) => setJournal(d.optionText ?? journal)}>
                {JOURNAL_TARGETS.map((j) => <Option key={j} value={j}>{j}</Option>)}
              </Combobox>
            </Field>
          )}

          <Field label="Citation style">
            <Dropdown value={citationStyle} onOptionSelect={(_, d) => setCitationStyle(d.optionValue ?? citationStyle)}>
              {CITATION_STYLES.map((c) => <Option key={c} value={c}>{c}</Option>)}
            </Dropdown>
          </Field>

          <Field label="Authors (one per line)">
            <Textarea rows={4} value={authors} onChange={(_, d) => setAuthors(d.value)} />
          </Field>

          {(format === "arxiv" || format === "journal") && (
            <Field label={`Abstract length: ${abstractLen} words`}>
              <SpinButton value={abstractLen} min={100} max={400} step={25}
                onChange={(_, d) => setAbstractLen(d.value ?? abstractLen)} />
            </Field>
          )}

          <Divider />

          <Text weight="semibold" size={200}>Include sections</Text>
          <Switch label="Circuit diagrams" checked={includeCircuit} onChange={(_, d) => setIncludeCircuit(d.checked)} />
          <Switch label="Benchmark comparisons" checked={includeBenchmark} onChange={(_, d) => setIncludeBenchmark(d.checked)} />
          <Switch label="FTQC resource estimates" checked={includeResource} onChange={(_, d) => setIncludeResource(d.checked)} />

          <Button appearance="primary" style={{ width: "100%" }} onClick={handleGenerate}>
            Generate Report
          </Button>
        </div>

        {/* Right: Preview + actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className={s.previewCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text weight="semibold">
                {generatedReport ? `${format === "internal" ? "Technical Report" : format === "arxiv" ? "arXiv Preprint" : format === "executive" ? "Executive Summary" : "Journal Draft"}` : "Preview"}
              </Text>
              {generatedReport && (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="small" appearance="secondary" icon={<ArrowDownloadRegular />}>
                    .md
                  </Button>
                  <Button size="small" appearance="secondary" icon={<ArrowDownloadRegular />}>
                    .tex
                  </Button>
                  <Button size="small" appearance="secondary" icon={<ArrowDownloadRegular />}>
                    .pdf
                  </Button>
                </div>
              )}
            </div>
            {generatedReport ? (
              <pre className={s.markdown}>{generatedReport}</pre>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                <DocumentRegular fontSize={48} style={{ marginBottom: 8, display: "block" }} />
                <Text size={300}>Click "Generate Report" to create your report</Text>
              </div>
            )}
          </div>

          {/* Figure exports */}
          <div className={s.configPanel}>
            <Text weight="semibold" size={300}>Figure Export</Text>
            <div className={s.figureGrid}>
              {figures.map((fig) => (
                <div key={fig} className={s.figureItem}>
                  <Text size={200}>{fig}</Text>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button size="small" appearance="subtle">SVG</Button>
                    <Button size="small" appearance="subtle">PNG</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past reports */}
          {jobs.filter((j) => j.report).length > 0 && (
            <div className={s.historyTable}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: tokens.colorNeutralBackground2, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                    {["Job", "Format", "Created", ""].map((h) => (
                      <th key={h} style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: tokens.colorNeutralForeground3, textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.filter((j) => j.report).map((job, i) => (
                    <tr key={job.id} style={{ borderBottom: `1px solid ${tokens.colorNeutralStroke1}` }}>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{job.title.slice(0, 40)}...</td>
                      <td style={{ padding: "8px 12px" }}><Badge appearance="tint" color="brand" size="small">Technical</Badge></td>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: tokens.colorNeutralForeground3 }}>{timeAgo(job.createdAt)}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <Button size="small" appearance="subtle" icon={<ArrowDownloadRegular />}>Download</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
