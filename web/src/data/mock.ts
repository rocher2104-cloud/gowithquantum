import type {
  Algorithm,
  AlgorithmSpec,
  Experiment,
  FeedItem,
  HardwareConfig,
  Job,
  JobComment,
  KeywordAlert,
  LiteraturePaper,
  ProblemBrief,
  Provider,
  ResourceEstimate,
  ResultData,
  RunStep,
  SimulationConfig,
  TeamMember,
  Workspace,
} from "./models";

import STEPS_SHARED from "../../../shared/steps.json";
import { minutesAgoIso } from "../lib/time";

export interface Example {
  cat: string;
  t: string;
  dom: string;
}

/** Outcome-framed examples — what the user gets, not which algorithm runs. */
export const EXAMPLES: Example[] = [
  { cat: "Logistics", t: "Cut fuel costs by finding better routes for our 5 trucks across 40 stops", dom: "logistics" },
  { cat: "Pharmaceuticals", t: "Shortlist drug candidates that could bind to the KRAS protein", dom: "chemistry" },
  { cat: "Finance", t: "Find out how our portfolio holds up in a sudden market crash", dom: "finance" },
  { cat: "Cybersecurity", t: "Test whether our encryption keys could be found by a quantum search", dom: "all" },
  { cat: "Materials", t: "Find a cheaper, more stable battery cathode material", dom: "materials" },
  { cat: "Energy", t: "Squeeze more output from a fusion reactor's magnetic field layout", dom: "optimization" },
];

/** Canonical 9-step plan — single source of truth in /shared/steps.json,
 * shared with the Python agent. */
export const STEPS: RunStep[] = STEPS_SHARED.steps as RunStep[];

export const WORKSPACES: Workspace[] = [
  { id: "log", name: "Logistics R&D", tags: ["operations", "routing"],
    files: [
      { n: "fleet_stops_q3.csv", m: "Dataset · 412 KB · added 2 days ago", t: "csv" },
      { n: "delivery_constraints.pdf", m: "Document · 88 KB · added 2 days ago", t: "pdf" },
      { n: "current_routes_baseline.xlsx", m: "Spreadsheet · 240 KB · added yesterday", t: "xls" },
    ] },
  { id: "pharma", name: "Drug Discovery", tags: ["chemistry", "R&D"],
    files: [
      { n: "kras_target.pdb", m: "Structure · 1.2 MB · added 5 days ago", t: "doc" },
      { n: "candidate_library.csv", m: "Dataset · 3.1 MB · added 5 days ago", t: "csv" },
    ] },
  { id: "fin", name: "Risk & Markets", tags: ["finance"],
    files: [{ n: "portfolio_positions.xlsx", m: "Spreadsheet · 510 KB · added 1 week ago", t: "xls" }] },
];

export const INITIAL_JOBS: Job[] = [
  { id: "j-1", title: "Optimise 5-truck delivery routes across 40 stops", ws: "log", step: 5, status: "needs", createdAt: minutesAgoIso(2), domain: "logistics" },
  { id: "j-2", title: "Screen molecules for the KRAS protein target", ws: "pharma", step: 4, status: "running", createdAt: minutesAgoIso(12), domain: "chemistry" },
  { id: "j-3", title: "Stress-test the portfolio against a market crash", ws: "fin", step: 0, status: "queued", createdAt: minutesAgoIso(18), domain: "finance" },
  { id: "j-4", title: "Search for a weak encryption key (demo)", ws: "log", step: 9, status: "done", createdAt: minutesAgoIso(60) },
];

export const EXPERIMENTS: Experiment[] = [
  { run: "#001", method: "Classical MILP (OR-Tools)", status: "done", cost: "$0.20", quality: "94%", verdict: "Baseline" },
  { run: "#002", method: "Quantum-inspired annealing", status: "done", cost: "$1.80", quality: "91%", verdict: "—" },
  { run: "#003", method: "D-Wave hybrid solver", status: "running", cost: "~$7.50", quality: "—", verdict: "—" },
  { run: "#004", method: "QAOA (simulator)", status: "failed", cost: "—", quality: "—", verdict: "Too many variables" },
];

export const ALGORITHMS: Algorithm[] = [
  { name: "QAOA", cat: "Optimization", desc: "Quantum Approximate Optimization Algorithm for combinatorial problems.", fits: ["Routing", "Scheduling", "Portfolio"] },
  { name: "VQE", cat: "Chemistry", desc: "Variational Quantum Eigensolver for molecular ground-state energy estimation.", fits: ["Drug discovery", "Materials"] },
  { name: "Quantum Annealing", cat: "Optimization", desc: "Adiabatic approach using D-Wave systems — strong for discrete optimization.", fits: ["Logistics", "Manufacturing", "Finance"] },
  { name: "Grover's Search", cat: "Search", desc: "Quadratic speedup over classical unstructured search.", fits: ["Database search", "Cryptography analysis"] },
  { name: "Quantum Monte Carlo", cat: "Finance", desc: "Quantum-enhanced Monte Carlo sampling for financial simulation.", fits: ["Risk assessment", "Option pricing"] },
  { name: "Shor's Algorithm", cat: "Cryptography", desc: "Polynomial-time integer factoring — educational and post-quantum risk assessment.", fits: ["Cryptography research"] },
  { name: "Quantum Kernel SVM", cat: "Machine Learning", desc: "Quantum feature maps for classification tasks with potential kernel advantage.", fits: ["Classification", "Anomaly detection"] },
  { name: "HHL Algorithm", cat: "Linear Algebra", desc: "Exponential speedup for sparse linear systems — requires error-corrected hardware.", fits: ["Simulation", "Optimization"] },
];

/** 2026-credible hardware lineup (refreshed from the 2023-era Eagle/Falcon mock). */
export const PROVIDERS: Provider[] = [
  { id: "ibm", name: "IBM Quantum", status: "connected", backends: "Heron r2 (156q), Condor (1,121q), Aer simulator", queue: "4 min avg" },
  { id: "dwave", name: "D-Wave Leap", status: "connected", backends: "Advantage2 (4,400+ qubits), Hybrid solver", queue: "< 1 min" },
  { id: "quantinuum", name: "Quantinuum", status: "available", backends: "H2-1 (56 trapped-ion qubits), Helios", queue: "Available now" },
  { id: "braket", name: "AWS Braket", status: "available", backends: "IonQ Forte (36q), IQM Garnet (20q), SV1 simulator", queue: "Available now" },
  { id: "azure", name: "Azure Quantum", status: "soon", backends: "Quantinuum H2, Atom Computing", queue: "—" },
  { id: "ionq", name: "IonQ Cloud", status: "soon", backends: "Forte (36q), Tempo", queue: "—" },
];

/* ── Feature data for the Inspector + AdvantagePanel ── */

const ROUTE_CIRCUIT = {
  qubits: 4,
  cols: 6,
  gates: [
    { q: 0, col: 0, label: "H" },
    { q: 1, col: 0, label: "H" },
    { q: 2, col: 0, label: "H" },
    { q: 3, col: 0, label: "H" },
    { q: 1, col: 1, label: "X", control: 0 },
    { q: 3, col: 1, label: "X", control: 2 },
    { q: 0, col: 2, label: "Rz" },
    { q: 1, col: 2, label: "Rz" },
    { q: 2, col: 3, label: "Rz" },
    { q: 3, col: 3, label: "Rz" },
    { q: 2, col: 4, label: "X", control: 1 },
    { q: 0, col: 4, label: "Ry" },
    { q: 0, col: 5, label: "M", measure: true },
    { q: 1, col: 5, label: "M", measure: true },
    { q: 2, col: 5, label: "M", measure: true },
    { q: 3, col: 5, label: "M", measure: true },
  ],
};

const ROUTE_HISTOGRAM = [
  { state: "0110", count: 412 },
  { state: "1010", count: 268 },
  { state: "0101", count: 151 },
  { state: "1100", count: 98 },
  { state: "0011", count: 61 },
  { state: "1001", count: 34 },
];

const ROUTE_CODE = `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.circuit.library import QAOAAnsatz
from qiskit.quantum_info import SparsePauliOp

# Cost Hamiltonian for the 4-node routing sub-problem
cost = SparsePauliOp.from_list([
    ("ZZII", 1.2), ("IZZI", 0.8),
    ("IIZZ", 1.0), ("ZIIZ", 0.6),
])

ansatz = QAOAAnsatz(cost_operator=cost, reps=2)
ansatz.measure_all()

backend = AerSimulator()
qc = transpile(ansatz.assign_parameters(best_params), backend)
result = backend.run(qc, shots=1024).result()
counts = result.get_counts()
# -> {'0110': 412, '1010': 268, ...}  best route = 0110`;

const ADVANTAGE = {
  metrics: [
    { label: "Solution quality", quantum: 0.94, classical: 0.94, quantumLabel: "94% optimal", classicalLabel: "94% optimal" },
    { label: "Time to solution", quantum: 0.62, classical: 0.78, quantumLabel: "6.2 s", classicalLabel: "3.1 s" },
    { label: "Cost per run", quantum: 0.35, classical: 0.95, quantumLabel: "$7.50", classicalLabel: "$0.20" },
  ],
  // runtime (s) as problem size grows — classical blows up, quantum stays flatter
  scaling: [
    { size: 20, classical: 0.2, quantum: 4.0 },
    { size: 40, classical: 1.1, quantum: 5.2 },
    { size: 80, classical: 8.0, quantum: 7.0 },
    { size: 160, classical: 62, quantum: 9.5 },
    { size: 320, classical: 480, quantum: 13 },
    { size: 640, classical: 3800, quantum: 18 },
  ],
  crossover: 120,
};

const REPORT_MD = `## In short
We found a route plan that cuts total distance by about 18%. Across 1,024 runs on the quantum computer, one clear plan came out on top.

## What we did
We searched proven quantum approaches, drafted and simulated candidate solutions, streamlined the best one, and — with your approval — ran it on a real quantum computer over 1,024 trials.

## What we found
- The winning bitstring \`0110\` appeared in ~40% of shots — a strong, stable signal.
- It keeps all 40 stops, balances load across your 5 trucks, and avoids two bottlenecks.
- A good classical planner matches this at today's size, so there's no quantum advantage *yet*.

## Recommended next step
Keep this plan as your working baseline. When your network grows past ~120 stops — where classical planners slow down sharply — re-run this; that's where a quantum advantage is most likely to appear.`;

// ── New workflow mock data ────────────────────────────────────────────────────

const CONV_DATA = Array.from({ length: 30 }, (_, i) => ({
  iteration: i + 1,
  energy: -1.2 - 0.8 * (1 - Math.exp(-i / 8)) + (Math.random() * 0.05 - 0.025),
}));
const CONV_NOISY = CONV_DATA.map((d) => ({ ...d, energy: d.energy + 0.12 + Math.random() * 0.08 }));

export const SIM_CONFIGS: SimulationConfig[] = [
  {
    id: "sim-001", jobId: "j-1",
    simulatorType: "statevector", shots: 4096,
    noiseEnabled: false, noiseModel: "none",
    depolarizingRate: 0.001, t1Us: 100, t2Us: 80,
    gateErrorRate: 0.001, readoutErrorRate: 0.01,
    sweepEnabled: true, sweepParam: "gamma", sweepSteps: 20,
    created: "1 hour ago",
    results: { convergenceData: CONV_DATA, approximationRatio: 0.89, classicalBaseline: 0.94 },
  },
  {
    id: "sim-002", jobId: "j-1",
    simulatorType: "shot-based", shots: 4096,
    noiseEnabled: true, noiseModel: "depolarizing",
    depolarizingRate: 0.002, t1Us: 100, t2Us: 80,
    gateErrorRate: 0.002, readoutErrorRate: 0.02,
    sweepEnabled: false, sweepParam: "gamma", sweepSteps: 10,
    created: "45 min ago",
    results: {
      convergenceData: CONV_NOISY, approximationRatio: 0.76, classicalBaseline: 0.94,
      noisyData: CONV_NOISY,
    },
  },
];

export const HW_CONFIGS: HardwareConfig[] = [
  {
    id: "hw-001", jobId: "j-1",
    providerId: "ibm", backend: "IBM Heron r2 (156q)",
    shots: 4096, optimizationLevel: 3,
    routingAlgorithm: "SABRE", errorMitigation: "ZNE",
    zneScaleFactors: [1, 2, 3],
    costThreshold: 10.00, estimatedCost: 7.50, estimatedQueueMin: 6,
    hitlApproved: true, approvedAt: "30 min ago", submittedAt: "30 min ago",
    status: "done",
  },
];

export const PAPERS: LiteraturePaper[] = [
  {
    id: "p-001", arxivId: "1411.4028",
    title: "A Quantum Approximate Optimization Algorithm",
    authors: ["Farhi, E.", "Goldstone, J.", "Gutmann, S."],
    year: 2014, abstract: "We introduce a quantum approximate optimization algorithm (QAOA) that generates approximate solutions for combinatorial optimization problems. The quantum circuit has L stages for reps parameter p. We study the algorithm as applied to MaxCut on 3-regular graphs.",
    problemClass: "combinatorial optimization", algorithmFamily: "QAOA",
    isTheoretical: true, qubitRequirement: 20, gateDepth: 60, errorRateAssumed: 0.001,
    citationCount: 4820, bookmarked: true, tags: ["QAOA", "optimization", "NISQ"], workspaceId: "log",
  },
  {
    id: "p-002", arxivId: "1509.04279",
    title: "A variational eigenvalue solver on a photonic chip",
    authors: ["Peruzzo, A.", "McClean, J.", "Shadbolt, P."],
    year: 2014, abstract: "Quantum computers promise to efficiently solve important problems in chemistry and materials science beyond the capability of modern classical computers. One approach to realising practical quantum advantage is the Variational Quantum Eigensolver (VQE).",
    problemClass: "quantum chemistry", algorithmFamily: "VQE",
    isTheoretical: false, qubitRequirement: 2, gateDepth: 12, errorRateAssumed: 0.01,
    citationCount: 3210, bookmarked: false, tags: ["VQE", "chemistry", "hardware"],
  },
  {
    id: "p-003", arxivId: "0811.3171",
    title: "Quantum algorithm for linear systems of equations",
    authors: ["Harrow, A.", "Hassidim, A.", "Lloyd, S."],
    year: 2009, abstract: "Solving linear systems of equations is a common problem that arises both on its own and as a subroutine in more complex problems. The HHL algorithm solves Ax=b exponentially faster than classical algorithms for sparse systems.",
    problemClass: "linear algebra", algorithmFamily: "HHL",
    isTheoretical: true, qubitRequirement: 40, gateDepth: 320, errorRateAssumed: 0.0001,
    citationCount: 5640, bookmarked: false, tags: ["HHL", "linear systems", "fault-tolerant"],
  },
  {
    id: "p-004", arxivId: "2110.14082",
    title: "Evidence for the utility of quantum computing before fault tolerance",
    authors: ["Kim, Y.", "Eddins, A.", "Anand, S."],
    year: 2023, abstract: "The ability of quantum computers to represent and manipulate large quantum states is the basis of their potential advantage over classical computers. Here we demonstrate the utility of quantum computing using IBM's 127-qubit Eagle processor.",
    problemClass: "quantum simulation", algorithmFamily: "QAOA",
    isTheoretical: false, qubitRequirement: 127, gateDepth: 60, errorRateAssumed: 0.005,
    citationCount: 1890, bookmarked: true, tags: ["IBM", "utility", "127q", "hardware"], workspaceId: "log",
  },
  {
    id: "p-005", arxivId: "2303.14440",
    title: "Quantum error correction: an introductory guide",
    authors: ["Devitt, S.", "Munro, W.", "Nemoto, K."],
    year: 2013, abstract: "Quantum error correction (QEC) is an essential element of physical quantum information processing systems. Surface codes are currently the most promising candidates for fault-tolerant quantum computation.",
    problemClass: "error correction", algorithmFamily: "Annealing",
    isTheoretical: true, qubitRequirement: 1000, gateDepth: 0, errorRateAssumed: 0.01,
    citationCount: 2340, bookmarked: false, tags: ["surface code", "error correction", "fault-tolerant"],
  },
];

export const RESOURCE_ESTIMATES: ResourceEstimate[] = [
  {
    id: "re-001", jobId: "j-1",
    algorithmName: "QAOA (p=3)",
    logicalQubits: 40, logicalErrorRate: 1e-10, physicalErrorRate: 1e-3,
    codeType: "surface", codeDistance: 17, problemSizeN: 40, magicStateOverhead: 10,
    tGateCount: 18200, tGateDepth: 2400, physicalQubits: 14480,
    surfaceCodeCycles: 2400000, estimatedRuntimeHours: 3.2,
    hardwareReadinessYear: 2031, created: "today",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-001", workspaceId: "log", name: "Rocher Botha", email: "rocher@gowithquantum.com", role: "owner", access: "full", avatarInitials: "RB", notifyOnCompletion: true, notifyOnHITL: true, joinedAt: "3 months ago" },
  { id: "tm-002", workspaceId: "log", name: "Amara Osei", email: "amara@gowithquantum.com", role: "researcher", access: "read-write", avatarInitials: "AO", notifyOnCompletion: true, notifyOnHITL: false, joinedAt: "2 months ago" },
  { id: "tm-003", workspaceId: "log", name: "Wei Zhang", email: "wei@gowithquantum.com", role: "engineer", access: "read-write", avatarInitials: "WZ", notifyOnCompletion: false, notifyOnHITL: true, joinedAt: "1 month ago" },
  { id: "tm-004", workspaceId: "pharma", name: "Dr. Sarah Chen", email: "sarah@gowithquantum.com", role: "researcher", access: "full", avatarInitials: "SC", notifyOnCompletion: true, notifyOnHITL: true, joinedAt: "3 months ago" },
];

export const COMMENTS: JobComment[] = [
  { id: "c-001", jobId: "j-1", authorId: "tm-002", authorName: "Amara Osei", body: "QAOA converged at p=3. Trying p=4 to see if we can squeeze another 2% approximation ratio.", createdAt: minutesAgoIso(45) },
  { id: "c-002", jobId: "j-1", authorId: "tm-001", authorName: "Rocher Botha", body: "Approved hardware run. IBM Heron r2 queue was only 6 minutes.", createdAt: minutesAgoIso(30) },
  { id: "c-003", jobId: "j-4", authorId: "tm-003", authorName: "Wei Zhang", body: "Grover's found the weak key in 89 iterations vs 2^16 classical brute-force. Clear speedup at this scale.", createdAt: minutesAgoIso(120) },
];

export const FEED_ITEMS: FeedItem[] = [
  { id: "f-001", type: "arxiv", title: "Demonstration of QAOA with error mitigation on 127-qubit Heron processor", source: "arXiv:2506.04813", summary: "IBM researchers demonstrate QAOA with ZNE error mitigation on the 127-qubit Heron r2 processor, achieving approximation ratios competitive with classical solvers for MaxCut on 40-node graphs.", url: "#", publishedAt: "today", tags: ["QAOA", "IBM", "ZNE", "error mitigation"], bookmarked: false, isNew: true },
  { id: "f-002", type: "hardware-announcement", title: "IBM Releases Heron r3 Processor with Sub-0.1% Two-Qubit Gate Error", source: "IBM Quantum Blog", summary: "The new Heron r3 architecture achieves 0.08% two-qubit gate error rates and 300μs T1 times, a 3× improvement over Heron r2.", url: "#", publishedAt: "2 days ago", tags: ["IBM", "hardware", "Heron"], bookmarked: true, isNew: false },
  { id: "f-003", type: "arxiv", title: "Barren plateaus in quantum neural network training landscapes", source: "arXiv:1803.11173", summary: "Demonstrates that the gradient of parameterized quantum circuits vanishes exponentially with qubit count — a key challenge for VQE and QAOA training at scale.", url: "#", publishedAt: "3 days ago", tags: ["VQE", "barren plateau", "training"], bookmarked: false, isNew: false },
  { id: "f-004", type: "hardware-announcement", title: "D-Wave Announces Advantage3 with 7,000+ Qubits", source: "D-Wave Systems", summary: "Advantage3 extends the Pegasus topology to 7,440 qubits with improved connectivity, targeting large-scale logistics and financial optimization.", url: "#", publishedAt: "1 week ago", tags: ["D-Wave", "annealing", "hardware"], bookmarked: false, isNew: false },
  { id: "f-005", type: "arxiv", title: "Quantum advantage in simulating open quantum systems", source: "arXiv:2501.09991", summary: "Proof-of-concept demonstration showing quantum computers outperform classical simulation for Lindbladian dynamics on 50+ qubits.", url: "#", publishedAt: "4 days ago", tags: ["simulation", "advantage", "chemistry"], bookmarked: false, isNew: true },
  { id: "f-006", type: "alert", title: "Keyword match: 'QAOA optimization' — 3 new papers today", source: "Keyword Alert", summary: "Three new arXiv preprints match your saved keyword 'QAOA optimization': warm-starting techniques, layer-wise training, and hardware-efficient variants.", url: "#", publishedAt: "today", tags: ["QAOA", "alert"], bookmarked: false, isNew: true },
  { id: "f-007", type: "arxiv", title: "Resource estimation for quantum advantage in portfolio optimization", source: "arXiv:2403.12345", summary: "Detailed fault-tolerant resource estimates for quantum portfolio optimization: requires ~14,000 physical qubits and 3.2 hours runtime at problem size N=40 with surface codes.", url: "#", publishedAt: "5 days ago", tags: ["portfolio", "resource estimation", "surface code"], bookmarked: true, isNew: false },
];

export const KEYWORD_ALERTS: KeywordAlert[] = [
  { id: "ka-001", keyword: "QAOA optimization", active: true, matchCount: 12, lastTriggered: "today" },
  { id: "ka-002", keyword: "surface code overhead", active: true, matchCount: 3, lastTriggered: "2 days ago" },
  { id: "ka-003", keyword: "VQE molecular simulation", active: false, matchCount: 0 },
  { id: "ka-004", keyword: "quantum advantage finance", active: true, matchCount: 7, lastTriggered: "yesterday" },
];

export const PROBLEM_BRIEFS: ProblemBrief[] = [
  {
    id: "pb-001", jobId: "j-1", workspaceId: "log",
    problemStatement: "Optimise 5-truck delivery routes across 40 stops",
    domain: "Logistics", complexityClass: "NP-hard",
    quantumAdvantageLiterature: "conjectured",
    qubitEstimate: 40, targetApproximationRatio: 0.95,
    priority: "speed", problemSizeEstimate: "40 stops, 5 vehicles",
    generatedBrief: "## Problem Brief\n\n**Domain:** Logistics / Vehicle Routing\n\n**Complexity:** NP-hard (Capacitated VRP is NP-hard under polynomial-time reductions)\n\n**Quantum Advantage Status:** Conjectured — QAOA literature shows promise at N>120 stops but no demonstrated advantage at N=40 yet.\n\n**Qubit Estimate:** ~40 logical qubits for the 4-node sub-problem formulation.\n\n**Recommended approach:** QAOA (p=3) with SABRE transpilation on IBM Heron r2.\n\n**Next steps:** Literature review for routing QUBO formulations → Algorithm Design → Classical Simulation.",
    committeeExported: false, created: "today",
  },
];

export const ALGORITHM_SPECS: AlgorithmSpec[] = [
  {
    id: "as-001", jobId: "j-1",
    algorithmFamily: "QAOA",
    quboFormulation: "Minimize: Σ_{(i,j)∈E} w_ij * (1 - z_i*z_j) / 2\nSubject to: vehicle capacity and time-window constraints encoded as penalty terms.",
    hamiltonianDescription: "H_C = Σ_{(i,j)∈E} w_ij * (I - Z_i⊗Z_j) / 2\nH_B = Σ_i X_i",
    ansatzType: "EfficientSU2", reps: 3,
    entanglement: "circular", qaoaLayers: 3,
    optimizer: "COBYLA", maxIterations: 500,
    estimatedDepth: 22,
    pseudocode: "# QAOA for Vehicle Routing\nansatz = QAOAAnsatz(cost_op=H_C, reps=3)\noptimizer = COBYLA(maxiter=500)\nresult = minimize(expectation(ansatz, H_C), x0=initial_params, method=optimizer)\nbest_route = decode_bitstring(argmax(result.counts))",
    peerReviewChecklist: [
      { item: "QUBO formulation verified", checked: true },
      { item: "Hamiltonian mapping confirmed", checked: true },
      { item: "Circuit depth < coherence time", checked: true },
      { item: "Optimizer convergence tested", checked: false },
      { item: "Barren plateau risk assessed", checked: false },
    ],
    created: "today",
  },
];

// ── Original ResultData ───────────────────────────────────────────────────────

export const DEFAULT_RESULT: ResultData = {
  headline: "We found a route plan that cuts total distance by about 18%.",
  body: "Across 1,024 runs on the quantum computer, one clear plan came out on top. It keeps all 40 stops, balances the load across your 5 trucks, and avoids the two bottlenecks in your current schedule.",
  stats: [["Distance saved", "~18%"], ["Confidence", "High"], ["Quantum advantage", "Not yet"]],
  verdict: "At today's problem size a good classical planner matches this, so there's no quantum advantage *yet* — but the same approach scales to problems classical tools struggle with. We'd recommend revisiting as your network grows.",
  verdictClass: "vb-neutral",
  verdictLabel: "No quantum advantage yet",
  circuit: ROUTE_CIRCUIT,
  histogram: ROUTE_HISTOGRAM,
  shots: 1024,
  code: ROUTE_CODE,
  advantage: ADVANTAGE,
  reportMarkdown: REPORT_MD,
};
