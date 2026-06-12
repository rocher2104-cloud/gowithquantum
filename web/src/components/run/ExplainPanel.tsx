import { useEffect, useRef, useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { ChatRegular, SendRegular } from "@fluentui/react-icons";
import type { ResultData } from "../../data/models";
import { accents } from "../../theme/brand";
import { askAboutRun, SUGGESTED_QUESTIONS, type RunMessage } from "../../protocol/qa";

const useStyles = makeStyles({
  root: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    overflow: "hidden",
    marginTop: "20px",
    background: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "13px 16px", borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
    color: tokens.colorNeutralForeground3,
  },
  thread: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" },
  msgUser: {
    alignSelf: "flex-end", maxWidth: "85%",
    background: tokens.colorBrandBackground2, color: tokens.colorNeutralForeground1,
    borderRadius: "14px 14px 4px 14px", padding: "9px 13px",
    fontSize: "13.5px", lineHeight: 1.55,
  },
  msgAgent: {
    alignSelf: "flex-start", maxWidth: "90%",
    background: tokens.colorNeutralBackground2,
    borderRadius: "14px 14px 14px 4px", padding: "9px 13px",
    fontSize: "13.5px", lineHeight: 1.6, color: tokens.colorNeutralForeground1,
  },
  suggestions: { display: "flex", flexDirection: "column", gap: "6px", padding: "12px 16px" },
  qBtn: {
    display: "flex", alignItems: "flex-start", gap: "8px",
    padding: "10px 12px", borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`, background: "transparent",
    cursor: "pointer", textAlign: "left", fontSize: "14px", color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase, fontWeight: 500,
    ":hover": { background: tokens.colorNeutralBackground2, borderTopColor: tokens.colorNeutralStroke1, borderRightColor: tokens.colorNeutralStroke1, borderBottomColor: tokens.colorNeutralStroke1, borderLeftColor: tokens.colorNeutralStroke1 },
  },
  icon: { flexShrink: 0, marginTop: "1px", color: accents.quantum },
  inputRow: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 12px", borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    background: tokens.colorNeutralBackground2,
  },
  input: {
    flex: 1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium,
    background: tokens.colorNeutralBackground1, color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyBase, fontSize: "14px", padding: "9px 12px", outline: "none",
    ":focus": { borderTopColor: tokens.colorBrandStroke1, borderRightColor: tokens.colorBrandStroke1, borderBottomColor: tokens.colorBrandStroke1, borderLeftColor: tokens.colorBrandStroke1 },
  },
  sendBtn: {
    width: "36px", height: "36px", borderRadius: tokens.borderRadiusMedium,
    border: 0, background: tokens.colorBrandBackground, color: "#fff",
    display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
    ":hover": { background: tokens.colorBrandBackgroundHover },
    ":disabled": { opacity: 0.35, cursor: "default" },
  },
});

/** Conversational panel scoped to one run. The contract is question in →
 * streamed answer out (protocol/qa.ts), so wiring the live agent in later is
 * a transport swap, not a UI change. */
export function ExplainPanel({ result }: { result: ResultData }) {
  const s = useStyles();
  const [messages, setMessages] = useState<RunMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || streaming) return;
    setDraft("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "agent", text: "…" }]);
    cancelRef.current = askAboutRun(
      result,
      q,
      (partial) =>
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "agent", text: partial };
          return next;
        }),
      () => setStreaming(false),
    );
  };

  return (
    <div className={s.root}>
      <div className={s.header}>
        <ChatRegular fontSize={16} />
        Ask about this result
      </div>

      {messages.length > 0 && (
        <div className={s.thread} ref={threadRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? s.msgUser : s.msgAgent}>{m.text}</div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <div className={s.suggestions}>
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} className={s.qBtn} onClick={() => ask(q)}>
              <ChatRegular fontSize={16} className={s.icon} />
              {q}
            </button>
          ))}
        </div>
      )}

      <div className={s.inputRow}>
        <input
          className={s.input}
          placeholder="Ask anything about this result…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(draft); }}
        />
        <button className={s.sendBtn} disabled={!draft.trim() || streaming} onClick={() => ask(draft)}>
          <SendRegular fontSize={16} />
        </button>
      </div>
    </div>
  );
}
