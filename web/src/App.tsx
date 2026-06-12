import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { GridRegular, AddRegular, FlashRegular } from "@fluentui/react-icons";
import { SideNav } from "./components/shell/SideNav";
import { Dashboard } from "./pages/Dashboard";
import { NewTask } from "./pages/NewTask";
import { Queue } from "./pages/Queue";
import { Files } from "./pages/Files";
import { Experiments } from "./pages/Experiments";
import { Outputs } from "./pages/Outputs";
import { RunDetail } from "./pages/RunDetail";
import { Library } from "./pages/Library";
import { Providers } from "./pages/Providers";
import { Billing } from "./pages/Billing";
import { Settings } from "./pages/Settings";
import { ProblemIntake } from "./pages/ProblemIntake";
import { LiteratureReview } from "./pages/LiteratureReview";
import { AlgorithmDesign } from "./pages/AlgorithmDesign";
import { ClassicalSimulation } from "./pages/ClassicalSimulation";
import { HardwareExecution } from "./pages/HardwareExecution";
import { AnalysisDebug } from "./pages/AnalysisDebug";
import { ResourceEstimation } from "./pages/ResourceEstimation";
import { Reports } from "./pages/Reports";
import { Collaboration } from "./pages/Collaboration";
import { StayingCurrent } from "./pages/StayingCurrent";

const useStyles = makeStyles({
  shell: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    background: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    background: tokens.colorNeutralBackground2,
    minWidth: 0,
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px 80px",
    "@media (max-width: 768px)": { padding: "20px 16px 80px" },
  },
  mobileNav: {
    display: "none",
    "@media (max-width: 768px)": {
      display: "flex",
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "60px",
      background: tokens.colorNeutralBackground1,
      borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
      zIndex: 100,
    },
  },
  mobileTab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    border: 0,
    background: "transparent",
    color: tokens.colorNeutralForeground3,
    fontSize: "10px",
    fontFamily: tokens.fontFamilyBase,
    cursor: "pointer",
    ":hover": { color: tokens.colorNeutralForeground1 },
  },
  mobileTabActive: { color: tokens.colorBrandForeground1 },
});

function MobileNav() {
  const s = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = [
    { icon: <GridRegular fontSize={20} />, label: "Home", path: "/" },
    { icon: <AddRegular fontSize={20} />, label: "New", path: "/solve" },
    { icon: <FlashRegular fontSize={20} />, label: "Queue", path: "/queue" },
  ];
  return (
    <div className={s.mobileNav}>
      {tabs.map((t) => (
        <button
          key={t.path}
          className={`${s.mobileTab} ${pathname === t.path ? s.mobileTabActive : ""}`}
          onClick={() => navigate(t.path)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export function App() {
  const s = useStyles();
  return (
    <div className={s.shell}>
      <SideNav />
      <main className={`${s.content} gwq-canvas`}>
        <div className={s.inner}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/solve" element={<NewTask />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/files" element={<Files />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/outputs" element={<Outputs />} />
            <Route path="/run/:id" element={<RunDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/intake" element={<ProblemIntake />} />
            <Route path="/literature" element={<LiteratureReview />} />
            <Route path="/algorithm" element={<AlgorithmDesign />} />
            <Route path="/simulation" element={<ClassicalSimulation />} />
            <Route path="/hardware" element={<HardwareExecution />} />
            <Route path="/analysis" element={<AnalysisDebug />} />
            <Route path="/resource-estimation" element={<ResourceEstimation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/feed" element={<StayingCurrent />} />
          </Routes>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
