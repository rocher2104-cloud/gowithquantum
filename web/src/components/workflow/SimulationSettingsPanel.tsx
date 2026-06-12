import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Dropdown,
  Field,
  InfoLabel,
  Option,
  Radio,
  RadioGroup,
  Slider,
  SpinButton,
  Switch,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { SimulationConfig } from "../../data/models";

interface Props {
  config: SimulationConfig;
  onChange: (patch: Partial<SimulationConfig>) => void;
}

const useStyles = makeStyles({
  panel: { display: "flex", flexDirection: "column", gap: "14px", padding: "4px 0 8px" },
  row: { display: "flex", flexDirection: "column", gap: "6px" },
  sliderRow: { display: "flex", alignItems: "center", gap: "8px" },
  info: { color: tokens.colorNeutralForeground3, fontSize: "11px", marginTop: "2px" },
  noiseSection: { display: "flex", flexDirection: "column", gap: "12px", paddingTop: "8px" },
});

export function SimulationSettingsPanel({ config, onChange }: Props) {
  const s = useStyles();

  return (
    <Accordion multiple collapsible defaultOpenItems={["simulator", "shots", "noise", "sweep"]}>
      <AccordionItem value="simulator">
        <AccordionHeader size="small">Simulator Type</AccordionHeader>
        <AccordionPanel>
          <div className={s.panel}>
            <RadioGroup
              value={config.simulatorType}
              onChange={(_, d) => onChange({ simulatorType: d.value as SimulationConfig["simulatorType"] })}
            >
              <Radio value="statevector" label="Statevector (exact, ≤25 qubits)" />
              <Radio value="shot-based" label="Shot-based (sampling)" />
              <Radio value="density-matrix" label="Density matrix (open systems)" />
            </RadioGroup>
            {config.simulatorType === "statevector" && (
              <Text className={s.info}>⚠ Uses 2^N memory — keep qubit count ≤20</Text>
            )}
          </div>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="shots">
        <AccordionHeader size="small">Shot Configuration</AccordionHeader>
        <AccordionPanel>
          <div className={s.panel}>
            <Field label={<InfoLabel info="Number of measurement samples. More shots = higher confidence, longer runtime.">Shots</InfoLabel>}>
              <div className={s.sliderRow}>
                <Slider
                  min={1000} max={100000} step={1000}
                  value={config.shots}
                  onChange={(_, d) => onChange({ shots: d.value })}
                  style={{ flex: 1 }}
                />
                <SpinButton
                  value={config.shots}
                  min={1000} max={100000} step={1000}
                  onChange={(_, d) => onChange({ shots: d.value ?? config.shots })}
                  style={{ width: 80 }}
                />
              </div>
            </Field>
            <Text className={s.info}>
              ~{config.shots >= 50000 ? (config.shots / 10000).toFixed(1) + "s" : (config.shots / 15000).toFixed(1) + "s"} estimated runtime
            </Text>
          </div>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="noise">
        <AccordionHeader size="small">Noise Model</AccordionHeader>
        <AccordionPanel>
          <div className={s.panel}>
            <Field label="Enable noise simulation">
              <Switch
                checked={config.noiseEnabled}
                onChange={(_, d) => onChange({ noiseEnabled: d.checked })}
                label={config.noiseEnabled ? "Noise enabled" : "Ideal (noiseless)"}
              />
            </Field>

            {config.noiseEnabled && (
              <div className={s.noiseSection}>
                <Field label="Noise model">
                  <Dropdown
                    value={config.noiseModel}
                    onOptionSelect={(_, d) => onChange({ noiseModel: d.optionValue as SimulationConfig["noiseModel"] })}
                  >
                    <Option value="depolarizing">Depolarizing</Option>
                    <Option value="t1t2">T1/T2 Decay</Option>
                    <Option value="custom">Custom</Option>
                  </Dropdown>
                </Field>

                <Field label={`Depolarizing rate: ${(config.depolarizingRate * 100).toFixed(2)}%`}>
                  <Slider
                    min={0} max={0.05} step={0.0001}
                    value={config.depolarizingRate}
                    onChange={(_, d) => onChange({ depolarizingRate: d.value })}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="T1 (μs)">
                    <SpinButton
                      value={config.t1Us} min={10} max={500} step={5}
                      onChange={(_, d) => {
                        const v = d.value ?? config.t1Us;
                        onChange({ t1Us: v, t2Us: Math.min(config.t2Us, v) });
                      }}
                    />
                  </Field>
                  <Field label="T2 (μs)">
                    <SpinButton
                      value={config.t2Us} min={10} max={config.t1Us} step={5}
                      onChange={(_, d) => onChange({ t2Us: d.value ?? config.t2Us })}
                    />
                  </Field>
                </div>

                <Field label={`Gate fidelity: ${(1 - config.gateErrorRate).toFixed(4)}`}>
                  <Slider
                    min={0.99} max={1.0} step={0.0001}
                    value={1 - config.gateErrorRate}
                    onChange={(_, d) => onChange({ gateErrorRate: 1 - d.value })}
                  />
                </Field>

                <Field label={`Readout error: ${(config.readoutErrorRate * 100).toFixed(1)}%`}>
                  <Slider
                    min={0} max={0.1} step={0.001}
                    value={config.readoutErrorRate}
                    onChange={(_, d) => onChange({ readoutErrorRate: d.value })}
                  />
                </Field>
              </div>
            )}
          </div>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="sweep">
        <AccordionHeader size="small">Hyperparameter Sweep</AccordionHeader>
        <AccordionPanel>
          <div className={s.panel}>
            <Field label="Enable parameter sweep">
              <Switch
                checked={config.sweepEnabled}
                onChange={(_, d) => onChange({ sweepEnabled: d.checked })}
                label={config.sweepEnabled ? "Sweep enabled" : "Single run"}
              />
            </Field>

            {config.sweepEnabled && (
              <>
                <Field label="Sweep parameter">
                  <Dropdown
                    value={config.sweepParam}
                    onOptionSelect={(_, d) => onChange({ sweepParam: d.optionValue as SimulationConfig["sweepParam"] })}
                  >
                    <Option value="gamma">gamma (phase separation)</Option>
                    <Option value="beta">beta (mixing angle)</Option>
                    <Option value="reps">reps (circuit depth)</Option>
                  </Dropdown>
                </Field>

                <Field label={`Steps: ${config.sweepSteps}`}>
                  <Slider
                    min={5} max={50} step={1}
                    value={config.sweepSteps}
                    onChange={(_, d) => onChange({ sweepSteps: d.value })}
                  />
                </Field>
              </>
            )}
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
