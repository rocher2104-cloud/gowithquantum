import { useCallback, useEffect, useRef } from "react";
import { STEPS } from "../data/mock";
import { useApp } from "./AppStore";

const STEP_MS = 1600; // dwell per automated step

/**
 * Drives a job's step progression over time, pausing at human-in-the-loop
 * gates. Ported from the old prototype's `animateRun` / `handleGate`.
 */
export function useRunSimulation(jobId: number | undefined) {
  const { getJob, updateJob } = useApp();
  const job = jobId != null ? getJob(jobId) : undefined;
  const timer = useRef<number | null>(null);

  const status = job?.status;
  const step = job?.step;

  useEffect(() => {
    if (jobId == null || status !== "running" || step == null) return;

    // Reached the end -> mark done.
    if (step >= STEPS.length) {
      updateJob(jobId, { status: "done", step: STEPS.length });
      return;
    }

    // Current step is a human gate -> pause and wait for the user.
    if (STEPS[step].gate) {
      updateJob(jobId, { status: "needs" });
      return;
    }

    // Otherwise advance after a dwell.
    timer.current = window.setTimeout(() => {
      updateJob(jobId, { step: step + 1 });
    }, STEP_MS);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [jobId, status, step, updateJob]);

  /** User approved a gate (or chose an alternative) — resume past it. */
  const resolveGate = useCallback(
    (action: "approve" | "sim" | "iterate" | "accept" | "hold") => {
      if (jobId == null || step == null) return;
      if (action === "hold") {
        updateJob(jobId, { status: "queued" });
        return;
      }
      updateJob(jobId, { step: step + 1, status: "running" });
    },
    [jobId, step, updateJob],
  );

  /** Start a queued job running. */
  const start = useCallback(() => {
    if (jobId == null) return;
    updateJob(jobId, { status: "running" });
  }, [jobId, updateJob]);

  return { resolveGate, start };
}
