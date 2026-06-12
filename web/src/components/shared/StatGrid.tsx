import { makeStyles, tokens, Text } from "@fluentui/react-components";

interface Stat {
  key: string;
  value: string;
  sub?: string;
}

interface StatGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gap: "1px",
    background: tokens.colorNeutralStroke2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: "hidden",
  },
  cell: {
    background: tokens.colorNeutralBackground1,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  key: {
    color: tokens.colorNeutralForeground3,
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  value: {
    fontFamily: tokens.fontFamilyMonospace,
    fontWeight: 600,
    fontSize: "18px",
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.2,
  },
  sub: {
    color: tokens.colorNeutralForeground3,
    fontSize: "11px",
  },
});

export function StatGrid({ stats, columns = 3 }: StatGridProps) {
  const s = useStyles();
  return (
    <div className={s.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {stats.map((stat) => (
        <div key={stat.key} className={s.cell}>
          <Text className={s.key}>{stat.key}</Text>
          <Text className={s.value}>{stat.value}</Text>
          {stat.sub && <Text className={s.sub}>{stat.sub}</Text>}
        </div>
      ))}
    </div>
  );
}
