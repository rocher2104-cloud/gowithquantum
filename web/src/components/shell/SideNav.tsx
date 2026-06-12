import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  makeStyles,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  mergeClasses,
  tokens,
  Tooltip,
} from "@fluentui/react-components";
import {
  FlashRegular,
  WeatherSunnyRegular,
  WeatherMoonRegular,
  AddRegular,
} from "@fluentui/react-icons";
import { NAV, railForPath, type RailKey } from "./nav";
import { useApp } from "../../store/AppStore";
import { KetLogo } from "./KetLogo";
import { NewWorkspaceDialog } from "./NewWorkspaceDialog";

const RAIL_W = 56;
const PANEL_W = 220;

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100%",
    flexShrink: 0,
    "@media (max-width: 768px)": { display: "none" },
  },

  // ── Rail ──────────────────────────────────────────────────────────────────
  rail: {
    width: `${RAIL_W}px`,
    background: tokens.colorNeutralBackground2,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: tokens.colorNeutralStroke2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "12px",
    paddingBottom: "12px",
    gap: "4px",
    flexShrink: 0,
    overflowY: "auto",
  },
  logoWrap: {
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  railDivider: {
    width: "28px",
    height: "1px",
    background: tokens.colorNeutralStroke2,
    margin: "4px 0",
    flexShrink: 0,
  },
  railSpacer: { flex: 1 },

  // Workspace initials button
  wsBtn: {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusMedium,
    borderTopWidth: "1px",
    borderRightWidth: "1px",
    borderBottomWidth: "1px",
    borderLeftWidth: "1px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: tokens.fontFamilyBase,
    letterSpacing: "0.03em",
    flexShrink: 0,
    transition: "background 0.12s, color 0.12s",
    ":hover": {
      background: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },
  wsBtnActive: {
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderTopColor: tokens.colorBrandBackground,
    borderRightColor: tokens.colorBrandBackground,
    borderBottomColor: tokens.colorBrandBackground,
    borderLeftColor: tokens.colorBrandBackground,
    ":hover": {
      background: tokens.colorBrandBackgroundHover,
      color: tokens.colorNeutralForegroundOnBrand,
    },
  },

  // Add-workspace dashed button
  addBtn: {
    width: "28px",
    height: "28px",
    borderRadius: tokens.borderRadiusMedium,
    borderTopWidth: "1.5px",
    borderRightWidth: "1.5px",
    borderBottomWidth: "1.5px",
    borderLeftWidth: "1.5px",
    borderTopStyle: "dashed",
    borderRightStyle: "dashed",
    borderBottomStyle: "dashed",
    borderLeftStyle: "dashed",
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    background: "transparent",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "color 0.12s",
    ":hover": {
      color: tokens.colorNeutralForeground1,
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
    },
  },

  // Generic icon button (Platform, theme toggle)
  railIconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: tokens.borderRadiusMedium,
    border: "0",
    background: "transparent",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "background 0.12s, color 0.12s",
    ":hover": {
      background: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },
  },
  railIconBtnActive: {
    background: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    ":hover": {
      background: tokens.colorBrandBackground2Hover,
    },
  },

  // ── Panel ─────────────────────────────────────────────────────────────────
  panel: {
    width: `${PANEL_W}px`,
    background: tokens.colorNeutralBackground1,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: tokens.colorNeutralStroke2,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    flexShrink: 0,
  },
  panelHead: {
    padding: "16px 14px 10px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  panelItems: {
    display: "flex",
    flexDirection: "column",
    padding: "0 8px 16px",
  },

  // Group divider + label
  groupDivider: {
    height: "1px",
    background: tokens.colorNeutralStroke2,
    margin: "8px 2px 6px",
  },
  groupLabel: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground4,
    padding: "2px 10px 4px",
  },

  // Nav item
  item: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "7px 10px",
    borderRadius: tokens.borderRadiusMedium,
    border: "0",
    background: "transparent",
    color: tokens.colorNeutralForeground2,
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: tokens.fontFamilyBase,
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.1s, color 0.1s",
    ":hover": {
      background: tokens.colorNeutralBackground2,
      color: tokens.colorNeutralForeground1,
    },
  },
  itemActive: {
    background: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: 600,
    ":hover": {
      background: tokens.colorBrandBackground2Hover,
    },
  },

  // Step kicker badge
  kicker: {
    fontSize: "10px",
    fontWeight: 700,
    color: tokens.colorNeutralForeground4,
    background: tokens.colorNeutralBackground3,
    borderRadius: "4px",
    padding: "1px 5px",
    flexShrink: 0,
    fontFamily: tokens.fontFamilyBase,
    lineHeight: "16px",
    minWidth: "16px",
    textAlign: "center",
  },
  kickerActive: {
    color: tokens.colorBrandForeground1,
    background: tokens.colorBrandBackground2,
  },
  itemBadge: { marginLeft: "auto" },
});

function wsInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function SideNav() {
  const s = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { jobs, workspaces, currentWs, setCurrentWs, toggleColorScheme, colorScheme } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Which panel section to display — follows the current path but can be
  // overridden by clicking a rail button without forcing a page navigation.
  const [panelRail, setPanelRail] = useState<RailKey>(railForPath(pathname));
  useEffect(() => {
    setPanelRail(railForPath(pathname));
  }, [pathname]);

  const section = NAV.find((n) => n.rail === panelRail) ?? NAV[0];
  const wsName = workspaces.find((w) => w.id === currentWs)?.name ?? "Workspace";
  const needsCount = jobs.filter((j) => j.status === "needs").length;

  return (
    <nav className={s.root} aria-label="Primary">
      {/* ── Rail ─────────────────────────────────────────── */}
      <div className={s.rail}>
        <div className={s.logoWrap}>
          <KetLogo size={36} />
        </div>

        <div className={s.railDivider} />

        {/* One button per workspace */}
        {workspaces.map((ws) => (
          <Tooltip key={ws.id} content={ws.name} relationship="label" positioning="after">
            <button
              className={mergeClasses(
                s.wsBtn,
                panelRail === "workspace" && currentWs === ws.id && s.wsBtnActive,
              )}
              onClick={() => {
                setCurrentWs(ws.id);
                setPanelRail("workspace");
              }}
            >
              {wsInitials(ws.name)}
            </button>
          </Tooltip>
        ))}

        <Tooltip content="New workspace" relationship="label" positioning="after">
          <button className={s.addBtn} onClick={() => setDialogOpen(true)}>
            <AddRegular fontSize={14} />
          </button>
        </Tooltip>

        <div className={s.railDivider} />

        {/* Platform — switches the panel only, no forced navigation */}
        <Tooltip content="Platform" relationship="label" positioning="after">
          <button
            className={mergeClasses(
              s.railIconBtn,
              panelRail === "platform" && s.railIconBtnActive,
            )}
            onClick={() => setPanelRail("platform")}
          >
            <FlashRegular fontSize={18} />
          </button>
        </Tooltip>

        <div className={s.railSpacer} />

        {/* Light / dark toggle */}
        <Tooltip
          content={colorScheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          relationship="label"
          positioning="after"
        >
          <button className={s.railIconBtn} onClick={toggleColorScheme}>
            {colorScheme === "light" ? (
              <WeatherMoonRegular fontSize={18} />
            ) : (
              <WeatherSunnyRegular fontSize={18} />
            )}
          </button>
        </Tooltip>

        {/* User menu */}
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Avatar
              name="Rocher Botha"
              size={32}
              color="brand"
              style={{ cursor: "pointer", marginTop: "4px" }}
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={() => navigate("/settings")}>Profile</MenuItem>
              <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
              <MenuItem onClick={() => navigate("/billing")}>Billing</MenuItem>
              <MenuDivider />
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      {/* ── Panel ────────────────────────────────────────── */}
      <div className={s.panel}>
        <div className={s.panelHead}>
          {panelRail === "workspace" ? wsName : "Platform"}
        </div>
        <div className={s.panelItems}>
          {section.groups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className={s.groupDivider} />}
              {group.label && <div className={s.groupLabel}>{group.label}</div>}
              {group.items.map((item) => {
                const active =
                  pathname === item.path ||
                  (item.path !== "/" && pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    className={mergeClasses(s.item, active && s.itemActive)}
                    onClick={() => navigate(item.path)}
                  >
                    {item.kicker && (
                      <span className={mergeClasses(s.kicker, active && s.kickerActive)}>
                        {item.kicker}
                      </span>
                    )}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge === "queue" && needsCount > 0 && (
                      <Badge
                        className={s.itemBadge}
                        appearance="filled"
                        color="danger"
                        size="small"
                      >
                        {needsCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <NewWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </nav>
  );
}
