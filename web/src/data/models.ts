export type JobStatus = "queued" | "running" | "needs" | "done" | "failed";

export interface WorkspaceFile {
  n: string; // filename
  m: string; // meta line
  t: "csv" | "pdf" | "xls" | "doc";
}

export interface Workspace {
  id: string;
  name: string;
  tags: string[];
  files: WorkspaceFile[];
}

export interface Job {
  id: number;
  title: string;
  ws: string; // workspace id
  step: number; // 0..9
  status: JobStatus;
  created: string;
  report?: string; // markdown, when produced
}

export type GateKind = "hardware" | "improve";

export interface RunStep {
  t: string; // title
  owner: string;
  human?: boolean;
  hint: string;
  notes: string[];
  gate?: GateKind;
}

export interface Algorithm {
  name: string;
  cat: string;
  desc: string;
  fits: string[];
}

export type ProviderStatus = "connected" | "available" | "soon";

export interface Provider {
  id: string;
  name: string;
  status: ProviderStatus;
  backends: string;
  queue: string;
}

export interface Experiment {
  run: string;
  method: string;
  status: "done" | "running" | "failed" | "queued";
  cost: string;
  quality: string;
  verdict: string;
}

export type VerdictClass = "vb-hybrid" | "vb-advantage" | "vb-neutral";

/** Inspector circuit model — gates placed on qubit wires, column by column. */
export interface CircuitGate {
  q: number; // target qubit (wire index)
  col: number; // time column
  label: string; // H, X, Rz, ...
  control?: number; // control qubit for two-qubit gates
  measure?: boolean;
}

export interface CircuitModel {
  qubits: number;
  cols: number;
  gates: CircuitGate[];
}

/** A measured-bitstring histogram bar. */
export interface HistogramBar {
  state: string; // bitstring e.g. "110"
  count: number; // shots landing here
}

/** Quantum-vs-classical comparison row for the AdvantagePanel. */
export interface AdvantageMetric {
  label: string;
  quantum: number; // normalized 0..1 (higher = better)
  classical: number;
  quantumLabel: string;
  classicalLabel: string;
}

export interface ScalingPoint {
  size: number; // problem size
  classical: number; // runtime (arbitrary units)
  quantum: number;
}

// ── New workflow models ──────────────────────────────────────────────────────

export type SimulatorType = "statevector" | "shot-based" | "density-matrix";
export type NoiseModelType = "none" | "depolarizing" | "t1t2" | "custom";

export interface SimulationResult {
  convergenceData: { iteration: number; energy: number }[];
  approximationRatio: number;
  classicalBaseline: number;
  noisyData?: { iteration: number; energy: number }[];
}

export interface SimulationConfig {
  id: string;
  jobId: number;
  simulatorType: SimulatorType;
  shots: number;
  noiseEnabled: boolean;
  noiseModel: NoiseModelType;
  depolarizingRate: number;
  t1Us: number;
  t2Us: number;
  gateErrorRate: number;
  readoutErrorRate: number;
  sweepEnabled: boolean;
  sweepParam: "gamma" | "beta" | "reps";
  sweepSteps: number;
  created: string;
  results?: SimulationResult;
}

export type RoutingAlgorithm = "SABRE" | "Basic" | "Stochastic";
export type ErrorMitigationMethod = "none" | "ZNE" | "PEC" | "measurement";
export type OptimizationLevel = 0 | 1 | 2 | 3;

export interface HardwareConfig {
  id: string;
  jobId: number;
  providerId: string;
  backend: string;
  shots: number;
  optimizationLevel: OptimizationLevel;
  routingAlgorithm: RoutingAlgorithm;
  errorMitigation: ErrorMitigationMethod;
  zneScaleFactors: number[];
  costThreshold: number;
  estimatedCost: number;
  estimatedQueueMin: number;
  hitlApproved?: boolean;
  approvedAt?: string;
  submittedAt?: string;
  status: "pending-approval" | "queued" | "running" | "done" | "failed";
}

export interface LiteraturePaper {
  id: string;
  arxivId: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  problemClass: string;
  algorithmFamily: string;
  isTheoretical: boolean;
  qubitRequirement?: number;
  gateDepth?: number;
  errorRateAssumed?: number;
  citationCount: number;
  bookmarked: boolean;
  tags: string[];
  workspaceId?: string;
}

export type ErrorCorrectionCode = "surface" | "color" | "honeycomb";

export interface ResourceEstimate {
  id: string;
  jobId: number;
  algorithmName: string;
  logicalQubits: number;
  logicalErrorRate: number;
  physicalErrorRate: number;
  codeType: ErrorCorrectionCode;
  codeDistance: number;
  problemSizeN: number;
  magicStateOverhead: number;
  tGateCount: number;
  tGateDepth: number;
  physicalQubits: number;
  surfaceCodeCycles: number;
  estimatedRuntimeHours: number;
  hardwareReadinessYear: number;
  created: string;
}

export type ComplexityClass = "NP-hard" | "BQP" | "PSPACE" | "polynomial" | "unknown";
export type QuantumPriority = "speed" | "accuracy" | "cost";

export interface ProblemBrief {
  id: string;
  jobId: number;
  workspaceId: string;
  problemStatement: string;
  domain: string;
  complexityClass: ComplexityClass;
  quantumAdvantageLiterature: "proven" | "conjectured" | "none" | "unknown";
  qubitEstimate: number;
  targetApproximationRatio: number;
  priority: QuantumPriority;
  problemSizeEstimate: string;
  generatedBrief: string;
  committeeExported: boolean;
  created: string;
}

export type AnsatzType = "RealAmplitudes" | "EfficientSU2" | "TwoLocal" | "custom";
export type EntanglementPattern = "linear" | "circular" | "full";
export type ClassicalOptimizer = "COBYLA" | "SPSA" | "L-BFGS-B" | "Adam" | "SLSQP";
export type AlgorithmFamily = "QAOA" | "VQE" | "HHL" | "Grover" | "Annealing" | "Shor" | "QMC";

export interface AlgorithmSpec {
  id: string;
  jobId: number;
  algorithmFamily: AlgorithmFamily;
  quboFormulation?: string;
  hamiltonianDescription?: string;
  ansatzType: AnsatzType;
  reps: number;
  entanglement: EntanglementPattern;
  qaoaLayers: number;
  optimizer: ClassicalOptimizer;
  maxIterations: number;
  initialParameters?: number[];
  estimatedDepth?: number;
  pseudocode?: string;
  peerReviewChecklist: { item: string; checked: boolean }[];
  created: string;
}

export type TeamRole = "owner" | "researcher" | "engineer" | "viewer";
export type AccessLevel = "full" | "read-write" | "read-only";

export interface TeamMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: TeamRole;
  access: AccessLevel;
  avatarInitials: string;
  notifyOnCompletion: boolean;
  notifyOnHITL: boolean;
  joinedAt: string;
}

export interface JobComment {
  id: string;
  jobId: number;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export type FeedItemType = "arxiv" | "hardware-announcement" | "alert";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  source: string;
  summary: string;
  url: string;
  publishedAt: string;
  tags: string[];
  bookmarked: boolean;
  workspaceId?: string;
  isNew: boolean;
}

export interface KeywordAlert {
  id: string;
  keyword: string;
  active: boolean;
  matchCount: number;
  lastTriggered?: string;
}

// ── Original ResultData ──────────────────────────────────────────────────────

export interface ResultData {
  headline: string;
  body: string;
  stats: [string, string][];
  verdict: string;
  verdictClass: VerdictClass;
  verdictLabel: string;
  // feature data
  circuit: CircuitModel;
  histogram: HistogramBar[];
  shots: number;
  code: string;
  advantage: {
    metrics: AdvantageMetric[];
    scaling: ScalingPoint[];
    crossover: number; // problem size where quantum overtakes
  };
  reportMarkdown: string;
}
