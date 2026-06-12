/**
 * MockRunStream — emits the same RunEvent sequence the Python agent produces,
 * on timers, so the whole UI consumes the backend contract today. Swapping in
 * a real SSE stream later should touch nothing but the stream construction.
 */
import { STEPS } from "../data/mock";
import { detectFit } from "../data/fit";
import { generateResult } from "./generateResult";
import type { GateAction, RunEvent, RunStream } from "./events";

const STEP_MS = 1600;
const NOTE_MS = 700;

export class MockRunStream implements RunStream {
  private listeners = new Set<(e: RunEvent) => void>();
  private timers: number[] = [];
  private step: number;
  private disposed = false;
  private waitingAtGate = false;

  constructor(
    private title: string,
    fromStep = 0,
    private domain = "",
  ) {
    this.step = fromStep;
  }

  subscribe(onEvent: (e: RunEvent) => void): () => void {
    this.listeners.add(onEvent);
    return () => this.listeners.delete(onEvent);
  }

  start(): void {
    this.runStep(this.step);
  }

  resolveGate(action: GateAction): void {
    if (!this.waitingAtGate) return;
    this.waitingAtGate = false;
    if (action === "hold") return; // engine sets the job to queued; resume via start()
    this.runStep(this.step + 1);
  }

  dispose(): void {
    this.disposed = true;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    this.listeners.clear();
  }

  private emit(e: RunEvent): void {
    if (this.disposed) return;
    this.listeners.forEach((fn) => fn(e));
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(() => !this.disposed && fn(), ms));
  }

  private runStep(index: number): void {
    this.step = index;
    if (index >= STEPS.length) {
      this.finish();
      return;
    }
    const step = STEPS[index];
    this.emit({ type: "step_start", step: index, title: step.t, status: "running" });

    // Stagger this step's notes so the timeline feels live.
    step.notes.forEach((note, ni) => {
      this.after(NOTE_MS * (ni + 1), () => this.emit({ type: "step_note", step: index, note }));
    });

    this.after(STEP_MS, () => {
      if (step.gate) {
        this.waitingAtGate = true;
        const fit = detectFit(this.title, this.domain);
        this.emit({
          type: "gate",
          step: index,
          gate: step.gate,
          reasoning:
            step.gate === "hardware"
              ? `The simulator result looks solid. Running on real hardware (${fit.provider}) validates it under real noise — but the simulator answer may already be sufficient for your decision.`
              : "I can push the circuit deeper for a slightly better answer, but the gain is likely small relative to the extra time and credits.",
          estimatedCost: fit.estimatedCost,
          estimatedQueue: "~6 min",
        });
        return; // wait for resolveGate()
      }
      // Emit a fabricated tool result where the agent would actually run code.
      if (index === 3 || index === 5) {
        const r = generateResult(this.title, this.domain);
        this.emit({
          type: "tool_result",
          call_index: index === 3 ? 1 : 2,
          ok: true,
          stdout: `counts = ${JSON.stringify(Object.fromEntries(r.histogram.map((h) => [h.state, h.count])))}`,
          result: r.histogram,
          error: "",
        });
      }
      this.emit({ type: "step_done", step: index });
      this.runStep(index + 1);
    });
  }

  private finish(): void {
    const result = generateResult(this.title, this.domain);
    this.emit({ type: "report", result, markdown: result.reportMarkdown });
  }
}
