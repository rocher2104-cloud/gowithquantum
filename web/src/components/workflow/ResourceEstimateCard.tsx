import { Badge, Text, makeStyles, tokens } from "@fluentui/react-components";
import type { ResourceEstimate } from "../../data/models";
import { StatGrid } from "../shared/StatGrid";

interface Props {
  estimate: ResourceEstimate;
}

const useStyles = makeStyles({
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "16px",
    background: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: 600,
    fontSize: "13px",
  },
});

function readinessBadge(year: number) {
  if (year <= 2028) return <Badge appearance="tint" color="success">Ready ~{year}</Badge>;
  if (year <= 2032) return <Badge appearance="tint" color="warning">Ready ~{year}</Badge>;
  return <Badge appearance="tint" color="danger">Ready ~{year}</Badge>;
}

export function ResourceEstimateCard({ estimate }: Props) {
  const s = useStyles();

  return (
    <div className={s.card}>
      <div className={s.header}>
        <Text className={s.title}>{estimate.algorithmName}</Text>
        {readinessBadge(estimate.hardwareReadinessYear)}
      </div>
      <StatGrid
        columns={3}
        stats={[
          { key: "T-gates", value: estimate.tGateCount.toLocaleString() },
          { key: "T-depth", value: estimate.tGateDepth.toLocaleString() },
          { key: "Phys. qubits", value: estimate.physicalQubits.toLocaleString() },
          { key: "Code cycles", value: (estimate.surfaceCodeCycles / 1e6).toFixed(1) + "M" },
          { key: "Runtime", value: estimate.estimatedRuntimeHours.toFixed(1) + "h" },
          { key: "Code", value: estimate.codeType + " d=" + estimate.codeDistance },
        ]}
      />
    </div>
  );
}
