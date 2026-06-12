import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AccessLevel,
  AlgorithmSpec,
  FeedItem,
  HardwareConfig,
  Job,
  JobComment,
  KeywordAlert,
  LiteraturePaper,
  ProblemBrief,
  ResourceEstimate,
  SimulationConfig,
  TeamMember,
  Workspace,
} from "../data/models";
import {
  INITIAL_JOBS,
  WORKSPACES,
  SIM_CONFIGS,
  HW_CONFIGS,
  PAPERS,
  RESOURCE_ESTIMATES,
  TEAM_MEMBERS,
  COMMENTS,
  FEED_ITEMS,
  KEYWORD_ALERTS,
  PROBLEM_BRIEFS,
  ALGORITHM_SPECS,
  STEPS,
} from "../data/mock";
import { MockRunStream } from "../protocol/mockRunStream";
import type { GateAction, GateEvent } from "../protocol/events";
import { nowIso } from "../lib/time";

export type ColorScheme = "light" | "dark";
export type Effort = "Quick" | "Standard" | "Exhaustive";
export type UiMode = "guided" | "expert";

interface AppState {
  // Jobs & workspaces
  jobs: Job[];
  workspaces: Workspace[];
  currentWs: string;
  colorScheme: ColorScheme;
  effort: Effort;
  uiMode: UiMode;
  userName: string;
  creditsUsed: number;
  setCurrentWs: (id: string) => void;
  toggleColorScheme: () => void;
  setEffort: (e: Effort) => void;
  setUiMode: (m: UiMode) => void;
  setUserName: (n: string) => void;
  addWorkspace: (name: string) => string;
  addFileToCurrent: () => void;
  createJob: (title: string, domain?: string) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  getJob: (id: string) => Job | undefined;
  // Run engine
  gateInfo: Record<string, GateEvent>;
  resolveGate: (jobId: string, action: GateAction) => void;
  startJob: (jobId: string) => void;
  // Simulation
  simConfigs: SimulationConfig[];
  addSimConfig: (config: Omit<SimulationConfig, "id" | "created">) => SimulationConfig;
  updateSimConfig: (id: string, patch: Partial<SimulationConfig>) => void;
  // Hardware
  hwConfigs: HardwareConfig[];
  addHwConfig: (config: Omit<HardwareConfig, "id">) => HardwareConfig;
  updateHwConfig: (id: string, patch: Partial<HardwareConfig>) => void;
  approveHwConfig: (id: string) => void;
  // Literature
  papers: LiteraturePaper[];
  addPaper: (paper: LiteraturePaper) => void;
  toggleBookmark: (paperId: string) => void;
  // Resource estimates
  resourceEstimates: ResourceEstimate[];
  addResourceEstimate: (est: Omit<ResourceEstimate, "id" | "created">) => ResourceEstimate;
  // Team
  teamMembers: TeamMember[];
  addTeamMember: (m: Omit<TeamMember, "id" | "joinedAt">) => void;
  updateMemberAccess: (id: string, access: AccessLevel) => void;
  // Comments
  comments: JobComment[];
  addComment: (jobId: string, authorName: string, body: string) => void;
  // Feed
  feedItems: FeedItem[];
  keywordAlerts: KeywordAlert[];
  toggleFeedBookmark: (id: string) => void;
  addKeywordAlert: (keyword: string) => void;
  removeKeywordAlert: (id: string) => void;
  toggleAlertActive: (id: string) => void;
  // Problem briefs
  problemBriefs: ProblemBrief[];
  upsertProblemBrief: (brief: Omit<ProblemBrief, "id" | "created">) => ProblemBrief;
  // Algorithm specs
  algorithmSpecs: AlgorithmSpec[];
  upsertAlgorithmSpec: (spec: Omit<AlgorithmSpec, "id" | "created">) => AlgorithmSpec;
}

const AppContext = createContext<AppState | null>(null);

// IDs are strings in a server-assigned shape so swapping in API-issued ids is
// a no-op for the UI.
let idSeq = 0;
function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${(idSeq++).toString(36)}`;
}

// ── Persistence ──────────────────────────────────────────────────────────────
// Everything in state is JSON-serializable — the same constraint an API gives
// us. Bump the key when the persisted shape changes.
const STORAGE_KEY = "gwq-state-v2";

interface PersistedState {
  jobs: Job[];
  workspaces: Workspace[];
  currentWs: string;
  colorScheme: ColorScheme;
  effort: Effort;
  uiMode: UiMode;
  userName: string;
  creditsUsed: number;
  simConfigs: SimulationConfig[];
  hwConfigs: HardwareConfig[];
  papers: LiteraturePaper[];
  resourceEstimates: ResourceEstimate[];
  teamMembers: TeamMember[];
  comments: JobComment[];
  feedItems: FeedItem[];
  keywordAlerts: KeywordAlert[];
  problemBriefs: ProblemBrief[];
  algorithmSpecs: AlgorithmSpec[];
}

function loadPersisted(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

const persisted = loadPersisted();

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => persisted.jobs ?? INITIAL_JOBS.map((j) => ({ ...j })));
  const [workspaces, setWorkspaces] = useState<Workspace[]>(
    () => persisted.workspaces ?? WORKSPACES.map((w) => ({ ...w, tags: [...w.tags], files: [...w.files] })),
  );
  const [currentWs, setCurrentWs] = useState(persisted.currentWs ?? "log");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(persisted.colorScheme ?? "light");
  const [effort, setEffort] = useState<Effort>(persisted.effort ?? "Standard");
  const [uiMode, setUiMode] = useState<UiMode>(persisted.uiMode ?? "guided");
  const [userName, setUserName] = useState(persisted.userName ?? "Rocher Botha");
  const [creditsUsed, setCreditsUsed] = useState(persisted.creditsUsed ?? 45.7);
  const toggleColorScheme = useCallback(() => setColorScheme((s) => (s === "light" ? "dark" : "light")), []);
  const [simConfigs, setSimConfigs] = useState<SimulationConfig[]>(() => persisted.simConfigs ?? [...SIM_CONFIGS]);
  const [hwConfigs, setHwConfigs] = useState<HardwareConfig[]>(() => persisted.hwConfigs ?? [...HW_CONFIGS]);
  const [papers, setPapers] = useState<LiteraturePaper[]>(() => persisted.papers ?? [...PAPERS]);
  const [resourceEstimates, setResourceEstimates] = useState<ResourceEstimate[]>(() => persisted.resourceEstimates ?? [...RESOURCE_ESTIMATES]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => persisted.teamMembers ?? [...TEAM_MEMBERS]);
  const [comments, setComments] = useState<JobComment[]>(() => persisted.comments ?? [...COMMENTS]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => persisted.feedItems ?? [...FEED_ITEMS]);
  const [keywordAlerts, setKeywordAlerts] = useState<KeywordAlert[]>(() => persisted.keywordAlerts ?? [...KEYWORD_ALERTS]);
  const [problemBriefs, setProblemBriefs] = useState<ProblemBrief[]>(() => persisted.problemBriefs ?? [...PROBLEM_BRIEFS]);
  const [algorithmSpecs, setAlgorithmSpecs] = useState<AlgorithmSpec[]>(() => persisted.algorithmSpecs ?? [...ALGORITHM_SPECS]);
  const [gateInfo, setGateInfo] = useState<Record<string, GateEvent>>({});

  const currentWsRef = useRef(currentWs);
  currentWsRef.current = currentWs;

  // Persist on every change (cheap at this scale; an API layer replaces this).
  useEffect(() => {
    const state: PersistedState = {
      jobs, workspaces, currentWs, colorScheme, effort, uiMode, userName, creditsUsed,
      simConfigs, hwConfigs, papers, resourceEstimates, teamMembers, comments,
      feedItems, keywordAlerts, problemBriefs, algorithmSpecs,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota errors are non-fatal in the prototype
    }
  }, [jobs, workspaces, currentWs, colorScheme, effort, uiMode, userName, creditsUsed,
      simConfigs, hwConfigs, papers, resourceEstimates, teamMembers, comments,
      feedItems, keywordAlerts, problemBriefs, algorithmSpecs]);

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const getJob = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  const createJob = useCallback((title: string, domain?: string): Job => {
    const job: Job = {
      id: newId("j"), title, ws: currentWsRef.current,
      step: 0, status: "running", createdAt: nowIso(), domain,
    };
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  // ── Run engine ──────────────────────────────────────────────────────────────
  // Runs progress at the store level — they keep going whether or not anyone
  // is looking at the run page, exactly like a server-side run will.
  const streamsRef = useRef(new Map<string, MockRunStream>());

  const attachStream = useCallback((job: Job) => {
    if (streamsRef.current.has(job.id)) return;
    const stream = new MockRunStream(job.title, job.step, job.domain ?? "");
    streamsRef.current.set(job.id, stream);
    const id = job.id;
    stream.subscribe((e) => {
      switch (e.type) {
        case "step_start":
          setJobs((prev) => prev.map((j) =>
            j.id === id ? { ...j, step: e.step, status: "running", notes: { ...j.notes, [e.step]: [] } } : j,
          ));
          break;
        case "step_note":
          setJobs((prev) => prev.map((j) =>
            j.id === id
              ? { ...j, notes: { ...j.notes, [e.step]: [...(j.notes?.[e.step] ?? []), e.note] } }
              : j,
          ));
          break;
        case "gate":
          setGateInfo((prev) => ({ ...prev, [id]: e }));
          setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, step: e.step, status: "needs" } : j)));
          break;
        case "report":
          setJobs((prev) => prev.map((j) =>
            j.id === id
              ? { ...j, status: "done", step: STEPS.length, result: e.result, report: e.markdown }
              : j,
          ));
          setCreditsUsed((c) => Math.round((c + 7.5) * 100) / 100);
          stream.dispose();
          streamsRef.current.delete(id);
          break;
        default:
          break;
      }
    });
    stream.start();
  }, []);

  // Any running job without a live stream gets one — this also resumes runs
  // that were mid-flight when the page reloaded.
  useEffect(() => {
    jobs.forEach((j) => {
      if (j.status === "running" && !streamsRef.current.has(j.id)) attachStream(j);
    });
  }, [jobs, attachStream]);

  const resolveGate = useCallback((jobId: string, action: GateAction) => {
    const stream = streamsRef.current.get(jobId);
    if (action === "hold") {
      stream?.dispose();
      streamsRef.current.delete(jobId);
      updateJob(jobId, { status: "queued" });
      return;
    }
    if (stream) {
      stream.resolveGate(action);
    } else {
      // No live stream (e.g. a gate restored from persistence) — advance past
      // the gate and let the watcher attach a fresh stream.
      setJobs((prev) => prev.map((j) =>
        j.id === jobId ? { ...j, step: j.step + 1, status: "running" } : j,
      ));
    }
  }, [updateJob]);

  const startJob = useCallback((jobId: string) => {
    updateJob(jobId, { status: "running" });
  }, [updateJob]);

  const addWorkspace = useCallback((name: string): string => {
    const id = newId("ws");
    const ws: Workspace = { id, name: name.trim() || "Untitled workspace", tags: [], files: [] };
    setWorkspaces((prev) => [...prev, ws]);
    setCurrentWs(id);
    return id;
  }, []);

  const addFileToCurrent = useCallback(() => {
    const samples: [string, string, Workspace["files"][number]["t"]][] = [
      ["notes_meeting.pdf", "Document · 64 KB · just now", "pdf"],
      ["data_export.csv", "Dataset · 320 KB · just now", "csv"],
      ["reference_specs.xlsx", "Spreadsheet · 180 KB · just now", "xls"],
    ];
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== currentWsRef.current) return w;
        const s = samples[w.files.length % samples.length];
        return { ...w, files: [{ n: s[0], m: s[1], t: s[2] }, ...w.files] };
      }),
    );
  }, []);

  // ── Simulation ────────────────────────────────────────────────────────────
  const addSimConfig = useCallback((config: Omit<SimulationConfig, "id" | "created">): SimulationConfig => {
    const full: SimulationConfig = { ...config, id: newId("sim"), created: nowIso() };
    setSimConfigs((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateSimConfig = useCallback((id: string, patch: Partial<SimulationConfig>) => {
    setSimConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  // ── Hardware ──────────────────────────────────────────────────────────────
  const addHwConfig = useCallback((config: Omit<HardwareConfig, "id">): HardwareConfig => {
    const full: HardwareConfig = { ...config, id: newId("hw") };
    setHwConfigs((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateHwConfig = useCallback((id: string, patch: Partial<HardwareConfig>) => {
    setHwConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const approveHwConfig = useCallback((id: string) => {
    setHwConfigs((prev) =>
      prev.map((c) => c.id === id ? { ...c, hitlApproved: true, approvedAt: nowIso(), status: "queued" } : c)
    );
  }, []);

  // ── Literature ────────────────────────────────────────────────────────────
  const addPaper = useCallback((paper: LiteraturePaper) => {
    setPapers((prev) => [paper, ...prev]);
  }, []);

  const toggleBookmark = useCallback((paperId: string) => {
    setPapers((prev) => prev.map((p) => p.id === paperId ? { ...p, bookmarked: !p.bookmarked } : p));
  }, []);

  // ── Resource Estimates ────────────────────────────────────────────────────
  const addResourceEstimate = useCallback((est: Omit<ResourceEstimate, "id" | "created">): ResourceEstimate => {
    const full: ResourceEstimate = { ...est, id: newId("re"), created: nowIso() };
    setResourceEstimates((prev) => [full, ...prev]);
    return full;
  }, []);

  // ── Team ──────────────────────────────────────────────────────────────────
  const addTeamMember = useCallback((m: Omit<TeamMember, "id" | "joinedAt">) => {
    const full: TeamMember = { ...m, id: newId("tm"), joinedAt: nowIso() };
    setTeamMembers((prev) => [...prev, full]);
  }, []);

  const updateMemberAccess = useCallback((id: string, access: AccessLevel) => {
    setTeamMembers((prev) => prev.map((m) => m.id === id ? { ...m, access } : m));
  }, []);

  // ── Comments ──────────────────────────────────────────────────────────────
  const addComment = useCallback((jobId: string, authorName: string, body: string) => {
    const comment: JobComment = {
      id: newId("c"), jobId, authorId: "current-user",
      authorName, body, createdAt: nowIso(),
    };
    setComments((prev) => [...prev, comment]);
  }, []);

  // ── Feed ──────────────────────────────────────────────────────────────────
  const toggleFeedBookmark = useCallback((id: string) => {
    setFeedItems((prev) => prev.map((f) => f.id === id ? { ...f, bookmarked: !f.bookmarked } : f));
  }, []);

  const addKeywordAlert = useCallback((keyword: string) => {
    if (!keyword.trim()) return;
    const alert: KeywordAlert = { id: newId("ka"), keyword: keyword.trim(), active: true, matchCount: 0 };
    setKeywordAlerts((prev) => [...prev, alert]);
  }, []);

  const removeKeywordAlert = useCallback((id: string) => {
    setKeywordAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlertActive = useCallback((id: string) => {
    setKeywordAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  }, []);

  // ── Problem Briefs ────────────────────────────────────────────────────────
  const upsertProblemBrief = useCallback((brief: Omit<ProblemBrief, "id" | "created">): ProblemBrief => {
    const full: ProblemBrief = { ...brief, id: newId("pb"), created: nowIso() };
    setProblemBriefs((prev) => {
      const existing = prev.findIndex((b) => b.jobId === brief.jobId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = full;
        return updated;
      }
      return [full, ...prev];
    });
    return full;
  }, []);

  // ── Algorithm Specs ───────────────────────────────────────────────────────
  const upsertAlgorithmSpec = useCallback((spec: Omit<AlgorithmSpec, "id" | "created">): AlgorithmSpec => {
    const full: AlgorithmSpec = { ...spec, id: newId("as"), created: nowIso() };
    setAlgorithmSpecs((prev) => {
      const existing = prev.findIndex((s) => s.jobId === spec.jobId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = full;
        return updated;
      }
      return [full, ...prev];
    });
    return full;
  }, []);

  const value = useMemo<AppState>(
    () => ({
      jobs, workspaces, currentWs, colorScheme, effort, uiMode, userName, creditsUsed,
      setCurrentWs, toggleColorScheme, setEffort, setUiMode, setUserName,
      addWorkspace, addFileToCurrent, createJob, updateJob, getJob,
      gateInfo, resolveGate, startJob,
      simConfigs, addSimConfig, updateSimConfig,
      hwConfigs, addHwConfig, updateHwConfig, approveHwConfig,
      papers, addPaper, toggleBookmark,
      resourceEstimates, addResourceEstimate,
      teamMembers, addTeamMember, updateMemberAccess,
      comments, addComment,
      feedItems, keywordAlerts, toggleFeedBookmark, addKeywordAlert, removeKeywordAlert, toggleAlertActive,
      problemBriefs, upsertProblemBrief,
      algorithmSpecs, upsertAlgorithmSpec,
    }),
    [
      jobs, workspaces, currentWs, colorScheme, effort, uiMode, userName, creditsUsed,
      addWorkspace, addFileToCurrent, createJob, updateJob, getJob,
      gateInfo, resolveGate, startJob,
      simConfigs, addSimConfig, updateSimConfig,
      hwConfigs, addHwConfig, updateHwConfig, approveHwConfig,
      papers, addPaper, toggleBookmark,
      resourceEstimates, addResourceEstimate,
      teamMembers, addTeamMember, updateMemberAccess,
      comments, addComment,
      feedItems, keywordAlerts, toggleFeedBookmark, addKeywordAlert, removeKeywordAlert, toggleAlertActive,
      problemBriefs, upsertProblemBrief,
      algorithmSpecs, upsertAlgorithmSpec,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useWorkspace(id: string): Workspace | undefined {
  const { workspaces } = useApp();
  return workspaces.find((w) => w.id === id);
}
