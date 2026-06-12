export interface NavItem {
  label: string;
  path: string;
  badge?: "queue";
  kicker?: string; // step number, e.g. "1"
}

export interface NavGroup {
  label?: string; // optional section heading rendered inside the panel
  items: NavItem[];
}

export type RailKey = "workspace" | "platform";

export interface NavSection {
  rail: RailKey;
  groups: NavGroup[];
}

export const NAV: NavSection[] = [
  {
    rail: "workspace",
    groups: [
      {
        items: [
          { label: "Overview", path: "/" },
        ],
      },
      {
        label: "Workflow",
        items: [
          { label: "Problem Intake",      path: "/intake",              kicker: "1" },
          { label: "Literature Review",   path: "/literature",          kicker: "2" },
          { label: "Algorithm Design",    path: "/algorithm",           kicker: "3" },
          { label: "Algorithm Library",   path: "/library" },
          { label: "Simulation",          path: "/simulation",          kicker: "4" },
          { label: "Hardware Execution",  path: "/hardware",            kicker: "5" },
          { label: "Analysis & Debug",    path: "/analysis",            kicker: "6" },
          { label: "Resource Estimation", path: "/resource-estimation", kicker: "7" },
          { label: "Reports",             path: "/reports",             kicker: "8" },
          { label: "Collaboration",       path: "/collaboration",       kicker: "9" },
        ],
      },
      {
        label: "Resources",
        items: [
          { label: "Queue",       path: "/queue",       badge: "queue" },
          { label: "Experiments", path: "/experiments" },
          { label: "Files",       path: "/files" },
          { label: "Outputs",     path: "/outputs" },
        ],
      },
    ],
  },
  {
    rail: "platform",
    groups: [
      {
        items: [
          { label: "Staying Current", path: "/feed",      kicker: "10" },
          { label: "New Task",        path: "/solve" },
          { label: "Providers",       path: "/providers" },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Billing",  path: "/billing" },
          { label: "Settings", path: "/settings" },
        ],
      },
    ],
  },
];

const PLATFORM_PATHS = ["/feed", "/solve", "/providers", "/billing", "/settings"];

export function railForPath(pathname: string): RailKey {
  if (PLATFORM_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return "platform";
  }
  return "workspace";
}

/** Flatten all items from a section (useful for active-state checks). */
export function flatItems(section: NavSection): NavItem[] {
  return section.groups.flatMap((g) => g.items);
}
