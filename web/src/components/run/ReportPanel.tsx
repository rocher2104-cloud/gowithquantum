import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  rp: { color: tokens.colorNeutralForeground2, fontSize: "14px", lineHeight: "1.65", margin: "0 0 10px" },
  pre: {
    background: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px 14px", overflowX: "auto", margin: "10px 0",
  },
  code: { fontFamily: "'DM Mono', monospace", fontSize: "12px", lineHeight: 1.6 },
});

function fmt(t: string) {
  return t
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, `<code style="font-family:'DM Mono',monospace;font-size:12px;background:#f1f5f9;padding:1px 5px;border-radius:4px">$1</code>`);
}

function renderMarkdown(md: string): string {
  let html = "", inP = false, inCode = false, codeLines: string[] = [];
  for (const raw of md.split("\n")) {
    if (raw.startsWith("```")) {
      if (inCode) {
        html += `<pre style="background:#1e293b;border-radius:6px;padding:12px;overflow-x:auto;margin:10px 0"><code style="font-family:'DM Mono',monospace;font-size:12px;color:#e2e8f0">${codeLines.join("\n").replace(/&/g,"&amp;").replace(/</g,"&lt;")}</code></pre>`;
        codeLines = []; inCode = false;
      } else { if (inP) { html += "</p>"; inP = false; } inCode = true; }
      continue;
    }
    if (inCode) { codeLines.push(raw); continue; }
    if (raw.startsWith("## ")) { if (inP) { html += "</p>"; inP = false; } html += `<h2 style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:20px 0 6px;font-weight:600">${fmt(raw.slice(3))}</h2>`; }
    else if (raw.startsWith("### ")) { if (inP) { html += "</p>"; inP = false; } html += `<h3 style="font-size:15px;font-weight:700;margin:14px 0 6px">${fmt(raw.slice(4))}</h3>`; }
    else if (raw.startsWith("- ")) { if (inP) { html += "</p>"; inP = false; } html += `<p style="padding-left:14px;color:#475569;font-size:14px;line-height:1.65;margin:0 0 6px">• ${fmt(raw.slice(2))}</p>`; }
    else if (raw.trim() === "") { if (inP) { html += "</p>"; inP = false; } }
    else { if (!inP) { html += `<p style="color:#475569;font-size:14px;line-height:1.65;margin:0 0 10px">`; inP = true; } else html += " "; html += fmt(raw); }
  }
  if (inP) html += "</p>";
  return html;
}

export function ReportPanel({ markdown }: { markdown: string }) {
  return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />;
}
