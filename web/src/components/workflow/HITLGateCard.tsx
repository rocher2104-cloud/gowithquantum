import { Button, Text, makeStyles, tokens } from "@fluentui/react-components";
import { PersonRegular } from "@fluentui/react-icons";
import { accents } from "../../theme/brand";

export type HITLGateKind = "hardware" | "improve" | "committee" | "accept";

interface HITLGateCardProps {
  gate: HITLGateKind;
  estimatedCost?: number;
  estimatedQueueMin?: number;
  backend?: string;
  onAction: (action: string) => void;
}

const GATE_CONFIG: Record<HITLGateKind, {
  title: string;
  description: string;
  actions: { label: string; value: string; primary?: boolean }[];
}> = {
  hardware: {
    title: "Ready to submit to hardware?",
    description: "This will consume quantum credits and join the provider queue.",
    actions: [
      { label: "Approve & Submit", value: "approve", primary: true },
      { label: "Run on Simulator Instead", value: "sim" },
      { label: "Hold", value: "hold" },
    ],
  },
  improve: {
    title: "Refine or accept this result?",
    description: "A deeper circuit might improve the approximation ratio by another 2–4%.",
    actions: [
      { label: "Accept result", value: "accept", primary: true },
      { label: "Iterate (refine circuit)", value: "iterate" },
    ],
  },
  committee: {
    title: "Present to research committee?",
    description: "Export this problem brief for committee review before proceeding.",
    actions: [
      { label: "Export & Present", value: "export", primary: true },
      { label: "Skip for now", value: "skip" },
    ],
  },
  accept: {
    title: "Accept this analysis?",
    description: "Mark the result as accepted and proceed to reporting.",
    actions: [
      { label: "Accept & Proceed", value: "accept", primary: true },
      { label: "Iterate more", value: "iterate" },
    ],
  },
};

const useStyles = makeStyles({
  card: {
    borderRadius: tokens.borderRadiusMedium,
    padding: "16px",
    background: accents.humanBg,
    borderLeft: `3px solid ${accents.humanBorder}`,
    border: `1px solid ${accents.humanBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  icon: {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusCircular,
    background: accents.human,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    marginTop: "2px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  meta: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: accents.humanText,
    fontFamily: tokens.fontFamilyMonospace,
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
});

export function HITLGateCard({ gate, estimatedCost, estimatedQueueMin, backend, onAction }: HITLGateCardProps) {
  const s = useStyles();
  const config = GATE_CONFIG[gate];

  return (
    <div className={s.card}>
      <div className={s.header}>
        <div className={s.icon}>
          <PersonRegular fontSize={18} />
        </div>
        <div className={s.info}>
          <Text weight="semibold" style={{ color: accents.humanText }}>{config.title}</Text>
          <Text size={200} style={{ color: accents.humanText }}>{config.description}</Text>
        </div>
      </div>

      {(estimatedCost !== undefined || estimatedQueueMin !== undefined || backend) && (
        <div className={s.meta}>
          {backend && <span>Backend: {backend}</span>}
          {estimatedCost !== undefined && <span>Cost: ~${estimatedCost.toFixed(2)}</span>}
          {estimatedQueueMin !== undefined && <span>Queue: ~{estimatedQueueMin} min</span>}
        </div>
      )}

      <div className={s.actions}>
        {config.actions.map((action) => (
          <Button
            key={action.value}
            appearance={action.primary ? "primary" : "secondary"}
            onClick={() => onAction(action.value)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
