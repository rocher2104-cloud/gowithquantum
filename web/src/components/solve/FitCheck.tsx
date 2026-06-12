import { makeStyles, tokens } from "@fluentui/react-components";
import { accents } from "../../theme/brand";
import { GlossaryTerm } from "../shared/GlossaryTerm";

interface FitInfo {
  algorithm: string;
  algorithmKey: keyof typeof import("../../data/glossary").GLOSSARY | string;
  message: string;
  provider: string;
}

function detectFit(prompt: string, domain: string): FitInfo {
  const p = prompt.toLowerCase();

  if (domain === "chemistry" || /molecule|binding|protein|drug|vqe|energy|hamiltonian/.test(p)) {
    return {
      algorithm: "VQE",
      algorithmKey: "VQE",
      message: "This looks like a molecular energy problem. VQE on trapped-ion hardware is well-suited here.",
      provider: "Quantinuum H2-1 or IBM Heron",
    };
  }
  if (domain === "finance" || /portfolio|market|risk|option|monte carlo|pricing/.test(p)) {
    return {
      algorithm: "Quantum Monte Carlo",
      algorithmKey: "QAOA",
      message: "Financial simulation problems can benefit from quantum-enhanced Monte Carlo sampling.",
      provider: "IBM Heron r2 or AWS Braket",
    };
  }
  if (/search|find|encryption|key|grover|database/.test(p)) {
    return {
      algorithm: "Grover's Search",
      algorithmKey: "Grover",
      message: "This is an unstructured search problem. Grover's algorithm gives a quadratic speedup over classical search.",
      provider: "IonQ Forte or Quantinuum H2-1",
    };
  }
  if (domain === "materials" || /material|crystal|lattice|structure|cathode|battery/.test(p)) {
    return {
      algorithm: "VQE",
      algorithmKey: "VQE",
      message: "Materials structure problems map naturally onto VQE — the algorithm finds the lowest-energy configuration.",
      provider: "Quantinuum H2-1",
    };
  }
  // default: combinatorial / logistics / optimization
  return {
    algorithm: "QAOA",
    algorithmKey: "QAOA",
    message: "This looks like a combinatorial optimisation problem. Hybrid quantum-classical solvers (QAOA / D-Wave) are likely useful here.",
    provider: "D-Wave Advantage2 hybrid or IBM Heron",
  };
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginTop: "10px",
    padding: "12px 16px",
    border: `1px solid ${accents.infoBorder}`,
    borderLeft: `3px solid ${accents.info}`,
    borderRadius: tokens.borderRadiusLarge,
    background: accents.infoBg,
    animation: "fadeIn 0.3s ease",
  },
  text: { fontSize: "13px", color: tokens.colorNeutralForeground2, lineHeight: 1.5, flex: 1 },
  provider: { color: tokens.colorNeutralForeground3 },
});

export function FitCheck({ prompt, domain }: { prompt: string; domain: string }) {
  const s = useStyles();
  const fit = detectFit(prompt, domain);

  return (
    <div className={s.root}>
      <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>⚡</span>
      <div className={s.text}>
        <strong>Quantum Fit Check:</strong> {fit.message}{" "}
        Recommended algorithm: <GlossaryTerm term={fit.algorithmKey}>{fit.algorithm}</GlossaryTerm>.{" "}
        <span className={s.provider}>Suggested backend: {fit.provider}.</span>
      </div>
    </div>
  );
}
