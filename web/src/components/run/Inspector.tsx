import { Tab, TabList, makeStyles, tokens } from "@fluentui/react-components";
import { useState } from "react";
import type { ResultData } from "../../data/models";
import { CircuitDiagram } from "./CircuitDiagram";
import { Histogram } from "./Histogram";
import { CodePanel } from "./CodePanel";
import { ReportPanel } from "./ReportPanel";
import { AdvantagePanel } from "./AdvantagePanel";
type InspectorTab = "circuit" | "histogram" | "code" | "report" | "advantage";

const useStyles = makeStyles({
  root: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    marginTop: "20px",
  },
  tabBar: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: "0 8px",
    background: tokens.colorNeutralBackground2,
  },
  panel: { padding: "16px" },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px", background: tokens.colorNeutralStroke2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium, overflow: "hidden",
    marginBottom: "14px",
  },
  stat: { background: tokens.colorNeutralBackground1, padding: "12px 14px" },
  statK: { fontSize: "11px", color: tokens.colorNeutralForeground3, marginBottom: "4px", fontWeight: 500 },
  statV: { fontFamily: "'DM Mono', monospace", fontSize: "19px", fontWeight: 600 },
  meta: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "10px", fontFamily: "'DM Mono', monospace" },
});

export function Inspector({ result }: { result: ResultData }) {
  const s = useStyles();
  const [tab, setTab] = useState<InspectorTab>("circuit");

  return (
    <div className={s.root}>
      <div className={s.tabBar}>
        <TabList
          selectedValue={tab}
          onTabSelect={(_, d) => setTab(d.value as InspectorTab)}
          size="medium"
        >
          <Tab value="circuit">Circuit</Tab>
          <Tab value="histogram">Results</Tab>
          <Tab value="code">Code</Tab>
          <Tab value="report">Report</Tab>
          <Tab value="advantage">Advantage</Tab>
        </TabList>
      </div>

      <div className={s.panel}>
        {tab === "report" && <ReportPanel markdown={result.reportMarkdown} />}

        {tab === "advantage" && <AdvantagePanel advantage={result.advantage} />}

        {tab === "circuit" && (
          <>
            <CircuitDiagram circuit={result.circuit} />
            <div className={s.meta}>
              {result.circuit.qubits} qubits · {result.circuit.cols} layers · {result.circuit.gates.length} gates
            </div>
          </>
        )}

        {tab === "histogram" && (
          <>
            <Histogram bars={result.histogram} shots={result.shots} />
            <div className={s.meta}>
              {result.shots} shots · top bitstring: {result.histogram[0]?.state} ({((result.histogram[0]?.count / result.shots) * 100).toFixed(1)}%)
            </div>
          </>
        )}

        {tab === "code" && <CodePanel code={result.code} />}
      </div>
    </div>
  );
}
