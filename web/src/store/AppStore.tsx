import {
  createContext,
  useCallback,
  useContext,
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
} from "../data/mock";

export type ColorScheme = "light" | "dark";
export type Effort = "Quick" | "Standard" | "Exhaustive";

interface AppState {
  // Existing
  jobs: Job[];
  workspaces: Workspace[];
  currentWs: string;
  colorScheme: ColorScheme;
  effort: Effort;
  setCurrentWs: (id: string) => void;
  toggleColorScheme: () => void;
  setEffort: (e: Effort) => void;
  addWorkspace: (name: string) => string;
  addFileToCurrent: () => void;
  createJob: (title: string) => Job;
  updateJob: (id: number, patch: Partial<Job>) => void;
  getJob: (id: number) => Job | undefined;
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
  addComment: (jobId: number, authorName: string, body: string) => void;
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

let jobSeq = 100;
let simSeq = 200;
let hwSeq = 300;
let reSeq = 400;
let tmSeq = 500;
let cmtSeq = 600;
let fiSeq = 700;
let kaSeq = 800;
let pbSeq = 900;
let asSeq = 1000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => INITIAL_JOBS.map((j) => ({ ...j })));
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
    WORKSPACES.map((w) => ({ ...w, tags: [...w.tags], files: [...w.files] })),
  );
  const [currentWs, setCurrentWs] = useState("log");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [effort, setEffort] = useState<Effort>("Standard");
  const toggleColorScheme = useCallback(() => setColorScheme((s) => (s === "light" ? "dark" : "light")), []);
  const [simConfigs, setSimConfigs] = useState<SimulationConfig[]>(() => [...SIM_CONFIGS]);
  const [hwConfigs, setHwConfigs] = useState<HardwareConfig[]>(() => [...HW_CONFIGS]);
  const [papers, setPapers] = useState<LiteraturePaper[]>(() => [...PAPERS]);
  const [resourceEstimates, setResourceEstimates] = useState<ResourceEstimate[]>(() => [...RESOURCE_ESTIMATES]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => [...TEAM_MEMBERS]);
  const [comments, setComments] = useState<JobComment[]>(() => [...COMMENTS]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => [...FEED_ITEMS]);
  const [keywordAlerts, setKeywordAlerts] = useState<KeywordAlert[]>(() => [...KEYWORD_ALERTS]);
  const [problemBriefs, setProblemBriefs] = useState<ProblemBrief[]>(() => [...PROBLEM_BRIEFS]);
  const [algorithmSpecs, setAlgorithmSpecs] = useState<AlgorithmSpec[]>(() => [...ALGORITHM_SPECS]);

  const currentWsRef = useRef(currentWs);
  currentWsRef.current = currentWs;

  // ── Existing methods ─────────────────────────────────────────────────────
  const updateJob = useCallback((id: number, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const getJob = useCallback((id: number) => jobs.find((j) => j.id === id), [jobs]);

  const createJob = useCallback((title: string): Job => {
    const job: Job = { id: jobSeq++, title, ws: currentWsRef.current, step: 0, status: "running", created: "just now" };
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  const addWorkspace = useCallback((name: string): string => {
    const id = "ws" + Math.floor(performance.now());
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
    const full: SimulationConfig = { ...config, id: `sim-${simSeq++}`, created: "just now" };
    setSimConfigs((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateSimConfig = useCallback((id: string, patch: Partial<SimulationConfig>) => {
    setSimConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  // ── Hardware ──────────────────────────────────────────────────────────────
  const addHwConfig = useCallback((config: Omit<HardwareConfig, "id">): HardwareConfig => {
    const full: HardwareConfig = { ...config, id: `hw-${hwSeq++}` };
    setHwConfigs((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateHwConfig = useCallback((id: string, patch: Partial<HardwareConfig>) => {
    setHwConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const approveHwConfig = useCallback((id: string) => {
    setHwConfigs((prev) =>
      prev.map((c) => c.id === id ? { ...c, hitlApproved: true, approvedAt: "just now", status: "queued" } : c)
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
    const full: ResourceEstimate = { ...est, id: `re-${reSeq++}`, created: "just now" };
    setResourceEstimates((prev) => [full, ...prev]);
    return full;
  }, []);

  // ── Team ──────────────────────────────────────────────────────────────────
  const addTeamMember = useCallback((m: Omit<TeamMember, "id" | "joinedAt">) => {
    const full: TeamMember = { ...m, id: `tm-${tmSeq++}`, joinedAt: "just now" };
    setTeamMembers((prev) => [...prev, full]);
  }, []);

  const updateMemberAccess = useCallback((id: string, access: AccessLevel) => {
    setTeamMembers((prev) => prev.map((m) => m.id === id ? { ...m, access } : m));
  }, []);

  // ── Comments ──────────────────────────────────────────────────────────────
  const addComment = useCallback((jobId: number, authorName: string, body: string) => {
    const comment: JobComment = {
      id: `c-${cmtSeq++}`, jobId, authorId: "current-user",
      authorName, body, createdAt: "just now",
    };
    setComments((prev) => [...prev, comment]);
  }, []);

  // ── Feed ──────────────────────────────────────────────────────────────────
  const toggleFeedBookmark = useCallback((id: string) => {
    setFeedItems((prev) => prev.map((f) => f.id === id ? { ...f, bookmarked: !f.bookmarked } : f));
  }, []);

  const addKeywordAlert = useCallback((keyword: string) => {
    if (!keyword.trim()) return;
    const alert: KeywordAlert = { id: `ka-${kaSeq++}`, keyword: keyword.trim(), active: true, matchCount: 0 };
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
    const full: ProblemBrief = { ...brief, id: `pb-${pbSeq++}`, created: "just now" };
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
    const full: AlgorithmSpec = { ...spec, id: `as-${asSeq++}`, created: "just now" };
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
      jobs, workspaces, currentWs, colorScheme, effort,
      setCurrentWs, toggleColorScheme, setEffort,
      addWorkspace, addFileToCurrent, createJob, updateJob, getJob,
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
      jobs, workspaces, currentWs, colorScheme, effort,
      addWorkspace, addFileToCurrent, createJob, updateJob, getJob,
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
