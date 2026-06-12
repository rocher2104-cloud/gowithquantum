import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Checkbox,
  Drawer, DrawerBody, DrawerHeader, DrawerHeaderTitle,
  Field, Input, Slider, SpinButton, Switch,
  Text, Toolbar, ToolbarButton, ToolbarDivider,
  makeStyles, tokens,
} from "@fluentui/react-components";
import {
  SearchRegular, BookmarkRegular, BookmarkFilled,
  GridRegular, ListRegular, DismissRegular,
} from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { CitationGraph } from "../components/workflow/CitationGraph";
import { useApp } from "../store/AppStore";
import type { LiteraturePaper } from "../data/models";
import { accents } from "../theme/brand";

const ALGORITHM_FAMILIES = ["QAOA", "VQE", "HHL", "Grover", "Annealing"];

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "20px",
    alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr" },
  },
  sidebar: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontWeight: 600,
    fontSize: "13px",
  },
  accordionPanel: { padding: "4px 16px 16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  table: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  thead: {
    background: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  th: {
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: tokens.colorNeutralForeground3,
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    ":last-child": { borderBottom: "none" },
    ":hover": { background: tokens.colorNeutralBackground3 },
    cursor: "pointer",
  },
  td: { padding: "10px 12px", fontSize: "13px", verticalAlign: "top" },
  titleCell: { maxWidth: "260px" },
  titleText: {
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    fontSize: "12px",
  },
  alertRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    ":last-child": { borderBottom: "none" },
  },
  alertKeyword: { flex: 1, fontSize: "13px" },
  synthCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "16px",
    background: tokens.colorNeutralBackground1,
  },
  drawerContent: { padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
});

export function LiteratureReview() {
  const s = useStyles();
  const { papers, toggleBookmark, addKeywordAlert, removeKeywordAlert, keywordAlerts, toggleAlertActive } = useApp();
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [search, setSearch] = useState("");
  const [yearFrom, setYearFrom] = useState(2009);
  const [yearTo, setYearTo] = useState(2026);
  const [citationDepth, setCitationDepth] = useState(3);
  const [theoryOnly, setTheoryOnly] = useState(false);
  const [hwOnly, setHwOnly] = useState(false);
  const [familyFilter, setFamilyFilter] = useState<string[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<LiteraturePaper | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [synthesisGenerated, setSynthesisGenerated] = useState(false);

  const filtered = papers.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.algorithmFamily.toLowerCase().includes(search.toLowerCase())) return false;
    if (p.year < yearFrom || p.year > yearTo) return false;
    if (theoryOnly && !p.isTheoretical) return false;
    if (hwOnly && p.isTheoretical) return false;
    if (familyFilter.length > 0 && !familyFilter.includes(p.algorithmFamily)) return false;
    return true;
  });

  const toggleFamily = (fam: string) => {
    setFamilyFilter((prev) =>
      prev.includes(fam) ? prev.filter((f) => f !== fam) : [...prev, fam]
    );
  };

  return (
    <>
      <PageHeader
        kicker="Step 2 · Research"
        title="Literature Review & Prior Art"
        sub="Search the quantum algorithm literature, map citations, and extract resource requirements from published results."
      />

      <div className={s.layout}>
        {/* Left sidebar */}
        <div className={s.sidebar}>
          <div className={s.sidebarHeader}>Filters & Alerts</div>
          <Accordion multiple collapsible defaultOpenItems={["search", "filters", "alerts"]}>
            <AccordionItem value="search">
              <AccordionHeader size="small">Keyword Search</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <Field label="Search papers">
                    <Input
                      contentBefore={<SearchRegular />}
                      placeholder="QAOA, optimization, routing..."
                      value={search}
                      onChange={(_, d) => setSearch(d.value)}
                    />
                  </Field>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="filters">
              <AccordionHeader size="small">Filters</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div className={s.fieldGroup}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <Field label="Year from">
                        <SpinButton value={yearFrom} min={2000} max={yearTo}
                          onChange={(_, d) => setYearFrom(d.value ?? yearFrom)} />
                      </Field>
                      <Field label="Year to">
                        <SpinButton value={yearTo} min={yearFrom} max={2026}
                          onChange={(_, d) => setYearTo(d.value ?? yearTo)} />
                      </Field>
                    </div>

                    <Field label={`Citation depth: ${citationDepth}`}>
                      <Slider min={1} max={5} step={1} value={citationDepth}
                        onChange={(_, d) => setCitationDepth(d.value)} />
                    </Field>

                    <Field label="Type">
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Switch label="Theoretical only" checked={theoryOnly} onChange={(_, d) => { setTheoryOnly(d.checked); if (d.checked) setHwOnly(false); }} />
                        <Switch label="Hardware-demonstrated only" checked={hwOnly} onChange={(_, d) => { setHwOnly(d.checked); if (d.checked) setTheoryOnly(false); }} />
                      </div>
                    </Field>

                    <Field label="Algorithm family">
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {ALGORITHM_FAMILIES.map((fam) => (
                          <Checkbox key={fam} label={fam} checked={familyFilter.includes(fam)}
                            onChange={() => toggleFamily(fam)} />
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="alerts">
              <AccordionHeader size="small">Keyword Alerts</AccordionHeader>
              <AccordionPanel>
                <div className={s.accordionPanel}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <Input size="small" placeholder="Add keyword..." value={newKeyword}
                      onChange={(_, d) => setNewKeyword(d.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { addKeywordAlert(newKeyword); setNewKeyword(""); } }}
                      style={{ flex: 1 }} />
                    <Button size="small" appearance="primary"
                      onClick={() => { addKeywordAlert(newKeyword); setNewKeyword(""); }}>
                      Add
                    </Button>
                  </div>
                  {keywordAlerts.map((alert) => (
                    <div key={alert.id} className={s.alertRow}>
                      <Switch checked={alert.active} onChange={() => toggleAlertActive(alert.id)} />
                      <Text className={s.alertKeyword} size={200}>{alert.keyword}</Text>
                      {alert.matchCount > 0 && (
                        <Badge appearance="tint" size="small" color="brand">{alert.matchCount}</Badge>
                      )}
                      <Button size="small" appearance="subtle" icon={<DismissRegular fontSize={12} />}
                        onClick={() => removeKeywordAlert(alert.id)} />
                    </div>
                  ))}
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Main content */}
        <div className={s.main}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
              {filtered.length} paper{filtered.length !== 1 ? "s" : ""} matching filters
            </Text>
            <Toolbar>
              <ToolbarButton icon={<ListRegular />} appearance={viewMode === "list" ? "primary" : "subtle"}
                onClick={() => setViewMode("list")}>List</ToolbarButton>
              <ToolbarButton icon={<GridRegular />} appearance={viewMode === "graph" ? "primary" : "subtle"}
                onClick={() => setViewMode("graph")}>Graph</ToolbarButton>
              <ToolbarDivider />
              <Button appearance="primary" size="small" onClick={() => setSynthesisGenerated(true)}>
                Generate Synthesis
              </Button>
            </Toolbar>
          </div>

          {/* Synthesis result */}
          {synthesisGenerated && (
            <div className={s.synthCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text weight="semibold">Literature Synthesis</Text>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="small" appearance="secondary">Download .md</Button>
                  <Button size="small" appearance="subtle" icon={<DismissRegular />} onClick={() => setSynthesisGenerated(false)} />
                </div>
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2, lineHeight: 1.7 }}>
                The current literature establishes QAOA (Farhi et al., 2014) as the leading NISQ-era approach for combinatorial optimization, with hardware demonstrations up to 127 qubits (Kim et al., 2023). VQE remains the benchmark for quantum chemistry. HHL provides exponential speedup for sparse linear systems but requires fault-tolerant hardware with ~40 logical qubits. The primary barrier across all families is the barren plateau problem in variational circuits beyond ~50 qubits.
              </Text>
            </div>
          )}

          {/* List view */}
          {viewMode === "list" && (
            <div className={s.table}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className={s.thead}>
                    <th className={s.th}>Title</th>
                    <th className={s.th}>Year</th>
                    <th className={s.th}>Algorithm</th>
                    <th className={s.th}>Type</th>
                    <th className={s.th}>Qubits</th>
                    <th className={s.th}>Citations</th>
                    <th className={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((paper) => (
                    <tr key={paper.id} className={s.tr} onClick={() => setSelectedPaper(paper)}>
                      <td className={`${s.td} ${s.titleCell}`}>
                        <div className={s.titleText}>{paper.title}</div>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                          {paper.authors.slice(0, 2).join(", ")}{paper.authors.length > 2 ? " et al." : ""}
                        </Text>
                      </td>
                      <td className={s.td}>
                        <Text style={{ fontFamily: tokens.fontFamilyMonospace, fontSize: 12 }}>{paper.year}</Text>
                      </td>
                      <td className={s.td}>
                        <Badge appearance="tint" color="brand" size="small">{paper.algorithmFamily}</Badge>
                      </td>
                      <td className={s.td}>
                        <Badge appearance="tint" color={paper.isTheoretical ? "informative" : "success"} size="small">
                          {paper.isTheoretical ? "Theory" : "Hardware"}
                        </Badge>
                      </td>
                      <td className={s.td}>
                        <Text style={{ fontFamily: tokens.fontFamilyMonospace, fontSize: 12 }}>
                          {paper.qubitRequirement ?? "—"}
                        </Text>
                      </td>
                      <td className={s.td}>
                        <Text style={{ fontFamily: tokens.fontFamilyMonospace, fontSize: 12 }}>
                          {paper.citationCount.toLocaleString()}
                        </Text>
                      </td>
                      <td className={s.td}>
                        <Button size="small" appearance="subtle"
                          icon={paper.bookmarked ? <BookmarkFilled style={{ color: accents.quantum }} /> : <BookmarkRegular />}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(paper.id); }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Graph view */}
          {viewMode === "graph" && (
            <div className={s.table} style={{ padding: 16 }}>
              <CitationGraph papers={filtered} onSelect={setSelectedPaper} />
            </div>
          )}
        </div>
      </div>

      {/* Paper detail drawer */}
      <Drawer
        open={!!selectedPaper}
        onOpenChange={(_, d) => { if (!d.open) setSelectedPaper(null); }}
        position="end"
        size="medium"
      >
        <DrawerHeader>
          <DrawerHeaderTitle action={
            <Button appearance="subtle" icon={<DismissRegular />} onClick={() => setSelectedPaper(null)} />
          }>
            Paper Detail
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selectedPaper && (
            <div className={s.drawerContent}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge appearance="tint" color="brand">{selectedPaper.algorithmFamily}</Badge>
                <Badge appearance="tint" color={selectedPaper.isTheoretical ? "informative" : "success"}>
                  {selectedPaper.isTheoretical ? "Theoretical" : "Hardware-demonstrated"}
                </Badge>
              </div>

              <Text weight="semibold" size={400} style={{ lineHeight: 1.4 }}>{selectedPaper.title}</Text>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {selectedPaper.authors.join(", ")} · {selectedPaper.year} · arXiv:{selectedPaper.arxivId}
              </Text>

              <div style={{ background: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusMedium, padding: "12px 14px" }}>
                <Text size={200} style={{ lineHeight: 1.7 }}>{selectedPaper.abstract}</Text>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["Citations", selectedPaper.citationCount.toLocaleString()],
                  ["Qubits required", selectedPaper.qubitRequirement?.toString() ?? "—"],
                  ["Gate depth", selectedPaper.gateDepth?.toString() ?? "—"],
                  ["Error rate assumed", selectedPaper.errorRateAssumed ? `${(selectedPaper.errorRateAssumed * 100).toFixed(2)}%` : "—"],
                ].map(([key, val]) => (
                  <div key={key} style={{ padding: "10px 12px", border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium }}>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>{key}</Text>
                    <Text weight="semibold" style={{ fontFamily: tokens.fontFamilyMonospace }}>{val}</Text>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button appearance="primary"
                  icon={selectedPaper.bookmarked ? <BookmarkFilled /> : <BookmarkRegular />}
                  onClick={() => toggleBookmark(selectedPaper.id)}>
                  {selectedPaper.bookmarked ? "Bookmarked" : "Bookmark to workspace"}
                </Button>
              </div>

              {selectedPaper.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selectedPaper.tags.map((tag) => (
                    <Badge key={tag} appearance="outline" size="small">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DrawerBody>
      </Drawer>
    </>
  );
}
