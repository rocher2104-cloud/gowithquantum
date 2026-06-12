import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, makeStyles, tokens, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { ArrowRightRegular, AttachRegular, ChevronDownRegular } from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import { JobList } from "../components/shared/JobCard";
import { FitCheck } from "../components/solve/FitCheck";
import { EmptyState } from "../components/shared/EmptyState";
import { EXAMPLES } from "../data/mock";

const DOMAINS = ["All", "Optimization", "Chemistry", "Finance", "Materials", "Logistics"];

const useStyles = makeStyles({
  domainRow: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" },
  dp: {
    padding: "6px 14px", borderRadius: "999px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2, fontSize: "13px", fontWeight: 500, cursor: "pointer",
    ":hover": { borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, color: tokens.colorNeutralForeground1 },
  },
  dpActive: { background: tokens.colorNeutralBackground3, borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, color: tokens.colorNeutralForeground1, fontWeight: 600 },

  composer: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
    ":focus-within": { borderTopColor: tokens.colorBrandStroke1, borderRightColor: tokens.colorBrandStroke1, borderBottomColor: tokens.colorBrandStroke1, borderLeftColor: tokens.colorBrandStroke1, boxShadow: `0 0 0 2px ${tokens.colorBrandBackground2}` },
  },
  ctx: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "12px", fontWeight: 500, color: tokens.colorNeutralForeground3,
  },
  textarea: {
    width: "100%", border: "0", outline: "none", resize: "none",
    background: "transparent", color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase, fontSize: "17px", lineHeight: "1.55",
    padding: "16px 16px 6px",
  },
  tools: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px 12px" },
  toolBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "7px 12px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`, background: "transparent",
    color: tokens.colorNeutralForeground2, fontSize: "13px", fontWeight: 500, cursor: "pointer",
    ":hover": { borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, color: tokens.colorNeutralForeground1 },
  },
  sendBtn: {
    width: "40px", height: "40px", borderRadius: tokens.borderRadiusMedium,
    border: "0", background: tokens.colorBrandBackground, color: "#fff",
    display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
    ":hover": { background: tokens.colorBrandBackgroundHover },
    ":disabled": { opacity: 0.35, cursor: "default" },
  },

  exGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" },
  ex: {
    border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge,
    background: tokens.colorNeutralBackground1, padding: "14px", cursor: "pointer", textAlign: "left",
    ":hover": { borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1, background: tokens.colorNeutralBackground2, transform: "translateY(-1px)" },
  },
  exCat: { fontSize: "11px", color: tokens.colorNeutralForeground3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" },
  exT: { fontSize: "13px", fontWeight: 600, lineHeight: 1.4, color: tokens.colorNeutralForeground1 },
});

const EFFORT_OPTIONS = ["Quick", "Standard", "Exhaustive"] as const;
const EFFORT_TIMES = { Quick: "~1 min", Standard: "~5 min", Exhaustive: "~20 min" };

export function NewTask() {
  const s = useStyles();
  const navigate = useNavigate();
  const { currentWs, workspaces, jobs, createJob, effort, setEffort } = useApp();
  const ws = workspaces.find((w) => w.id === currentWs);
  const ta = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [domain, setDomain] = useState("All");

  const filtered = domain === "All" ? EXAMPLES : EXAMPLES.filter((e) => e.dom === domain.toLowerCase() || e.dom === "all");

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    const job = createJob(v);
    navigate(`/run/${job.id}`);
  };

  const domainForFit = domain === "All" ? "" : domain.toLowerCase();
  const mine = jobs.filter((j) => j.ws === currentWs).slice(0, 4);

  return (
    <>
      <PageHeader
        kicker={`Workspace · ${ws?.name}`}
        title="What would you like to solve?"
        sub="Describe your problem in plain words. We'll find an approach, run it on quantum hardware, and explain what we found — checking in with you along the way."
      />

      <div className={s.domainRow}>
        {DOMAINS.map((d) => (
          <button key={d} className={`${s.dp} ${domain === d ? s.dpActive : ""}`} onClick={() => setDomain(d)}>{d}</button>
        ))}
      </div>

      <div className={s.composer}>
        <div className={s.ctx}>
          Using <strong style={{ marginLeft: 4, marginRight: 4 }}>{ws?.files.length ?? 0} files</strong> from this workspace as context
        </div>
        <textarea
          ref={ta}
          className={s.textarea}
          rows={3}
          placeholder="e.g. Find the most efficient delivery routes for our 5 trucks across 40 stops…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
          }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <div className={s.tools}>
          <button className={s.toolBtn} onClick={() => navigate("/files")}>
            <AttachRegular fontSize={14} /> Attach files
          </button>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <button className={s.toolBtn}>
                {effort} <span style={{ color: tokens.colorNeutralForeground3, marginLeft: 2 }}>{EFFORT_TIMES[effort]}</span>
                <ChevronDownRegular fontSize={12} />
              </button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {EFFORT_OPTIONS.map((o) => (
                  <MenuItem key={o} onClick={() => setEffort(o)}>
                    {o} <span style={{ color: tokens.colorNeutralForeground3, marginLeft: 8 }}>{EFFORT_TIMES[o]}</span>
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
          <div style={{ flex: 1 }} />
          <button className={s.sendBtn} disabled={!text.trim()} onClick={submit}>
            <ArrowRightRegular fontSize={18} />
          </button>
        </div>
      </div>

      {text.length >= 20 && <FitCheck prompt={text} domain={domainForFit} />}

      <div style={{ marginTop: "24px" }}>
        <p style={{ fontSize: "13px", color: tokens.colorNeutralForeground3, marginBottom: "10px" }}>
          Not sure where to start? Try one of these:
        </p>
        <div className={s.exGrid}>
          {(filtered.length ? filtered : EXAMPLES).map((e, i) => (
            <button key={i} className={s.ex} onClick={() => { setText(e.t); ta.current?.focus(); }}>
              <div className={s.exCat}>{e.cat}</div>
              <div className={s.exT}>{e.t}</div>
            </button>
          ))}
        </div>
      </div>

      <SectionRow title="Recent in this workspace" />
      {mine.length ? <JobList jobs={mine} /> : <EmptyState title="No problems yet">Describe one above to get started.</EmptyState>}
    </>
  );
}
