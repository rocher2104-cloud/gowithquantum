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

## The app — `web/`

The gowithquantum **workspace** is a Vite + React + Fluent UI app:

```bash
cd web && npm install && npm run dev    # http://localhost:5191
```

What's inside:

- **Agent-first home** — the app opens on "What would you like to solve?", with a
  prompt composer, outcome-framed examples, and anything that needs your review.
- **Quantum Fit Check** — before you run anything, an honest triage: quantum
  advantage today, at scale, or "classical is better here" — with evidence,
  estimated cost and time. The heuristic in `web/src/data/fit.ts` is the seam
  where a Claude call goes.
- **Guided & expert modes** — guided (default) hides the research workbench; the
  agent does literature review, algorithm design, simulation, and resource
  estimation for you, reachable per-run via the "Behind the scenes" panel. Expert
  mode (Settings, or the avatar menu) restores the full numbered workbench.
- **A live run timeline** — runs progress at the store level (like a server-side
  run will), pausing at human gates that show the agent's reasoning and cost.
- **The Advantage Verdict** — every finished run gets an honest, color-coded call
  (quantum advantage / hybrid / no advantage yet), shown on job cards, the run
  page, and reports.
- **Ask about this result** — a conversational panel on every finished run with
  streamed answers (canned in the prototype; the contract is question in →
  streamed tokens out, so wiring the live agent is a transport swap).
- **An inspector** with four tabs: **Circuit**, **Results** (histogram),
  **Code** (Qiskit), and **Report** (plain-language write-up), plus glossary
  tooltips on jargon throughout.

Backend-readiness, already wired into the prototype:

- `web/src/protocol/` defines the **run event protocol** (`step_start`,
  `step_note`, `gate`, `tool_result`, `report`) mirroring the Python agent's
  emitted events; a `MockRunStream` feeds the UI today, an SSE stream replaces it.
- `shared/steps.json` is the **single source of truth** for the 9-step plan,
  loaded by both the web app and the Python agent.
- State uses string ids and ISO timestamps and persists to localStorage — runs
  resume mid-flight after a reload, exactly like a server-side run would.

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
| [`agent.py`](gowithquantum/agent.py) | The Claude (Opus 4.8) tool-use loop, system prompt, streaming. Claude self-reports its phase via a `report_progress` tool, emitting the same step events the web app's protocol consumes. |
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
