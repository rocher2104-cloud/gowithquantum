import { useState } from "react";
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel,
  Badge, Button, Checkbox, Field, Input, Switch, Text,
  makeStyles, tokens,
} from "@fluentui/react-components";
import { BookmarkRegular, BookmarkFilled, OpenRegular, DismissRegular } from "@fluentui/react-icons";
import { PageHeader } from "../components/shared/PageHeader";
import { useApp } from "../store/AppStore";
import { FEED_ITEMS, KEYWORD_ALERTS } from "../data/mock";
import { accents } from "../theme/brand";
import type { FeedItemType } from "../data/models";

const SOURCE_COLOR: Record<FeedItemType, "brand" | "informative" | "warning"> = {
  arxiv: "brand",
  "hardware-announcement": "informative",
  alert: "warning",
};

const SOURCE_LABEL: Record<FeedItemType, string> = {
  arxiv: "arXiv",
  "hardware-announcement": "Hardware",
  alert: "Alert",
};

const useStyles = makeStyles({
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
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
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  digestCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  digestHeader: {
    padding: "10px 16px",
    background: tokens.colorBrandBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  digestItem: {
    padding: "8px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    cursor: "pointer",
    ":hover": { background: tokens.colorNeutralBackground2 },
  },
  feedCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  cardActions: {
    display: "flex",
    gap: "6px",
    marginTop: "4px",
  },
  tagRow: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
  },
  alertRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});

export function StayingCurrent() {
  const s = useStyles();
  const { addKeywordAlert, removeKeywordAlert, toggleAlertActive, toggleFeedBookmark, feedItems } = useApp();
  const [localAlerts, setLocalAlerts] = useState(KEYWORD_ALERTS);
  const [localFeed, setLocalFeed] = useState(feedItems.length ? feedItems : FEED_ITEMS);
  const [newKeyword, setNewKeyword] = useState("");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [sourceFilters, setSourceFilters] = useState<Record<FeedItemType, boolean>>({
    arxiv: true,
    "hardware-announcement": true,
    alert: true,
  });
  const [visibleCount, setVisibleCount] = useState(5);

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    addKeywordAlert(newKeyword.trim());
    setLocalAlerts((prev) => [...prev, {
      id: `ka-local-${Date.now()}`,
      keyword: newKeyword.trim(),
      active: true,
      matchCount: 0,
    }]);
    setNewKeyword("");
  };

  const handleRemoveAlert = (id: string) => {
    removeKeywordAlert(id);
    setLocalAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    toggleAlertActive(id);
    setLocalAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleBookmark = (itemId: string) => {
    toggleFeedBookmark(itemId);
    setLocalFeed((prev) => prev.map((f) => f.id === itemId ? { ...f, bookmarked: !f.bookmarked } : f));
  };

  const filteredFeed = localFeed.filter((f) => {
    if (!sourceFilters[f.type]) return false;
    if (showOnlyNew && !f.isNew) return false;
    return true;
  });

  const digestItems = localFeed.filter((f) => f.type === "arxiv").slice(0, 3);

  return (
    <>
      <PageHeader
        kicker="Step 10 · Platform"
        title="Staying Current"
        sub="Track the latest arXiv papers, hardware announcements, and keyword alerts to keep your research in sync with the state of the art."
      />

      <div className={s.layout}>
        {/* Left: Sidebar */}
        <div className={s.sidebar}>
          <Accordion multiple collapsible defaultOpenItems={["alerts", "filters"]}>
            <AccordionItem value="alerts">
              <AccordionHeader size="small">
                <Text size={200} weight="semibold">Keyword Alerts</Text>
              </AccordionHeader>
              <AccordionPanel>
                <div style={{ paddingBottom: 8 }}>
                  {localAlerts.map((alert) => (
                    <div key={alert.id} className={s.alertRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                        <Switch
                          checked={alert.active}
                          onChange={() => handleToggleAlert(alert.id)}
                          style={{ flexShrink: 0 }}
                        />
                        <Text size={200} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {alert.keyword}
                        </Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {alert.matchCount > 0 && (
                          <Badge appearance="tint" color="brand" size="small">{alert.matchCount}</Badge>
                        )}
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<DismissRegular />}
                          onClick={() => handleRemoveAlert(alert.id)}
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ padding: "10px 14px", display: "flex", gap: 6 }}>
                    <Field style={{ flex: 1 }}>
                      <Input
                        size="small"
                        placeholder="Add keyword..."
                        value={newKeyword}
                        onChange={(_, d) => setNewKeyword(d.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                      />
                    </Field>
                    <Button size="small" appearance="primary" onClick={handleAddKeyword}>Add</Button>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="filters">
              <AccordionHeader size="small">
                <Text size={200} weight="semibold">Feed Filters</Text>
              </AccordionHeader>
              <AccordionPanel>
                <div style={{ padding: "6px 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <Checkbox
                    label="arXiv papers"
                    checked={sourceFilters.arxiv}
                    onChange={(_, d) => setSourceFilters((prev) => ({ ...prev, arxiv: !!d.checked }))}
                  />
                  <Checkbox
                    label="Hardware announcements"
                    checked={sourceFilters["hardware-announcement"]}
                    onChange={(_, d) => setSourceFilters((prev) => ({ ...prev, "hardware-announcement": !!d.checked }))}
                  />
                  <Checkbox
                    label="Alert matches"
                    checked={sourceFilters.alert}
                    onChange={(_, d) => setSourceFilters((prev) => ({ ...prev, alert: !!d.checked }))}
                  />
                  <Switch
                    label="New items only"
                    checked={showOnlyNew}
                    onChange={(_, d) => setShowOnlyNew(d.checked)}
                  />
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right: Feed */}
        <div className={s.feed}>
          {/* Today's digest */}
          <div className={s.digestCard}>
            <div className={s.digestHeader}>
              <Badge appearance="tint" color="brand" size="small">arXiv</Badge>
              <Text size={200} weight="semibold">Today's quant-ph digest</Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginLeft: "auto" }}>
                {digestItems.length} new papers
              </Text>
            </div>
            <div>
              {digestItems.map((item) => (
                <div key={item.id} className={s.digestItem}>
                  <div style={{ flex: 1 }}>
                    <Text size={200} weight="semibold">{item.title}</Text>
                    <Text size={100} style={{ display: "block", color: tokens.colorNeutralForeground3, marginTop: 2 }}>
                      {item.source} · {item.publishedAt}
                    </Text>
                  </div>
                  {item.isNew && <Badge appearance="tint" color="success" size="small">New</Badge>}
                </div>
              ))}
            </div>
          </div>

          {/* Feed cards */}
          {filteredFeed.slice(0, visibleCount).map((item) => (
            <div key={item.id} className={s.feedCard}>
              <div className={s.cardTop}>
                <Badge appearance="tint" color={SOURCE_COLOR[item.type]} size="small">
                  {SOURCE_LABEL[item.type]}
                </Badge>
                {item.isNew && <Badge appearance="tint" color="success" size="small">New</Badge>}
                <Text size={100} style={{ color: tokens.colorNeutralForeground3, marginLeft: "auto", fontFamily: tokens.fontFamilyMonospace }}>
                  {item.publishedAt}
                </Text>
              </div>

              <Text size={300} weight="semibold">{item.title}</Text>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{item.source}</Text>
              <Text size={200} style={{ lineHeight: 1.6 }}>{item.summary}</Text>

              {item.tags && item.tags.length > 0 && (
                <div className={s.tagRow}>
                  {item.tags.map((tag) => (
                    <Badge key={tag} appearance="tint" color="informative" size="small">{tag}</Badge>
                  ))}
                </div>
              )}

              <div className={s.cardActions}>
                <Button size="small" appearance="subtle" icon={<OpenRegular />}>
                  Open paper
                </Button>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={item.bookmarked ? <BookmarkFilled style={{ color: accents.quantum }} /> : <BookmarkRegular />}
                  onClick={() => handleBookmark(item.id)}
                >
                  {item.bookmarked ? "Bookmarked" : "Bookmark to workspace"}
                </Button>
              </div>
            </div>
          ))}

          {visibleCount < filteredFeed.length && (
            <Button appearance="secondary" onClick={() => setVisibleCount((v) => v + 5)}>
              Load more ({filteredFeed.length - visibleCount} remaining)
            </Button>
          )}

          {filteredFeed.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3, border: `1px dashed ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium }}>
              <Text size={300}>No items match your current filters</Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
