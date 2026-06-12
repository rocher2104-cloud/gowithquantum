import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Card,
  Checkbox, Drawer, DrawerBody, DrawerHeader, DrawerHeaderTitle,
  Dropdown, Field, Option, ProgressBar, SpinButton, Text, Textarea,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { ArrowRightRegular, DismissRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { CircuitDiagram } from "../components/run/CircuitDiagram";
import { useApp } from "../store/AppStore";
import type { AlgorithmFamily, AlgorithmSpec, AnsatzType, ClassicalOptimizer, EntanglementPattern } from "../data/models";
import type { CircuitModel } from "../data/models";
import { useNavigate } from "react-router-dom";

const ALGO_RATIONALE: Record<AlgorithmFamily, string> = {
  QAOA: "Best for combinatorial optimization (routing, scheduling, portfolio). Maps directly to QUBO/Ising Hamiltonians.",
  VQE: "Best for quantum chemistry and materials. Finds ground-state energies of molecular Hamiltonians.",
  HHL: "Exponential speedup for sparse linear systems. Requires fault-tolerant hardware — NISQ-era results are limited.",
  Grover: "Quadratic speedup for unstructured search. Best for database search, key recovery, and constraint satisfaction.",
  Annealing: "Strong for discrete optimization via D-Wave systems. No gate-model circuit required.",
  Shor: "Polynomial-time factoring. Primarily educational/post-quantum risk assessment; requires thousands of logical qubits.",
  QMC: "Quantum-enhanced Monte Carlo sampling. Best for financial simulation and risk assessment.",
};

const QUBIT_SCALING: Record<AlgorithmFamily, string> = {
  QAOA: "O(N) qubits, O(p·N) depth",
  VQE: "O(2·orbital) qubits, O(reps·N²) depth",
  HHL: "O(log N) qubits, O(1/ε) depth",
  Grover: "O(N) qubits, O(√(2^N)) depth",
  Annealing: "O(N) physical qubits (analog)",
  Shor: "O(log N) qubits (FTQC required)",
  QMC: "O(N) qubits, O(1/ε²) depth",
};

function buildCircuit(family: AlgorithmFamily, reps: number, qaoaLayers: number): CircuitModel {
  const qubits = 4;
  const cols = family === "QAOA" ? qaoaLayers * 3 + 1 : reps * 2 + 2;
  const gates = [];

  // H layer
  for (let q = 0; q < qubits; q++) gates.push({ q, col: 0, label: "H" });

  if (family === "QAOA") {
    for (let p = 0; p < Math.min(qaoaLayers, 3); p++) {
      const base = 1 + p * 3;
      gates.push({ q: 1, col: base, label: "X", control: 0 });
      gates.push({ q: 3, col: base, label: "X", control: 2 });
      gates.push({ q: 0, col: base + 1, label: "Rz" });
      gates.push({ q: 1, col: base + 1, label: "Rz" });
      gates.push({ q: 2, col: base + 2, label: "X", control: 1 });
      gates.push({ q: 3, col: base + 2, label: "Rx" });
    }
  } else if (family === "VQE") {
    for (let r = 0; r < Math.min(reps, 2); r++) {
      const base = 1 + r * 2;
      gates.push({ q: 0, col: base, label: "Ry" });
      gates.push({ q: 1, col: base, label: "Ry" });
      gates.push({ q: 2, col: base, label: "Ry" });
      gates.push({ q: 1, col: base + 1, label: "X", control: 0 });
      gates.push({ q: 3, col: base + 1, label: "X", control: 2 });
    }
  } else {
    for (let r = 0; r < Math.min(reps, 2); r++) {
      gates.push({ q: 1, col: 1 + r * 2, label: "X", control: 0 });
      gates.push({ q: 0, col: 2 + r * 2, label: "Rz" });
    }
  }

  // Measure
  for (let q = 0; q < qubits; q++) gates.push({ q, col: cols - 1, label: "M", measure: true });

  return { qubits, cols, gates };
}

const REVIEW_ITEMS = [
  "QUBO formulation verified",
  "Hamiltonian mapping confirmed",
  "Circuit depth < coherence time",
  "Optimizer convergence tested",
  "Barren plateau risk assessed",
];

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr 200px",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 1000px)": { gridTemplateColumns: "1fr" },
  },
  panel: {
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
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  center: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  depthBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: "12px",
  },
  checklistItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    ":last-child": { borderBottom: "none" },
  },
  rightPanel: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  drawerContent: { padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
});

export function AlgorithmDesign() {
  const s = useStyles();
  const navigate = useNavigate();
  const { algorithmSpecs, upsertAlgorithmSpec, currentWs, jobs } = useApp();
  const existing = algorithmSpecs.find((a) => a.jobId === (jobs[0]?.id ?? 0));

  const [family, setFamily] = useState<AlgorithmFamily>(existing?.algorithmFamily ?? "QAOA");
  const [ansatz, setAnsatz] = useState<AnsatzType>(existing?.ansatzType ?? "EfficientSU2");
  const [reps, setReps] = useState(existing?.reps ?? 3);
  const [entanglement, setEntanglement] = useState<EntanglementPattern>(existing?.entanglement ?? "circular");
  const [qaoaLayers, setQaoaLayers] = useState(existing?.qaoaLayers ?? 3);
  const [optimizer, setOptimizer] = useState<ClassicalOptimizer>(existing?.optimizer ?? "COBYLA");
  const [maxIterations, setMaxIterations] = useState(existing?.maxIterations ?? 500);
  const [quboText, setQuboText] = useState(existing?.quboFormulation ?? "");
  const [hamiltonianText, setHamiltonianText] = useState(existing?.hamiltonianDescription ?? "");
  const [checklist, setChecklist] = useState<boolean[]>(
    REVIEW_ITEMS.map((_, i) => existing?.peerReviewChecklist?.[i]?.checked ?? false)
  );
  const [pseudocodeOpen, setPseudocodeOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const circuit = buildCircuit(family, reps, qaoaLayers);
  const depth = family === "QAOA" ? qaoaLayers * 3 + 1 : reps * 2 + 2;
  const checkedCount = checklist.filter(Boolean).length;

  const save = () => {
    upsertAlgorithmSpec({
      jobId: jobs[0]?.id ?? 0,
      algorithmFamily: family,
      quboFormulation: quboText,
      hamiltonianDescription: hamiltonianText,
      ansatzType: ansatz,
      reps, entanglement, qaoaLayers, optimizer, maxIterations,
      estimatedDepth: depth,
      peerReviewChecklist: REVIEW_ITEMS.map((item, i) => ({ item, checked: checklist[i] })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pseudocode = `# ${family} Circuit
from qiskit.circuit.library import ${family === "QAOA" ? "QAOAAnsatz" : "EfficientSU2"}
from qiskit.quantum_info import SparsePauliOp
from scipy.optimize import minimize

cost_op = SparsePauliOp.from_list([...])  # Your Hamiltonian
ansatz = ${family === "QAOA" ? `QAOAAnsatz(cost_op, reps=${qaoaLayers})` : `EfficientSU2(num_qubits=4, reps=${reps}, entanglement="${entanglement}")`}
ansatz.measure_all()

def objective(params):
    bound = ansatz.assign_parameters(params)
    counts = backend.run(transpile(bound, backend), shots=1024).result().get_counts()
    return expectation_value(counts, cost_op)

result = minimize(objective, x0=initial_params, method="${optimizer}", options={"maxiter": ${maxIterations}})
best_solution = decode_bitstring(argmax(result.counts))`;

  return (
    <>
      <PageHeader
        kicker="Step 3 · Research"
        title="Algorithm Design"
        sub="Select an algorithm family, configure variational parameters, formulate the QUBO/Hamiltonian, and complete the peer review checklist."
      />

      <div className={s.layout}>
        {/* Left: Config */}
        <div className={s.panel}>
          <div className={s.panelHeader}>Configuration</div>
          <Accordion multiple collapsible defaultOpenItems={["algo", "variational", "optimizer", "formulation"]}>
            <AccordionItem value="algo">
              <AccordionHeader size="small">Algorithm Selection</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Algorithm family">
                      <Dropdown value={family}
                        onOptionSelect={(_, d) => setFamily((d.optionValue ?? family) as AlgorithmFamily)}>
                        {(["QAOA", "VQE", "HHL", "Grover", "Annealing", "Shor", "QMC"] as AlgorithmFamily[]).map((f) => (
                          <Option key={f} value={f}>{f}</Option>
                        ))}
                      </Dropdown>
                    </Field>
                    <Card>
                      <Text size={100} style={{ color: tokens.colorNeutralForeground2, lineHeight: 1.6 }}>
                        {ALGO_RATIONALE[family]}
                      </Text>
                      <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginTop: 4, fontFamily: tokens.fontFamilyMonospace }}>
                        {QUBIT_SCALING[family]}
                      </Text>
                    </Card>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="variational">
              <AccordionHeader size="small">Variational Parameters</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Ansatz type">
                      <Dropdown value={ansatz} onOptionSelect={(_, d) => setAnsatz((d.optionValue ?? ansatz) as AnsatzType)}>
                        <Option value="RealAmplitudes">RealAmplitudes</Option>
                        <Option value="EfficientSU2">EfficientSU2</Option>
                        <Option value="TwoLocal">TwoLocal</Option>
                        <Option value="custom">Custom</Option>
                      </Dropdown>
                    </Field>
                    <Field label="Reps / depth">
                      <SpinButton value={reps} min={1} max={10} onChange={(_, d) => setReps(d.value ?? reps)} />
                    </Field>
                    <Field label="Entanglement">
                      <Dropdown value={entanglement} onOptionSelect={(_, d) => setEntanglement((d.optionValue ?? entanglement) as EntanglementPattern)}>
                        <Option value="linear">Linear</Option>
                        <Option value="circular">Circular</Option>
                        <Option value="full">Full</Option>
                      </Dropdown>
                    </Field>
                    {family === "QAOA" && (
                      <Field label="QAOA p layers">
                        <SpinButton value={qaoaLayers} min={1} max={10} onChange={(_, d) => setQaoaLayers(d.value ?? qaoaLayers)} />
                      </Field>
                    )}
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="optimizer">
              <AccordionHeader size="small">Classical Optimizer</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="Optimizer">
                      <Dropdown value={optimizer} onOptionSelect={(_, d) => setOptimizer((d.optionValue ?? optimizer) as ClassicalOptimizer)}>
                        <Option value="COBYLA">COBYLA (gradient-free)</Option>
                        <Option value="SPSA">SPSA (stochastic)</Option>
                        <Option value="L-BFGS-B">L-BFGS-B (gradient-based)</Option>
                        <Option value="Adam">Adam (adaptive)</Option>
                        <Option value="SLSQP">SLSQP (constrained)</Option>
                      </Dropdown>
                    </Field>
                    <Field label="Max iterations">
                      <SpinButton value={maxIterations} min={50} max={10000} step={50}
                        onChange={(_, d) => setMaxIterations(d.value ?? maxIterations)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="formulation">
              <AccordionHeader size="small">QUBO / Hamiltonian</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <Field label="QUBO formulation">
                      <Textarea rows={3} placeholder="Minimize: Σ_{(i,j)∈E} w_ij * (1 - z_i·z_j) / 2..."
                        value={quboText} onChange={(_, d) => setQuboText(d.value)} />
                    </Field>
                    <Field label="Hamiltonian description">
                      <Textarea rows={3} placeholder="H_C = Σ_{(i,j)∈E} w_ij * (I - Z_i⊗Z_j) / 2..."
                        value={hamiltonianText} onChange={(_, d) => setHamiltonianText(d.value)} />
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Button appearance="primary" style={{ width: "100%" }} onClick={save}>
              {saved ? "Saved ✓" : "Save Algorithm Spec"}
            </Button>
            <Button appearance="secondary" style={{ width: "100%" }}
              icon={<ArrowRightRegular />} iconPosition="after"
              onClick={() => navigate("/simulation")}>
              Continue to Simulation
            </Button>
          </div>
        </div>

        {/* Center: Circuit preview */}
        <div className={s.center}>
          <div className={s.panel} style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text weight="semibold">Circuit Preview</Text>
              <Button size="small" appearance="secondary" onClick={() => setPseudocodeOpen(true)}>
                View Pseudocode
              </Button>
            </div>
            <CircuitDiagram circuit={circuit} />
            <div className={s.depthBadge} style={{ marginTop: 12 }}>
              <Badge appearance="tint" color="brand">Estimated depth: {depth} layers</Badge>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                for {family} with {family === "QAOA" ? `p=${qaoaLayers}` : `reps=${reps}`}
              </Text>
            </div>
          </div>
        </div>

        {/* Right: Peer review */}
        <div className={s.rightPanel}>
          <Text weight="semibold" size={300}>Peer Review Checklist</Text>
          <ProgressBar value={checkedCount / REVIEW_ITEMS.length} color={checkedCount === REVIEW_ITEMS.length ? "success" : "brand"} />
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {checkedCount} / {REVIEW_ITEMS.length} items verified
          </Text>
          <div>
            {REVIEW_ITEMS.map((item, i) => (
              <div key={i} className={s.checklistItem}>
                <Checkbox
                  checked={checklist[i]}
                  onChange={() => setChecklist((prev) => prev.map((v, j) => j === i ? !v : v))}
                  label={<Text size={200}>{item}</Text>}
                />
              </div>
            ))}
          </div>
          {checkedCount === REVIEW_ITEMS.length && (
            <Badge appearance="tint" color="success">All items verified ✓</Badge>
          )}
          <Button size="small" appearance="secondary" style={{ marginTop: 8 }}>
            Mark for peer review
          </Button>
        </div>
      </div>

      {/* Pseudocode drawer */}
      <Drawer open={pseudocodeOpen} onOpenChange={(_, d) => setPseudocodeOpen(d.open)} position="end" size="medium">
        <DrawerHeader>
          <DrawerHeaderTitle action={
            <Button appearance="subtle" icon={<DismissRegular />} onClick={() => setPseudocodeOpen(false)} />
          }>
            Generated Pseudocode
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className={s.drawerContent}>
            <Badge appearance="tint" color="brand">{family}</Badge>
            <pre style={{
              fontFamily: tokens.fontFamilyMonospace, fontSize: 12,
              background: "#0d0d1a", color: "#a5b4fc",
              padding: "16px", borderRadius: 8, overflow: "auto",
              whiteSpace: "pre-wrap", lineHeight: 1.7,
            }}>
              {pseudocode}
            </pre>
            <Button appearance="secondary">Copy to clipboard</Button>
          </div>
        </DrawerBody>
      </Drawer>
    </>
  );
}
