/** Plain-language definitions surfaced as tooltips for low-technical users. */
export const GLOSSARY: Record<string, string> = {
  qubit:
    "A quantum bit — the basic unit of a quantum computer. Unlike a normal bit (0 or 1), a qubit can be in a blend of both at once, which is what gives quantum machines their power.",
  shots:
    "How many times we run the same experiment. Quantum results are probabilistic, so we repeat the circuit many times and look at which answers come up most often.",
  oracle:
    "A black-box step inside an algorithm that recognises the 'right' answer. Grover's search uses one to mark the item it's looking for.",
  fidelity:
    "A measure of how close the real hardware result is to the ideal, error-free result. Higher fidelity means fewer errors crept in.",
  circuit:
    "A sequence of quantum operations (gates) applied to qubits — the quantum equivalent of a program.",
  QAOA:
    "Quantum Approximate Optimization Algorithm. A hybrid method that's well-suited to combinatorial problems like routing and scheduling.",
  VQE:
    "Variational Quantum Eigensolver. Estimates the lowest-energy state of a molecule — the workhorse for chemistry and materials problems.",
  Grover:
    "Grover's search. Finds a marked item in an unsorted list quadratically faster than any classical search.",
  annealing:
    "Quantum annealing. Gradually settles a system into its lowest-energy configuration — a natural fit for optimization on D-Wave hardware.",
  Hamiltonian:
    "The mathematical description of a system's energy. Many quantum algorithms work by encoding your problem as a Hamiltonian to minimise.",
  transpile:
    "Rewriting a circuit so it fits a specific machine's available gates and qubit layout — like compiling code for a particular chip.",
  bitstring:
    "A string of 0s and 1s read off the qubits at the end of a run, e.g. '0110'. Each one is a possible answer to your problem.",
  "quantum advantage":
    "The point where a quantum computer genuinely solves a problem faster, cheaper, or better than the best classical method.",
  simulator:
    "A classical computer pretending to be a quantum one. Great for testing small circuits safely before spending time on real hardware.",
  depth:
    "How many sequential layers of operations a circuit has. Shorter (shallower) circuits run with fewer errors on today's hardware.",
};

export const GLOSSARY_TERMS = Object.keys(GLOSSARY);
