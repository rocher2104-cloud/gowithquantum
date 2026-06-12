/**
 * Quantum-fit triage: given a plain-language problem, decide honestly whether
 * quantum helps today, at scale, or not at all.
 *
 * This heuristic is the seam where a Claude call goes once the API layer
 * exists — keep the FitResult shape stable; it is the contract.
 */

export type FitVerdict = "advantage-today" | "advantage-at-scale" | "classical-better";

export interface FitResult {
  verdict: FitVerdict;
  verdictLabel: string;
  algorithm: string;
  algorithmKey: string;
  domain: string;
  message: string;
  provider: string;
  advantageLiterature: "proven" | "conjectured" | "none" | "unknown";
  estimatedCost: string;
  estimatedTime: string;
  crossoverNote?: string;
}

export const VERDICT_LABELS: Record<FitVerdict, string> = {
  "advantage-today": "Quantum advantage likely today",
  "advantage-at-scale": "Quantum advantage at scale",
  "classical-better": "Classical is better here",
};

export function detectFit(prompt: string, domain: string): FitResult {
  const p = prompt.toLowerCase();

  if (domain === "chemistry" || /molecule|binding|protein|drug|vqe|energy state|hamiltonian|ground.?state/.test(p)) {
    return {
      verdict: "advantage-today",
      verdictLabel: VERDICT_LABELS["advantage-today"],
      algorithm: "VQE",
      algorithmKey: "VQE",
      domain: "chemistry",
      message:
        "This looks like a molecular energy problem. VQE on trapped-ion hardware has demonstrated results competitive with classical methods at this scale.",
      provider: "Quantinuum H2-1 or IBM Heron",
      advantageLiterature: "proven",
      estimatedCost: "$8–15",
      estimatedTime: "~10 min",
    };
  }
  if (domain === "finance" || /portfolio|market|risk|option|monte carlo|pricing|crash/.test(p)) {
    return {
      verdict: "advantage-at-scale",
      verdictLabel: VERDICT_LABELS["advantage-at-scale"],
      algorithm: "Quantum Monte Carlo",
      algorithmKey: "QAOA",
      domain: "finance",
      message:
        "Financial simulation can benefit from quantum-enhanced Monte Carlo sampling, but at today's portfolio sizes a classical sampler usually matches it. We'll benchmark both.",
      provider: "IBM Heron r2 or AWS Braket",
      advantageLiterature: "conjectured",
      estimatedCost: "$5–10",
      estimatedTime: "~8 min",
      crossoverNote: "Quantum sampling is expected to pull ahead above ~10⁶ scenario paths.",
    };
  }
  if (/search|find the (marked|hidden)|encryption|key|grover|database|password/.test(p)) {
    return {
      verdict: "advantage-today",
      verdictLabel: VERDICT_LABELS["advantage-today"],
      algorithm: "Grover's Search",
      algorithmKey: "Grover",
      domain: "search",
      message:
        "This is an unstructured search problem. Grover's algorithm gives a provable quadratic speedup over classical search.",
      provider: "IonQ Forte or Quantinuum H2-1",
      advantageLiterature: "proven",
      estimatedCost: "$3–8",
      estimatedTime: "~5 min",
    };
  }
  if (domain === "materials" || /material|crystal|lattice|structure|cathode|battery|alloy/.test(p)) {
    return {
      verdict: "advantage-at-scale",
      verdictLabel: VERDICT_LABELS["advantage-at-scale"],
      algorithm: "VQE",
      algorithmKey: "VQE",
      domain: "materials",
      message:
        "Materials structure problems map naturally onto VQE — the algorithm finds the lowest-energy configuration. Today's hardware handles small unit cells; larger ones still need error correction.",
      provider: "Quantinuum H2-1",
      advantageLiterature: "conjectured",
      estimatedCost: "$8–15",
      estimatedTime: "~12 min",
      crossoverNote: "Practical advantage expected for unit cells beyond ~50 orbitals.",
    };
  }
  if (/report|summari|write|draft|email|translate|schedule a meeting/.test(p) && !/route|optimi|molecul/.test(p)) {
    return {
      verdict: "classical-better",
      verdictLabel: VERDICT_LABELS["classical-better"],
      algorithm: "Classical (no quantum)",
      algorithmKey: "quantum advantage",
      domain: "general",
      message:
        "Honestly: this isn't a quantum problem. A classical approach will be faster and cheaper, and we'd rather tell you that than run a circuit for show.",
      provider: "Classical compute only",
      advantageLiterature: "none",
      estimatedCost: "< $1",
      estimatedTime: "~1 min",
    };
  }
  // default: combinatorial / logistics / optimization
  return {
    verdict: "advantage-at-scale",
    verdictLabel: VERDICT_LABELS["advantage-at-scale"],
    algorithm: "QAOA",
    algorithmKey: "QAOA",
    domain: "logistics",
    message:
      "This looks like a combinatorial optimisation problem. At today's size a good classical solver will likely match the quantum result — we'll run both and show you the honest comparison.",
    provider: "D-Wave Advantage2 hybrid or IBM Heron",
    advantageLiterature: "conjectured",
    estimatedCost: "$5–12",
    estimatedTime: "~6 min",
    crossoverNote: "QAOA is expected to pull ahead beyond ~120 decision variables.",
  };
}
