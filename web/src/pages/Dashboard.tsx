import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { AddRegular, ArrowRightRegular } from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { JobList } from "../components/shared/JobCard";
import { EmptyState } from "../components/shared/EmptyState";
import { StatusBadge } from "../components/shared/StatusBadge";
import { accents } from "../theme/brand";

const useStyles = makeStyles({
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "28px",
    "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
  statCard: {
    padding: "16px 18px",
    background: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderTopWidth: "3px",
    cursor: "default",
  },
  statCardLink: {
    cursor: "pointer",
    ":hover": { background: tokens.colorNeutralBackground2 },
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: tokens.colorNeutralForeground3,
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },
  needsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "10px",
    marginBottom: "8px",
  },
  needsCard: {
    padding: "14px 16px",
    background: accents.humanBg,
    border: `1px solid ${accents.humanBorder}`,
    borderRadius: tokens.borderRadiusLarge,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  needsTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  needsMeta: {
    fontSize: "12px",
    color: accents.humanText,
  },
  activeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "10px",
    marginBottom: "8px",
  },
  activeCard: {
    padding: "14px 16px",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  },
  activeAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "3px",
    background: accents.quantum,
  },
  activeTitle: {
    fontSize: "14px",
    fontWeight: 600,
    paddingLeft: "2px",
    marginBottom: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  activeMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    marginBottom: "12px",
    paddingLeft: "2px",
  },
  wsChip: {
    background: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    borderRadius: tokens.borderRadiusSmall,
    padding: "1px 7px",
    fontSize: "11px",
    fontWeight: 600,
  },
  activeBarWrap: {
    height: "5px",
    borderRadius: "3px",
    background: tokens.colorNeutralBackground4,
    overflow: "hidden",
    marginBottom: "8px",
  },
  activeBar: {
    height: "100%",
    background: accents.quantum,
    transition: "width 0.4s ease",
  },
  activeFoot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeStep: {
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    fontSize: "11px",
  },
  activeOpen: {
    color: tokens.colorBrandForeground1,
    fontWeight: 600,
    fontSize: "12px",
  },
});

const STAT_BORDERS = [accents.quantum, accents.human, accents.advantage, tokens.colorNeutralStroke1];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function Dashboard() {
  const s = useStyles();
  const navigate = useNavigate();
  const { jobs, workspaces } = useApp();

  const running = jobs.filter((j) => j.status === "running");
  const needs = jobs.filter((j) => j.status === "needs");
  const done = jobs.filter((j) => j.status === "done");
  const recent = jobs.slice(0, 6);

  const STATS = [
    { label: "Active jobs",      value: running.length, border: STAT_BORDERS[0], onClick: undefined },
    { label: "Awaiting review",  value: needs.length,   border: STAT_BORDERS[1], onClick: () => navigate("/queue") },
    { label: "Completed",        value: done.length,    border: STAT_BORDERS[2], onClick: undefined },
    { label: "Credits used",     value: "$45.70",       border: STAT_BORDERS[3], onClick: () => navigate("/billing") },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}, Rocher.`}
        sub="Here's what's happening across your workspaces."
        action={
          <Button appearance="primary" icon={<AddRegular />} onClick={() => navigate("/solve")}>
            New task
          </Button>
        }
      />

      {/* Stats */}
      <div className={s.statsRow}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={mergeClasses(s.statCard, stat.onClick ? s.statCardLink : "")}
            style={{ borderTopColor: stat.border }}
            onClick={stat.onClick}
          >
            <div className={s.statLabel}>{stat.label}</div>
            <div className={s.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      {needs.length > 0 && (
        <>
          <SectionRow title="Needs your review" />
          <div className={s.needsGrid}>
            {needs.map((j) => {
              const ws = workspaces.find((w) => w.id === j.ws);
              return (
                <div key={j.id} className={s.needsCard}>
                  <div className={s.needsTitle}>{j.title}</div>
                  <div className={s.needsMeta}>{ws?.name} · {j.created}</div>
                  <StatusBadge status={j.status} />
                  <Button
                    size="small"
                    appearance="primary"
                    icon={<ArrowRightRegular />}
                    iconPosition="after"
                    style={{ alignSelf: "flex-start", marginTop: "4px" }}
                    onClick={() => navigate(`/run/${j.id}`)}
                  >
                    Review
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Active now */}
      {running.length > 0 && (
        <>
          <SectionRow title="Active now" />
          <div className={s.activeGrid}>
            {running.map((j) => {
              const ws = workspaces.find((w) => w.id === j.ws);
              const pct = Math.round((j.step / 9) * 100);
              return (
                <Card
                  key={j.id}
                  className={s.activeCard}
                  onClick={() => navigate(`/run/${j.id}`)}
                >
                  <span className={s.activeAccent} />
                  <div className={s.activeTitle}>{j.title}</div>
                  <div className={s.activeMeta}>
                    <span className={s.wsChip}>{ws?.name}</span>
                    <span style={{ color: tokens.colorNeutralForeground3 }}>{j.created}</span>
                  </div>
                  <div className={s.activeBarWrap}>
                    <div className={s.activeBar} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={s.activeFoot}>
                    <span className={s.activeStep}>Step {j.step} / 9</span>
                    <span className={s.activeOpen}>Open →</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Recent */}
      <SectionRow title="Recent" />
      {recent.length > 0 ? (
        <JobList jobs={recent} />
      ) : (
        <EmptyState title="No jobs yet." />
      )}
    </>
  );
}
