# gowithquantum

Solve problems with quantum computers using natural language. Think *claude-code,
but for quantum computing*: you describe a problem in plain English, an agent turns
it into quantum code, runs it, interprets the output, and hands you a report.

```
natural language  ──▶  the agent designs an algorithm + writes Qiskit
                  ──▶  runs it on a backend (local simulator today)
                  ──▶  inspects results, fixes & re-runs if needed
                  ──▶  writes a plain-language report
```

## The app — `web/index.html`

The gowithquantum **desktop workspace** is a single, self-contained web app. Just
open it — no build step, no install:

```bash
open web/index.html        # macOS — or double-click it in a file browser
```

(Or serve the `web/` folder with any static server and visit it.)

What's inside:

- **A prompt composer** — describe a problem, pick a backend, hit Solve.
- **An organized shell** — sidebar nav (Workspace / Compute / Learn), an example
  library grouped by domain (search, foundations, optimization), and a ⌘K command
  palette.
- **A live run timeline** — Understand → Choose algorithm → Build circuit → Run →
  Interpret → Report, streamed as the agent works.
- **An inspector** with four tabs: **Circuit** (a real diagram), **Results** (a
  measurement histogram), **Code** (the Qiskit program), and **Report** (a
  journal-style write-up).
- **Built for technical users** — glossary tooltips on every term (qubit, shots,
  oracle, fidelity…), instrument-style readouts, and a layout that collapses to an
  icon rail on narrow windows.

> This is a high-fidelity **front-end prototype** with simulated agent runs, so you
> can feel the whole product immediately. The Python package below is the **engine**
> that powers real runs — connecting the two is the next step (see Roadmap).

### Design

A "lab instrument" aesthetic, deliberately not the clichéd purple-quantum look:
deep ink canvas with a blueprint grid, an amber hero accent and a teal accent for
qubits/states, the `|ψ⟩` ket as the brand mark, and the IBM Plex superfamily (Sans
for UI, Mono for data/code, Serif for the report).

## The engine — `gowithquantum/` (Python)

The agent that actually designs and runs circuits. A manual Claude tool-use loop:
Claude writes Qiskit code, runs it via the `run_quantum_circuit` tool on a local
Aer simulator, inspects the result, iterates, and produces a Markdown report.

| File | Responsibility |
| --- | --- |
| [`agent.py`](gowithquantum/agent.py) | The Claude (Opus 4.8) tool-use loop, system prompt, streaming. |
| [`quantum_runner.py`](gowithquantum/quantum_runner.py) | Runs Claude's Qiskit code on the Aer simulator and returns results. |
| [`cli.py`](gowithquantum/cli.py) | A thin dev harness for driving the engine from a terminal. |

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .
export ANTHROPIC_API_KEY=sk-ant-...
python -m gowithquantum.cli "Find the marked item 110 in a 3-qubit search space"
```

> Security note: `run_quantum_circuit` executes model-generated Python in-process.
> That's intentional for the MVP, but it's not a sandbox — isolate it (container,
> remote worker) before exposing it to untrusted input or running it as a service.

## Roadmap

- **Wire the app to the engine** — a small API (FastAPI + streaming) that runs the
  Python agent and feeds the live timeline, circuit, histogram, and report.
- **Real quantum hardware** — swap the local simulator for AWS Braket, IBM Quantum,
  or Azure Quantum behind the same tool interface (the app's Backends panel already
  anticipates this).
- **Sandboxed execution** for generated circuits.
- **Saved sessions & shareable reports.**
```
