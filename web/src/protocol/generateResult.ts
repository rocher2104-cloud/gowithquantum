/**
 * Per-job result generation. In the prototype this fabricates a plausible,
 * domain-appropriate ResultData from the fit triage; the backend will replace
 * it with real agent output carried by the `report` event.
 */
import type { CircuitModel, HistogramBar, ResultData, VerdictClass } from "../data/models";
import { detectFit, type FitResult } from "../data/fit";

function histogram(states: string[], weights: number[], shots: number): HistogramBar[] {
  const total = weights.reduce((a, b) => a + b, 0);
  return states.map((state, i) => ({ state, count: Math.round((weights[i] / total) * shots) }));
}

function circuit(qubits: number): CircuitModel {
  const gates: CircuitModel["gates"] = [];
  for (let q = 0; q < qubits; q++) gates.push({ q, col: 0, label: "H" });
  for (let q = 0; q + 1 < qubits; q += 2) gates.push({ q: q + 1, col: 1, label: "X", control: q });
  for (let q = 0; q < qubits; q++) gates.push({ q, col: 2, label: "Rz" });
  if (qubits > 2) gates.push({ q: 2, col: 3, label: "X", control: 1 });
  gates.push({ q: 0, col: 3, label: "Ry" });
  for (let q = 0; q < qubits; q++) gates.push({ q, col: 4, label: "M", measure: true });
  return { qubits, cols: 5, gates };
}

const SCALING = [
  { size: 20, classical: 0.2, quantum: 4.0 },
  { size: 40, classical: 1.1, quantum: 5.2 },
  { size: 80, classical: 8.0, quantum: 7.0 },
  { size: 160, classical: 62, quantum: 9.5 },
  { size: 320, classical: 480, quantum: 13 },
  { size: 640, classical: 3800, quantum: 18 },
];

interface Template {
  headline: string;
  body: string;
  stats: [string, string][];
  verdict: string;
  verdictClass: VerdictClass;
  verdictLabel: string;
  states: string[];
  weights: number[];
  qubits: number;
  code: string;
  report: string;
}

function templateFor(fit: FitResult, title: string): Template {
  switch (fit.domain) {
    case "chemistry":
    case "materials":
      return {
        headline: "We found the lowest-energy configuration with high confidence.",
        body: "VQE converged after 30 optimisation rounds. The ground-state energy estimate is stable across repeated runs, and the dominant measurement outcome confirms the configuration.",
        stats: [["Energy estimate", "-1.86 Ha"], ["Convergence", "30 iters"], ["Quantum advantage", fit.verdict === "advantage-today" ? "Yes" : "Emerging"]],
        verdict:
          fit.verdict === "advantage-today"
            ? "Trapped-ion hardware reproduced the simulator's answer within chemical accuracy — this is a genuine quantum result that classical methods struggle to match at larger molecule sizes."
            : "At this system size a classical solver still matches the quantum estimate. The same pipeline scales to systems classical methods can't reach — re-run as the structure grows.",
        verdictClass: fit.verdict === "advantage-today" ? "vb-advantage" : "vb-hybrid",
        verdictLabel: fit.verdict === "advantage-today" ? "Quantum advantage" : "Hybrid result",
        states: ["0011", "0101", "1001", "0110", "1100"],
        weights: [52, 18, 12, 10, 8],
        qubits: 4,
        code: `from qiskit.circuit.library import EfficientSU2\nfrom qiskit_aer import AerSimulator\n\nansatz = EfficientSU2(4, reps=3, entanglement="circular")\n# ... VQE loop: estimate <H> and minimise with COBYLA\nresult = backend.run(qc, shots=4096).result()`,
        report: `## In short\nWe estimated the lowest-energy configuration for your system and the answer is stable and reproducible.\n\n## What we did\nWe mapped your problem onto a Hamiltonian, ran VQE with an EfficientSU2 ansatz, and verified convergence across repeated runs.\n\n## What we found\n- The energy estimate converged after 30 iterations.\n- The dominant measurement outcome appeared in over half of all shots.\n\n## Recommended next step\n${fit.verdict === "advantage-today" ? "This result is hardware-validated — use it directly." : "Use this as your baseline and re-run when the system size grows; that's where quantum pulls ahead."}`,
      };
    case "search":
      return {
        headline: "We found the marked item in far fewer steps than classical search.",
        body: "Grover's algorithm located the target in O(√N) iterations. The winning bitstring dominated the measurement histogram — a textbook-clean amplification signal.",
        stats: [["Iterations", "89 vs 65,536"], ["Confidence", "Very high"], ["Quantum advantage", "Yes"]],
        verdict:
          "This is a provable quadratic speedup: the quantum search needed dramatically fewer lookups than classical brute force. The advantage grows with the size of the search space.",
        verdictClass: "vb-advantage",
        verdictLabel: "Quantum advantage",
        states: ["110", "010", "101", "001", "111"],
        weights: [78, 6, 6, 5, 5],
        qubits: 3,
        code: `from qiskit import QuantumCircuit\n\n# Grover: oracle marks |110>, then diffusion amplifies it\nqc = QuantumCircuit(3)\nqc.h(range(3))\n# ... oracle + diffusion iterations\nqc.measure_all()\nresult = simulator.run(qc, shots=1024).result()`,
        report: `## In short\nThe quantum search found the marked item with a provable quadratic speedup.\n\n## What we did\nWe encoded the search as a Grover oracle and ran the amplification circuit.\n\n## What we found\n- The target bitstring dominated the histogram (~78% of shots).\n- Classical brute force would have needed exponentially more lookups at scale.\n\n## Recommended next step\nThis advantage is real today and grows with the search space — a strong candidate for production use.`,
      };
    case "finance":
      return {
        headline: "We stress-tested the portfolio across thousands of sampled scenarios.",
        body: "Quantum-enhanced Monte Carlo sampled the tail-risk scenarios your classical model underweights. The loss distribution matches the classical baseline at today's portfolio size.",
        stats: [["VaR (95%)", "-8.2%"], ["Scenarios", "4,096"], ["Quantum advantage", "Not yet"]],
        verdict:
          "At this portfolio size the classical sampler matched the quantum result at lower cost. Quantum sampling is expected to pull ahead above ~10⁶ scenario paths — re-run when your scenario space grows.",
        verdictClass: "vb-neutral",
        verdictLabel: "No quantum advantage yet",
        states: ["0110", "1010", "0101", "1100", "0011"],
        weights: [34, 26, 18, 12, 10],
        qubits: 4,
        code: `from qiskit.circuit.library import QAOAAnsatz\n# Amplitude-estimation-style sampling over scenario space\nresult = backend.run(qc, shots=4096).result()`,
        report: `## In short\nThe portfolio survives the simulated crash with a 95% VaR of -8.2%.\n\n## What we did\nWe encoded your scenario space and sampled it with quantum-enhanced Monte Carlo, then benchmarked against a classical sampler.\n\n## What we found\n- Both methods agree on the loss distribution.\n- No quantum advantage at this scenario count — and we'd rather tell you that.\n\n## Recommended next step\nKeep the classical sampler in production; re-run the quantum benchmark when your scenario space passes ~10⁶ paths.`,
      };
    case "general":
      return {
        headline: "This didn't need a quantum computer — so we didn't use one.",
        body: "We solved it classically in under a minute. Running it on quantum hardware would have cost more and taken longer for the same answer.",
        stats: [["Method", "Classical"], ["Cost", "< $1"], ["Quantum advantage", "N/A"]],
        verdict:
          "Honesty over theatre: a classical approach was strictly better here. We'll flag the moment a quantum approach would genuinely change the outcome.",
        verdictClass: "vb-neutral",
        verdictLabel: "Classical was better",
        states: ["0", "1"],
        weights: [50, 50],
        qubits: 1,
        code: `# Solved classically — no circuit needed.`,
        report: `## In short\nWe solved this classically — quantum hardware would have added cost without adding value.\n\n## Why\nThe problem has no structure a quantum algorithm can exploit.\n\n## Recommended next step\nNothing quantum needed here. Bring us the problems with combinatorial explosion, molecular structure, or unstructured search.`,
      };
    default:
      // logistics / combinatorial optimisation
      return {
        headline: "We found a plan that cuts total cost by about 18%.",
        body: `Across 1,024 runs on the quantum computer, one clear plan came out on top for "${title}". It satisfies all constraints and avoids the bottlenecks in the current baseline.`,
        stats: [["Improvement", "~18%"], ["Confidence", "High"], ["Quantum advantage", "Not yet"]],
        verdict:
          "At today's problem size a good classical planner matches this, so there's no quantum advantage yet — but the same approach scales to problems classical tools struggle with. We'd recommend revisiting as the problem grows.",
        verdictClass: "vb-neutral",
        verdictLabel: "No quantum advantage yet",
        states: ["0110", "1010", "0101", "1100", "0011", "1001"],
        weights: [40, 26, 15, 9, 6, 4],
        qubits: 4,
        code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit.circuit.library import QAOAAnsatz\nfrom qiskit.quantum_info import SparsePauliOp\n\ncost = SparsePauliOp.from_list([\n    ("ZZII", 1.2), ("IZZI", 0.8),\n    ("IIZZ", 1.0), ("ZIIZ", 0.6),\n])\nansatz = QAOAAnsatz(cost_operator=cost, reps=2)\nansatz.measure_all()\nresult = AerSimulator().run(transpile(ansatz, backend), shots=1024).result()`,
        report: `## In short\nWe found a plan that improves on your baseline by about 18%. Across 1,024 runs on the quantum computer, one clear plan came out on top.\n\n## What we did\nWe searched proven quantum approaches, drafted and simulated candidate solutions, streamlined the best one, and — with your approval — ran it on a real quantum computer.\n\n## What we found\n- The winning bitstring appeared in ~40% of shots — a strong, stable signal.\n- A good classical planner matches this at today's size, so there's no quantum advantage *yet*.\n\n## Recommended next step\nKeep this plan as your working baseline. When the problem grows past ~120 variables — where classical planners slow down sharply — re-run this; that's where a quantum advantage is most likely to appear.`,
      };
  }
}

export function generateResult(title: string, domain = ""): ResultData {
  const fit = detectFit(title, domain);
  const t = templateFor(fit, title);
  const shots = 1024;
  return {
    headline: t.headline,
    body: t.body,
    stats: t.stats,
    verdict: t.verdict,
    verdictClass: t.verdictClass,
    verdictLabel: t.verdictLabel,
    circuit: circuit(t.qubits),
    histogram: histogram(t.states, t.weights, shots),
    shots,
    code: t.code,
    advantage: {
      metrics: [
        { label: "Solution quality", quantum: 0.94, classical: t.verdictClass === "vb-advantage" ? 0.78 : 0.94, quantumLabel: "94% optimal", classicalLabel: t.verdictClass === "vb-advantage" ? "78% optimal" : "94% optimal" },
        { label: "Time to solution", quantum: 0.62, classical: t.verdictClass === "vb-advantage" ? 0.3 : 0.78, quantumLabel: "6.2 s", classicalLabel: t.verdictClass === "vb-advantage" ? "84 s" : "3.1 s" },
        { label: "Cost per run", quantum: 0.35, classical: 0.95, quantumLabel: "$7.50", classicalLabel: "$0.20" },
      ],
      scaling: SCALING,
      crossover: 120,
    },
    reportMarkdown: t.report,
  };
}
