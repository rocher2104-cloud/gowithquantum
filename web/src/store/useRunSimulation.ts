import { useCallback } from "react";
import { useApp } from "./AppStore";
import type { GateAction } from "../protocol/events";

/**
 * Thin per-job handle onto the store-level run engine. Runs progress globally
 * (see AppStore) — this hook only exposes gate resolution and start, matching
 * what a backend client will look like.
 */
export function useRunSimulation(jobId: string | undefined) {
  const { resolveGate: storeResolveGate, startJob } = useApp();

  const resolveGate = useCallback(
    (action: GateAction) => {
      if (jobId == null) return;
      storeResolveGate(jobId, action);
    },
    [jobId, storeResolveGate],
  );

  const start = useCallback(() => {
    if (jobId == null) return;
    startJob(jobId);
  }, [jobId, startJob]);

  return { resolveGate, start };
}
