/**
 * Run event protocol — the wire contract between the UI and the agent engine.
 *
 * These shapes mirror the structured events emitted by the Python agent
 * (gowithquantum/agent.py `_emit`). The prototype feeds them from
 * MockRunStream; the real backend will feed the identical shapes over SSE.
 */
import type { ResultData } from "../data/models";
import type { GateKind } from "../data/models";

export interface StepStartEvent {
  type: "step_start";
  step: number;
  title: string;
  status: "running";
}

export interface StepNoteEvent {
  type: "step_note";
  step: number;
  note: string;
}

export interface StepDoneEvent {
  type: "step_done";
  step: number;
}

/** The agent pauses and asks the human for a decision. */
export interface GateEvent {
  type: "gate";
  step: number;
  gate: GateKind;
  /** Plain-language reasoning for why the agent is asking. */
  reasoning: string;
  estimatedCost?: string;
  estimatedQueue?: string;
}

export interface ToolResultEvent {
  type: "tool_result";
  call_index: number;
  ok: boolean;
  stdout: string;
  result: unknown;
  error: string;
}

/** Final event: the run is complete and the full result is attached. */
export interface ReportEvent {
  type: "report";
  result: ResultData;
  markdown: string;
}

export type RunEvent =
  | StepStartEvent
  | StepNoteEvent
  | StepDoneEvent
  | GateEvent
  | ToolResultEvent
  | ReportEvent;

export type GateAction = "approve" | "sim" | "iterate" | "accept" | "hold";

/**
 * A live run the UI can subscribe to. MockRunStream implements this today;
 * an SSE-backed implementation replaces it when the API exists.
 */
export interface RunStream {
  subscribe(onEvent: (e: RunEvent) => void): () => void;
  /** Resume past a human gate (or hold the run). */
  resolveGate(action: GateAction): void;
  /** Stop emitting and release timers. */
  dispose(): void;
}
