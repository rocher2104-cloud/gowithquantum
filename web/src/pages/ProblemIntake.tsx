import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Card, CardHeader,
  Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
  Dropdown, Field, InfoLabel, Option, Slider, SpinButton, Text, Textarea,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { DocumentRegular, ArrowRightRegular, CheckmarkCircleRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { HITLGateCard } from "../components/workflow/HITLGateCard";
import { useApp } from "../store/AppStore";
import type { ComplexityClass, ProblemBrief, QuantumPriority } from "../data/models";
import { accents } from "../theme/brand";
import { useNavigate } from "react-router-dom";

const DOMAINS = ["Logistics", "Chemistry", "Finance", "Materials", "Cryptography", "Energy", "Machine Learning", "Custom"];
const COMPLEXITY_CLASSES: ComplexityClass[] = ["NP-hard", "BQP", "PSPACE", "polynomial", "unknown"];

const ADVANTAGE_MAP: Record<string, { status: "proven" | "conjectured" | "none" | "unknown"; note: string }> = {
  Logistics: { status: "conjectured", note: "QAOA shows promise at N>120 nodes; no demonstrated advantage at small scale yet." },
  Chemistry: { status: "proven", note: "VQE has demonstrated quantum advantage for molecular ground-state simulation on NISQ hardware." },
  Finance: { status: "conjectured", note: "Quantum Monte Carlo shows theoretical advantage for option pricing; hardware results inconclusive." },
  Materials: { status: "conjectured", note: "Quantum simulation of materials shows promise; error correction required for practical advantage." },
  Cryptography: { status: "proven", note: "Shor's algorithm provides proven polynomial-time factoring vs classical super-polynomial." },
  Energy: { status: "conjectured", note: "Quantum annealing shows advantage for magnetic field optimization in specific regimes." },
  "Machine Learning": { status: "unknown", note: "Quantum kernel SVM shows theoretical advantage; no practical hardware demonstration yet." },
  Custom: { status: "unknown", note: "Quantum advantage status cannot be determined without domain-specific analysis." },
};

const QUBIT_ESTIMATES: Record<string, number> = {
  Logistics: 40, Chemistry: 12, Finance: 30, Materials: 50,
  Cryptography: 2048, Energy: 60, "Machine Learning": 20, Custom: 30,
};

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "24px",
    alignItems: "start",
    "@media (max-width: 800px)": { gridTemplateColumns: "1fr" },
  },
  settings: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  settingsHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  briefCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "20px",
  },
  briefMarkdown: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: "13px",
    lineHeight: 1.7,
    color: tokens.colorNeutralForeground1,
    "& h1, & h2, & h3": { margin: "14px 0 6px", fontWeight: 700, color: tokens.colorNeutralForeground1 },
    "& h2": { fontSize: "15px" },
    "& h3": { fontSize: "13px" },
    "& strong": { fontWeight: 700 },
    "& hr": { border: "none", borderTop: `1px solid ${tokens.colorNeutralStroke2}`, margin: "12px 0" },
  },
  statusRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 180px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px 14px",
    background: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: tokens.fontFamilyMonospace,
  },
  nextSteps: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "12px" },
});

function renderMd(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^---$/gm, "<hr />")
    .replace(/^(\d+)\. (.+)$/gm, "<div style='padding:2px 0'><strong>$1.</strong> $2</div>")
    .replace(/^- (.+)$/gm, "<div style='padding:2px 0 2px 12px'>· $1</div>")
    .replace(/\n/g, "<br />");
}

function generateBrief(domain: string, complexity: ComplexityClass, problemSize: number, problemStatement: string, priority: QuantumPriority, approxRatio: number): string {
  const adv = ADVANTAGE_MAP[domain] ?? ADVANTAGE_MAP["Custom"];
  const qubits = Math.round(QUBIT_ESTIMATES[domain] ?? 30) + Math.floor(problemSize / 5);

  return `## Problem Brief

**Domain:** ${domain}
**Complexity class:** ${complexity}
**Priority:** ${priority === "speed" ? "Time-to-solution" : priority === "accuracy" ? "Solution quality" : "Cost efficiency"}
**Target approximation ratio:** ${(approxRatio * 100).toFixed(0)}%
**Problem size:** ~${problemSize} variables/nodes

---

### Quantum Advantage Status: ${adv.status.charAt(0).toUpperCase() + adv.status.slice(1)}

${adv.note}

---

### Qubit Estimate

Approximately **${qubits} logical qubits** required for this problem size. On current NISQ hardware (error-corrected logical qubits require ~1,000–10,000 physical qubits each), this would need ~${(qubits * 2500).toLocaleString()} physical qubits for fault-tolerant operation.

---

### Problem Statement

${problemStatement || "No problem statement provided."}

---

### Recommended Next Steps

1. **Literature Review** — Search arXiv for ${domain.toLowerCase()} QUBO formulations and prior art
2. **Algorithm Design** — Map this to a QUBO and select ${domain === "Chemistry" ? "VQE" : domain === "Cryptography" ? "Shor's" : "QAOA"} as the primary candidate
3. **Classical Simulation** — Validate at small scale (≤20 variables) before hardware submission`;
}

export function ProblemIntake() {
  const s = useStyles();
  const navigate = useNavigate();
  const { currentWs, jobs, upsertProblemBrief, problemBriefs } = useApp();

  const [domain, setDomain] = useState("Logistics");
  const [problemSize, setProblemSize] = useState(40);
  const [priority, setPriority] = useState<QuantumPriority>("speed");
  const [approxRatio, setApproxRatio] = useState(0.9);
  const [complexity, setComplexity] = useState<ComplexityClass>("NP-hard");
  const [problemStatement, setProblemStatement] = useState("");
  const [brief, setBrief] = useState<ProblemBrief | null>(problemBriefs[0] ?? null);
  const [exportOpen, setExportOpen] = useState(false);

  const adv = ADVANTAGE_MAP[domain] ?? ADVANTAGE_MAP["Custom"];
  const qubits = Math.round(QUBIT_ESTIMATES[domain] ?? 30) + Math.floor(problemSize / 5);
  const activeJob = jobs.find((j) => j.ws === currentWs) ?? jobs[0];

  const generateBriefAction = () => {
    const text = generateBrief(domain, complexity, problemSize, problemStatement, priority, approxRatio);
    const saved = upsertProblemBrief({
      jobId: activeJob?.id ?? 0,
      workspaceId: currentWs,
      problemStatement, domain, complexityClass: complexity,
      quantumAdvantageLiterature: adv.status,
      qubitEstimate: qubits,
      targetApproximationRatio: approxRatio,
      priority, problemSizeEstimate: `${problemSize} variables`,
      generatedBrief: text, committeeExported: false,
    });
    setBrief(saved);
  };

  const advantageColor = adv.status === "proven" ? accents.advantage : adv.status === "conjectured" ? accents.human : "#64748b";
  const advantageAppearance = adv.status === "proven" ? "success" : adv.status === "conjectured" ? "warning" : "informative";

  return (
    <>
      <PageHeader
        kicker="Step 1 · Research"
        title="Problem Intake & Scoping"
        sub="Map your problem to a complexity class, assess quantum advantage potential, and generate a structured problem brief."
      />

      <div className={s.layout}>
        {/* Left: Settings */}
        <div className={s.settings}>
          <div className={s.settingsHeader}>Configuration</div>
          <Accordion multiple collapsible defaultOpenItems={["domain", "scope", "problem"]}>
            <AccordionItem value="domain">
              <AccordionHeader size="small">Domain & Priority</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Domain">
                      <Dropdown value={domain} onOptionSelect={(_, d) => setDomain(d.optionValue ?? domain)}>
                        {DOMAINS.map((d) => <Option key={d} value={d}>{d}</Option>)}
                      </Dropdown>
                    </Field>
                    <Field label="Quantum priority">
                      <Dropdown value={priority} onOptionSelect={(_, d) => setPriority((d.optionValue ?? priority) as QuantumPriority)}>
                        <Option value="speed">Speed (time-to-solution)</Option>
                        <Option value="accuracy">Accuracy (solution quality)</Option>
                        <Option value="cost">Cost efficiency</Option>
                      </Dropdown>
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="scope">
              <AccordionHeader size="small">Problem Scope</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Problem size (variables/nodes)">
                      <SpinButton value={problemSize} min={2} max={10000} step={5}
                        onChange={(_, d) => setProblemSize(d.value ?? problemSize)} />
                    </Field>
                    <Field label={<InfoLabel info="Computational complexity class of this problem type.">Complexity class</InfoLabel>}>
                      <Dropdown value={complexity} onOptionSelect={(_, d) => setComplexity((d.optionValue ?? complexity) as ComplexityClass)}>
                        {COMPLEXITY_CLASSES.map((c) => <Option key={c} value={c}>{c}</Option>)}
                      </Dropdown>
                    </Field>
                    <Field label={`Target approximation ratio: ${(approxRatio * 100).toFixed(0)}%`}>
                      <Slider min={0.5} max={1.0} step={0.01}
                        value={approxRatio}
                        onChange={(_, d) => setApproxRatio(d.value)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="problem">
              <AccordionHeader size="small">Problem Statement</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <Field label="Describe your problem">
                    <Textarea
                      rows={12}
                      placeholder="Describe what you want to optimise, simulate, or solve..."
                      value={problemStatement}
                      onChange={(_, d) => setProblemStatement(d.value)}
                    />
                  </Field>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Button appearance="primary" style={{ width: "100%" }} onClick={generateBriefAction}>
              Generate Problem Brief
            </Button>
          </div>
        </div>

        {/* Right: Brief preview */}
        <div className={s.right}>
          {/* Quick status cards */}
          <div className={s.statusRow}>
            <div className={s.statCard}>
              <Text className={s.statLabel}>Complexity</Text>
              <Text className={s.statValue}>{complexity}</Text>
            </div>
            <div className={s.statCard}>
              <Text className={s.statLabel}>Quantum advantage</Text>
              <Badge appearance="tint" color={advantageAppearance as any} style={{ marginTop: 2 }}>
                {adv.status.charAt(0).toUpperCase() + adv.status.slice(1)}
              </Badge>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginTop: 2 }}>{adv.note.slice(0, 60)}...</Text>
            </div>
            <div className={s.statCard}>
              <Text className={s.statLabel}>Qubit estimate</Text>
              <Text className={s.statValue}>{qubits}</Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>logical qubits</Text>
            </div>
          </div>

          {/* Generated brief */}
          {brief ? (
            <div className={s.briefCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text weight="semibold" size={400}>Problem Brief</Text>
                <Badge appearance="tint" color="success" icon={<CheckmarkCircleRegular />}>Generated</Badge>
              </div>
              <div
                className={s.briefMarkdown}
                dangerouslySetInnerHTML={{ __html: renderMd(brief.generatedBrief) }}
              />

              <div className={s.nextSteps}>
                <Button size="small" appearance="secondary" icon={<ArrowRightRegular />} iconPosition="after"
                  onClick={() => navigate("/literature")}>
                  Literature Review
                </Button>
                <Button size="small" appearance="secondary" icon={<ArrowRightRegular />} iconPosition="after"
                  onClick={() => navigate("/algorithm")}>
                  Algorithm Design
                </Button>
                <Button size="small" appearance="subtle" icon={<DocumentRegular />}
                  onClick={() => setExportOpen(true)}>
                  Export for Committee
                </Button>
              </div>
            </div>
          ) : (
            <div className={s.briefCard} style={{ textAlign: "center", padding: "48px 24px" }}>
              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                Configure your problem on the left and click "Generate Problem Brief"
              </Text>
            </div>
          )}

          {/* HITL: Committee presentation */}
          <HITLGateCard
            gate="committee"
            onAction={(action) => {
              if (action === "export") setExportOpen(true);
            }}
          />
        </div>
      </div>

      {/* Export dialog */}
      <Dialog open={exportOpen} onOpenChange={(_, d) => setExportOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Export for Research Committee</DialogTitle>
            <DialogContent>
              <Text>Choose your export format for the problem brief presentation:</Text>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {["Markdown (.md)", "PDF (print-ready)", "Email draft"].map((fmt) => (
                  <Button key={fmt} appearance="secondary" icon={<DocumentRegular />}
                    onClick={() => setExportOpen(false)}>
                    {fmt}
                  </Button>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="subtle" onClick={() => setExportOpen(false)}>Cancel</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
