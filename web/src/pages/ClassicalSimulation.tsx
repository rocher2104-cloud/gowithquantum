import { useState } from "react";
import {
  Badge, Button, ProgressBar, Text,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { PlayRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { SimulationSettingsPanel } from "../components/workflow/SimulationSettingsPanel";
import { ConvergenceChart } from "../components/workflow/ConvergenceChart";
import { SweepHeatmap } from "../components/workflow/SweepHeatmap";
import { Histogram } from "../components/run/Histogram";
import { useApp } from "../store/AppStore";
import type { SimulationConfig } from "../data/models";
import { accents } from "../theme/brand";

const SWEEP_DATA = Array.from({ length: 8 }, (_, ri) =>
  Array.from({ length: 8 }, (_, ci) => 0.5 + 0.4 * Math.sin((ri + 1) * 0.6) * Math.cos((ci + 1) * 0.5))
);
const SWEEP_LABELS = ["0.1", "0.3", "0.5", "0.7", "0.9", "1.1", "1.3", "1.5"];

const NOISY_BARS = [
  { state: "0110", count: 320 },
  { state: "1010", count: 210 },
  { state: "0101", count: 180 },
  { state: "1100", count: 140 },
  { state: "0011", count: 90 },
  { state: "1001", count: 60 },
];

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  sidebar: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  resultCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  ratioRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ratioLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  histogramRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
  },
  histCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px",
    background: tokens.colorNeutralBackground1,
  },
  empty: {
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "60px 24px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
});

const DEFAULT_CONFIG: SimulationConfig = {
  id: "draft", jobId: 0,
  simulatorType: "statevector", shots: 4096,
  noiseEnabled: false, noiseModel: "none",
  depolarizingRate: 0.001, t1Us: 100, t2Us: 80,
  gateErrorRate: 0.001, readoutErrorRate: 0.01,
  sweepEnabled: false, sweepParam: "gamma", sweepSteps: 20,
  created: "now",
};

export function ClassicalSimulation() {
  const s = useStyles();
  const { addSimConfig, simConfigs, jobs } = useApp();
  const [config, setConfig] = useState<SimulationConfig>(simConfigs[0] ?? DEFAULT_CONFIG);
  const [running, setRunning] = useState(false);
  const [hasResults, setHasResults] = useState(!!simConfigs[0]?.results);

  const handleChange = (patch: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setHasResults(false);
  };

  const runSimulation = () => {
    setRunning(true);
    setTimeout(() => {
      const conv = Array.from({ length: 30 }, (_, i) => ({
        iteration: i + 1,
        energy: -1.2 - 0.8 * (1 - Math.exp(-i / 8)),
      }));
      const noisyConv = config.noiseEnabled
        ? conv.map((d) => ({ ...d, energy: d.energy + 0.12 }))
        : undefined;
      const saved = addSimConfig({
        ...config,
        jobId: jobs[0]?.id ?? 0,
        results: {
          convergenceData: conv,
          approximationRatio: config.noiseEnabled ? 0.76 : 0.89,
          classicalBaseline: 0.94,
          noisyData: noisyConv,
        },
      });
      setConfig(saved);
      setRunning(false);
      setHasResults(true);
    }, 1800);
  };

  const results = config.results;

  return (
    <>
      <PageHeader
        kicker="Step 4 · Experiment"
        title="Classical Simulation"
        sub="Configure the simulator, noise model, and hyperparameter sweep before committing to real hardware. Free and fast."
      />

      <div className={s.layout}>
        {/* Left: Settings */}
        <div className={s.sidebar}>
          <div className={s.sidebarHeader}>
            <Text weight="semibold" size={300}>Simulation Settings</Text>
          </div>
          <div style={{ padding: "0 0 8px" }}>
            <SimulationSettingsPanel config={config} onChange={handleChange} />
          </div>
          <div style={{ padding: "8px 16px 16px" }}>
            <Button
              appearance="primary"
              size="large"
              icon={<PlayRegular />}
              style={{ width: "100%" }}
              onClick={runSimulation}
              disabled={running}
            >
              {running ? "Running..." : "Run Simulation"}
            </Button>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: 6, textAlign: "center" }}>
              {config.simulatorType === "statevector" ? "Free · Exact · ≤25 qubits" : `Free · ${(config.shots / 1000).toFixed(0)}k shots`}
            </Text>
          </div>
        </div>

        {/* Right: Results */}
        <div className={s.results}>
          {!hasResults && !running && (
            <div className={s.empty}>
              <Text size={400} style={{ display: "block", marginBottom: 8 }}>No results yet</Text>
              <Text size={300}>Configure your simulation settings and click Run Simulation</Text>
            </div>
          )}

          {running && (
            <div className={s.resultCard}>
              <Text weight="semibold">Running simulation...</Text>
              <ProgressBar />
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {config.simulatorType === "statevector" ? "Computing exact statevector" : `Sampling ${config.shots.toLocaleString()} shots`}
              </Text>
            </div>
          )}

          {hasResults && results && (
            <>
              {/* Convergence chart */}
              <div className={s.resultCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text weight="semibold">Convergence</Text>
                  {config.noiseEnabled && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Badge appearance="tint" color="brand">Noiseless</Badge>
                      <Badge appearance="tint" color="warning">Noisy</Badge>
                    </div>
                  )}
                </div>
                <ConvergenceChart
                  data={results.convergenceData}
                  noisyData={config.noiseEnabled ? results.noisyData : undefined}
                />
              </div>

              {/* Approximation ratio vs classical */}
              <div className={s.resultCard}>
                <Text weight="semibold">Approximation Ratio vs Classical Baseline</Text>
                <div className={s.ratioRow}>
                  <div className={s.ratioLabel}>
                    <Text size={200}>Quantum ({config.noiseEnabled ? "noisy" : "noiseless"})</Text>
                    <Badge appearance="tint" color={results.approximationRatio >= results.classicalBaseline ? "success" : "informative"}>
                      {(results.approximationRatio * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <ProgressBar value={results.approximationRatio} color="brand" />
                </div>
                <div className={s.ratioRow}>
                  <div className={s.ratioLabel}>
                    <Text size={200}>Classical baseline (MILP)</Text>
                    <Badge appearance="tint" color="success">{(results.classicalBaseline * 100).toFixed(0)}%</Badge>
                  </div>
                  <ProgressBar value={results.classicalBaseline} color="success" />
                </div>
                {results.approximationRatio < results.classicalBaseline && (
                  <Text size={200} style={{ color: accents.human }}>
                    ⚠ Quantum result trails classical by {((results.classicalBaseline - results.approximationRatio) * 100).toFixed(0)}% — consider increasing p layers or reps.
                  </Text>
                )}
              </div>

              {/* Histograms: noiseless vs noisy */}
              {config.noiseEnabled && (
                <div className={s.histogramRow}>
                  <div className={s.histCard}>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: 8 }}>Noiseless measurement</Text>
                    <Histogram bars={[
                      { state: "0110", count: 412 }, { state: "1010", count: 268 },
                      { state: "0101", count: 151 }, { state: "1100", count: 98 },
                    ]} shots={config.shots} />
                  </div>
                  <div className={s.histCard}>
                    <Text weight="semibold" size={200} style={{ display: "block", marginBottom: 8 }}>Noisy measurement</Text>
                    <Histogram bars={NOISY_BARS} shots={config.shots} />
                  </div>
                </div>
              )}

              {/* Sweep heatmap */}
              {config.sweepEnabled && (
                <div className={s.resultCard}>
                  <Text weight="semibold">Hyperparameter Sweep: {config.sweepParam} × beta → Approximation Ratio</Text>
                  <SweepHeatmap
                    data={SWEEP_DATA}
                    xLabels={SWEEP_LABELS}
                    yLabels={SWEEP_LABELS}
                    xLabel={config.sweepParam}
                    yLabel="beta"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
