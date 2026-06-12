"""The gowithquantum agent: natural language in, quantum result + report out.

A manual Claude tool-use loop. Claude designs a quantum algorithm, writes
Qiskit code, runs it via the ``run_quantum_circuit`` tool, inspects the result,
iterates if needed, and finishes with a Markdown report.
"""

from __future__ import annotations

import json
from pathlib import Path

import anthropic
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax

from .quantum_runner import run_quantum_circuit

_STEPS_FILE = Path(__file__).resolve().parent.parent / "shared" / "steps.json"


def _load_step_titles() -> list[str]:
    """Canonical step titles live in /shared/steps.json, shared with the web app."""
    try:
        data = json.loads(_STEPS_FILE.read_text())
        return [s["t"] for s in data["steps"]]
    except Exception:
        return [
            "Understand your problem",
            "Find proven approaches",
            "Draft candidate solutions",
            "Quick test at small scale",
            "Streamline the solution",
            "Run the real experiment",
            "Make sense of the results",
            "Refine together",
            "Check for a real advantage",
        ]

SYSTEM_PROMPT = """\
You are gowithquantum — an autonomous quantum-computing agent. A user describes \
a problem in plain language. Your job is to solve it end to end on a quantum \
computer (simulated locally for now) and explain the result so a non-specialist \
understands it.

Workflow for every request:
1. Restate the problem and decide whether a quantum approach genuinely helps. \
Pick a concrete algorithm (e.g. Grover search, QAOA, VQE, Deutsch-Jozsa, \
quantum phase estimation, a Bell/GHZ entanglement demo, quantum random number \
generation, etc.). If the problem is not a good fit for quantum, say so plainly \
and still demonstrate the closest meaningful quantum experiment.
2. Write a complete, self-contained Qiskit program and run it with the \
run_quantum_circuit tool. The environment already defines: `np` (numpy), \
`QuantumCircuit`, `transpile`, `AerSimulator`, a ready-made `simulator`, and \
`Statevector`/`Operator`/`DensityMatrix`. You may import anything else from qiskit.
   - Assign the output you care about (measurement counts, an expectation value, \
a decoded answer, ...) to a variable named `result`. Both stdout and `result` \
are returned to you.
   - Always extract a concrete result — measure, sample, or compute a value. \
Don't just build a circuit.
3. Inspect the output. If it is wrong, malformed, or the approach failed, fix \
the code and run again. Iterate until the result is trustworthy. Use the tool \
whenever you need to run or verify code — never assume what the output would be.
4. Finish with a final report in Markdown as your last message (no tool call).

As you work, call the report_progress tool whenever you move to a new phase of \
the 9-step plan (0 understand · 1 find approaches · 2 draft · 3 small-scale \
test · 4 streamline · 5 run experiment · 6 interpret · 7 refine · 8 check \
advantage), with a one-line plain-language note about what you are doing. This \
drives the live progress display the user watches — keep notes free of jargon.

The report must contain these sections:
- ## Problem — one-paragraph restatement of what the user asked.
- ## Approach — which quantum algorithm you used and why, in plain language.
- ## Circuit — a brief description plus the key Qiskit code.
- ## Results — the measured output, with the most likely outcome(s) called out.
- ## Interpretation — what the result means for the user's actual question.
- ## Caveats & next steps — simulator vs. real hardware, scaling, and accuracy.

Keep code correct and minimal. Be decisive on small choices (qubit count, shot \
count, gate decompositions) rather than asking. Explain quantum concepts in \
accessible terms — assume a smart reader who is not a physicist.\
"""

TOOLS = [
    {
        "name": "run_quantum_circuit",
        "description": (
            "Execute a Qiskit program on a local quantum simulator (Aer) and "
            "get back its stdout and result.\n\n"
            "The environment already defines: `np` (numpy), `QuantumCircuit`, "
            "`transpile`, `AerSimulator`, a ready-made `simulator = "
            "AerSimulator()`, and `Statevector`/`Operator`/`DensityMatrix`. You "
            "may import anything else from qiskit.\n\n"
            "Assign the output you care about (measurement counts, an "
            "expectation value, a decoded answer, ...) to a variable named "
            "`result`. Both stdout and `result` are returned to you. Call this "
            "whenever you need to run or verify code — never guess the output."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Complete, self-contained Qiskit Python code to execute.",
                },
                "explanation": {
                    "type": "string",
                    "description": "One sentence on what this code does and why.",
                },
            },
            "required": ["code"],
        },
    },
    {
        "name": "report_progress",
        "description": (
            "Report which phase of the 9-step plan you are in, with a short "
            "plain-language note. Call this whenever you move to a new phase; "
            "it drives the live progress display the user watches. Steps: "
            "0 understand · 1 find approaches · 2 draft · 3 small-scale test · "
            "4 streamline · 5 run experiment · 6 interpret · 7 refine · "
            "8 check advantage."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "step": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 8,
                    "description": "Index of the plan step you are now working on.",
                },
                "note": {
                    "type": "string",
                    "description": "One jargon-free sentence on what you are doing.",
                },
            },
            "required": ["step", "note"],
        },
    },
]


class QuantumAgent:
    """Drives a Claude tool-use loop to solve a problem on a quantum simulator."""

    # The 9-step plan shown in the UI — loaded from /shared/steps.json so the
    # web app and the agent can never drift apart.
    _STEP_TITLES = _load_step_titles()

    def __init__(self, client=None, model="claude-opus-4-8", max_turns=12,
                 console=None, on_event=None):
        self.client = client or anthropic.Anthropic()
        self.model = model
        self.max_turns = max_turns
        self.console = console or Console()
        # on_event(dict) is called for each structured progress event.
        # Signature: {"type": str, ...}  — see _emit() calls below.
        self.on_event = on_event or (lambda _e: None)
        self._tool_calls = 0
        self._current_step = 0
        # Once the model self-reports progress we stop the heuristic mapping.
        self._progress_reported = False

    # ── event helpers ──────────────────────────────────────────────────────────

    def _emit(self, event: dict) -> None:
        """Fire a structured event to the registered callback."""
        try:
            self.on_event(event)
        except Exception:
            pass  # never let a broken callback crash the agent

    def _step_start(self, step: int, status: str = "running") -> None:
        self._emit({"type": "step_start", "step": step,
                    "title": self._STEP_TITLES[step], "status": status})

    def _step_done(self, step: int) -> None:
        self._emit({"type": "step_done", "step": step})

    def _note(self, step: int, text: str) -> None:
        self._emit({"type": "step_note", "step": step, "note": text})

    # ── main loop ──────────────────────────────────────────────────────────────

    def solve(self, problem: str) -> str:
        """Run the agent loop and return the final Markdown report."""
        # Step 0: understand the problem
        self._step_start(0)
        self._note(0, "Reading your description and workspace context.")

        messages = [{"role": "user", "content": problem}]
        final_report = ""
        turn_num = 0

        for _ in range(self.max_turns):
            # Heuristic fallback for the first turns, until the model starts
            # self-reporting via report_progress.
            if self._progress_reported:
                pass
            elif turn_num == 0:
                self._step_done(0)
                self._step_start(1)
                self._note(1, "Searching known algorithm families for a fit.")
            elif turn_num == 1 and self._tool_calls == 0:
                self._step_done(1)
                self._step_start(2)
                self._note(2, "Drafting circuit variants to compare.")

            content, stop_reason, text = self._run_turn(messages)
            messages.append({"role": "assistant", "content": content})
            turn_num += 1

            if stop_reason == "tool_use":
                tool_results = self._execute_tools(content)
                messages.append({"role": "user", "content": tool_results})
                continue

            if stop_reason == "max_tokens":
                self.console.print(
                    "\n[yellow]Response hit the token limit; the report may be incomplete.[/]"
                )

            # Final turn — generating the report
            if self._progress_reported:
                for done in range(self._current_step, 8):
                    self._step_done(done)
            else:
                self._step_done(min(6 + self._tool_calls, 7))
            self._step_start(8)
            self._note(8, "Comparing against classical baseline. Documenting findings.")
            final_report = text
            break
        else:
            self.console.print(
                f"\n[yellow]Stopped after {self.max_turns} turns without a final report.[/]"
            )
        return final_report

    def _run_turn(self, messages):
        """Stream one assistant turn, rendering thinking/text live."""
        text_parts: list[str] = []
        open_block = None
        with self.client.messages.stream(
            model=self.model,
            max_tokens=16000,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            thinking={"type": "adaptive", "display": "summarized"},
            output_config={"effort": "high"},
            tools=TOOLS,
            messages=messages,
        ) as stream:
            for event in stream:
                if event.type == "content_block_start":
                    block_type = event.content_block.type
                    if block_type == "thinking":
                        self.console.print("\n[dim italic]· thinking[/]")
                        open_block = "thinking"
                    elif block_type == "text":
                        self.console.print()
                        open_block = "text"
                    elif block_type == "tool_use":
                        self.console.print("\n[bold cyan]→ run_quantum_circuit[/]")
                        open_block = "tool_use"
                elif event.type == "content_block_delta":
                    delta = event.delta
                    if delta.type == "thinking_delta":
                        self.console.print(
                            delta.thinking, end="", style="dim italic",
                            markup=False, highlight=False,
                        )
                    elif delta.type == "text_delta":
                        self.console.print(
                            delta.text, end="", markup=False, highlight=False,
                        )
                        text_parts.append(delta.text)
                elif event.type == "content_block_stop":
                    if open_block in ("thinking", "text"):
                        self.console.print()
                    open_block = None
            final = stream.get_final_message()
        return final.content, final.stop_reason, "".join(text_parts)

    def _handle_progress_report(self, block):
        """The model self-reported its phase — drive the plan display from it."""
        step = max(0, min(int(block.input.get("step", 0)), len(self._STEP_TITLES) - 1))
        note = str(block.input.get("note", "")).strip()
        if not self._progress_reported:
            self._progress_reported = True
        for done in range(self._current_step, step):
            self._step_done(done)
        self._current_step = step
        self._step_start(step)
        if note:
            self._note(step, note)
            self.console.print(f"[dim]· {self._STEP_TITLES[step]} — {note}[/]")
        return {
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": json.dumps({"ok": True, "step": step}),
        }

    def _execute_tools(self, content):
        """Run every tool_use block in the turn and return tool_result blocks."""
        results = []
        for block in content:
            if block.type != "tool_use":
                continue
            if block.name == "report_progress":
                results.append(self._handle_progress_report(block))
                continue
            code = block.input.get("code", "")
            explanation = block.input.get("explanation", "Running quantum circuit.")

            # Heuristic plan advancement — only until the model starts
            # self-reporting via report_progress.
            if self._progress_reported:
                pass
            elif self._tool_calls == 0:
                self._step_done(min(2, 2))
                self._step_start(3)
                self._note(3, "Running candidate circuits on the local simulator.")
                self._step_done(3)
                self._step_start(4)
                self._note(4, "Transpiling and optimising the best candidate.")
                self._step_done(4)
                self._step_start(5)
                self._note(5, explanation)
            else:
                self._step_done(6)
                self._step_start(7)
                self._note(7, explanation)

            if explanation:
                self.console.print(f"[dim]{explanation}[/]")
            self.console.print(
                Panel(
                    Syntax(code, "python", theme="ansi_dark", word_wrap=True),
                    title="quantum circuit",
                    border_style="cyan",
                )
            )
            outcome = run_quantum_circuit(code)
            self._render_outcome(outcome)
            self._tool_calls += 1

            # Emit tool outcome event so the frontend can show code + result.
            self._emit({
                "type": "tool_result",
                "call_index": self._tool_calls,
                "ok": outcome.get("ok", False),
                "stdout": outcome.get("stdout", "")[:2000],
                "result": outcome.get("result"),
                "error": outcome.get("error", ""),
            })

            # Advance to "make sense" step after execution (heuristic fallback).
            if not self._progress_reported:
                step_after = 5 if self._tool_calls <= 1 else 7
                self._step_done(step_after)
                self._step_start(6)
                self._note(6, "Analysing the measurements and cross-checking with the simulator.")

            results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(outcome),
                    "is_error": not outcome.get("ok", False),
                }
            )
        return results

    def _render_outcome(self, outcome):
        if outcome.get("ok"):
            body = ""
            if outcome.get("stdout"):
                body += outcome["stdout"].rstrip() + "\n"
            if outcome.get("result") is not None:
                body += "result = " + json.dumps(outcome["result"], indent=2)
            if outcome.get("note"):
                body += ("\n" if body else "") + outcome["note"]
            self.console.print(
                Panel(body.strip() or "(no output)", title="result", border_style="green")
            )
        else:
            self.console.print(
                Panel(
                    outcome.get("error", "unknown error"),
                    title="execution error",
                    border_style="red",
                )
            )
