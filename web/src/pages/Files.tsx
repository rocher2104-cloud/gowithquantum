import { useState } from "react";
import { Button, Card, makeStyles, tokens } from "@fluentui/react-components";
import {
  ArrowUploadRegular,
  DocumentRegular,
  TableRegular,
  DocumentPdfRegular,
} from "@fluentui/react-icons";
import { useApp } from "../store/AppStore";
import { PageHeader, SectionRow } from "../components/shared/PageHeader";
import type { Workspace } from "../data/models";

type FileType = Workspace["files"][number]["t"];

const FILE_STYLE: Record<FileType, { bg: string; color: string; icon: JSX.Element }> = {
  pdf: { bg: "#FEF2F2", color: "#DC2626", icon: <DocumentPdfRegular fontSize={18} /> },
  csv: { bg: "#F0FDF4", color: "#16A34A", icon: <TableRegular fontSize={18} /> },
  xls: { bg: "#F0FDF4", color: "#15803D", icon: <TableRegular fontSize={18} /> },
  doc: { bg: "#EFF6FF", color: "#2563EB", icon: <DocumentRegular fontSize={18} /> },
};

const useStyles = makeStyles({
  drop: {
    border: `1.5px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    padding: "28px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    cursor: "pointer",
    marginBottom: "16px",
    ":hover": {
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      color: tokens.colorNeutralForeground2,
      background: tokens.colorNeutralBackground2,
    },
  },
  dropTitle: { fontWeight: 600, color: tokens.colorNeutralForeground1, fontSize: "14px", marginBottom: "2px" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    cursor: "pointer",
    ":hover": { background: tokens.colorNeutralBackground2 },
  },
  ic: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  mid: { flex: 1, minWidth: 0 },
  fn: {
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: tokens.colorNeutralForeground1,
  },
  fm: { fontSize: "12px", color: tokens.colorNeutralForeground3, marginTop: "2px" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
    background: tokens.colorNeutralBackground3,
    textAlign: "left" as const,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  td: { padding: "10px 14px", fontSize: "13px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  tdKey: { fontFamily: tokens.fontFamilyMonospace, fontSize: "12px", fontWeight: 500 },
  tag: {
    display: "inline-flex",
    padding: "2px 8px",
    borderRadius: tokens.borderRadiusSmall,
    background: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "12px",
    fontWeight: 600,
    border: "1px solid #BFDBFE",
  },
  tableWrap: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, overflow: "hidden" },
});

function FileRow({ file }: { file: Workspace["files"][number] }) {
  const s = useStyles();
  const [hovered, setHovered] = useState(false);
  const style = FILE_STYLE[file.t] ?? FILE_STYLE.doc;

  return (
    <Card
      className={s.row}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={s.ic} style={{ background: style.bg, color: style.color }}>
        {style.icon}
      </div>
      <div className={s.mid}>
        <div className={s.fn}>{file.n}</div>
        <div className={s.fm}>{file.m}</div>
      </div>
      <Button
        appearance="subtle"
        size="small"
        style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
      >
        •••
      </Button>
    </Card>
  );
}

export function Files() {
  const s = useStyles();
  const { workspaces, currentWs, addFileToCurrent } = useApp();
  const ws = workspaces.find((w) => w.id === currentWs);
  const hasTabular = ws?.files.some((f) => f.t === "csv" || f.t === "xls");

  return (
    <>
      <PageHeader
        title="Files & references"
        sub="The source of truth for this workspace. Anything added here is available as context whenever you run a task."
      />
      <div className={s.drop} onClick={addFileToCurrent}>
        <ArrowUploadRegular fontSize={24} style={{ marginBottom: 9, opacity: 0.5 }} />
        <div className={s.dropTitle}>Add a document or dataset</div>
        <div>Drop a file here, or click to browse</div>
      </div>

      <div className={s.list}>
        {ws?.files.map((f, i) => (
          <FileRow key={i} file={f} />
        ))}
      </div>

      {hasTabular && (
        <>
          <SectionRow title="Data mapping" action={<Button size="small" appearance="subtle">Edit</Button>} />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Column</th>
                  <th className={s.th}>Interpreted as</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Vehicle ID", "Decision variable"],
                  ["Delivery time", "Constraint"],
                  ["Fuel cost", "Objective weight"],
                  ["Depot location", "Routing node"],
                  ["Driver shift length", "Hard constraint"],
                ].map(([col, role]) => (
                  <tr key={col}>
                    <td className={`${s.td} ${s.tdKey}`}>{col}</td>
                    <td className={s.td}><span className={s.tag}>{role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
