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
  ansatz:
    "The shape of the trial circuit a variational algorithm tunes — like choosing the form of an equation before fitting its parameters.",
  QUBO:
    "Quadratic Unconstrained Binary Optimization — a standard way of writing an optimization problem as yes/no variables so a quantum computer can work on it.",
  ZNE:
    "Zero-Noise Extrapolation. We deliberately run the circuit at a few different noise levels and extrapolate back to what a noiseless machine would have said.",
  SABRE:
    "A routing method that rearranges which physical qubits hold which parts of your circuit, minimising the costly swaps real hardware needs.",
  "code distance":
    "How much redundancy an error-correcting code uses. Bigger distance = more physical qubits per logical qubit, but far fewer uncorrected errors.",
  "surface code":
    "Today's leading quantum error-correction scheme — it tiles qubits in a grid and constantly checks them for errors.",
  "logical qubit":
    "A 'perfect' qubit built out of many noisy physical qubits via error correction. Estimates like '40 logical qubits' hide thousands of physical ones.",
  "physical qubit":
    "An actual hardware qubit, noise and all. Many physical qubits combine into one reliable logical qubit.",
  depolarizing:
    "A simple noise model where each operation has a small chance of scrambling the qubit — useful for stress-testing circuits in simulation.",
  T1:
    "How long a qubit holds its energy before it decays. One of the two basic 'lifetime' numbers for hardware quality.",
  T2:
    "How long a qubit holds its delicate phase information. Usually shorter than T1, and often the limiting factor.",
  "readout error":
    "The chance the machine misreads a qubit at measurement time — reporting a 0 that was really a 1, or vice versa.",
  "error mitigation":
    "Software tricks (like ZNE) that reduce the impact of hardware noise on results without full error correction.",
  COBYLA:
    "A classical optimizer often used to tune variational quantum circuits — it adjusts circuit parameters between runs.",
  SPSA:
    "A classical optimizer that handles noisy measurements well, making it popular for tuning circuits on real hardware.",
  entanglement:
    "A uniquely quantum link between qubits: measuring one instantly constrains the others. It's the resource that makes quantum computers more than fancy coin-flippers.",
  superposition:
    "A qubit's ability to be in a blend of 0 and 1 at once — collapsed to a definite answer only when measured.",
  statevector:
    "An exact mathematical description of a quantum state. Statevector simulation is perfect but only feasible for small circuits.",
  "density matrix":
    "A richer description of a quantum state that can also represent noise — used for realistic simulations of imperfect hardware.",
  "approximation ratio":
    "How close an optimizer's answer is to the true best answer. 0.94 means within 6% of optimal.",
  "barren plateau":
    "A training dead-zone where the optimization landscape goes flat as circuits grow — a key scaling challenge for variational algorithms.",
  "magic state":
    "A special resource state fault-tolerant computers consume to run certain gates — often the dominant cost in error-corrected algorithms.",
  "T gate":
    "A basic quantum operation that's cheap on paper but expensive under error correction — algorithms are often costed in T gates.",
  NISQ:
    "Noisy Intermediate-Scale Quantum — today's era of machines: useful sizes, but no error correction yet.",
  "fault-tolerant":
    "A future class of quantum computers that correct their own errors, unlocking long algorithms that today's noisy machines can't finish.",
  Shor:
    "Shor's algorithm. Factors large numbers exponentially faster than classical methods — the reason quantum computers threaten today's encryption.",
  HHL:
    "A quantum algorithm for solving systems of linear equations with exponential speedup — but it needs error-corrected hardware.",
  hybrid:
    "An approach that splits work between a quantum processor and a classical computer, each doing what it's best at.",
  shot:
    "A single run of a circuit. Results are statistics over many shots.",
};

export const GLOSSARY_TERMS = Object.keys(GLOSSARY);
