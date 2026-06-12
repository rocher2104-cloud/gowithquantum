/**
 * Conversational Q&A about a run. The component contract is
 * "question in → streamed answer out" so the mock below can be swapped for a
 * Claude-backed endpoint without touching the UI.
 */
import type { ResultData } from "../data/models";

export interface RunMessage {
  role: "user" | "agent";
  text: string;
}

interface CannedQA {
  match: RegExp;
  answer: (r: ResultData) => string;
}

const CANNED: CannedQA[] = [
  {
    match: /mean|business|bottom line|so what|translate/i,
    answer: (r) =>
      `${r.headline} In practical terms: ${r.body} The key numbers are ${r.stats
        .map(([k, v]) => `${k.toLowerCase()} ${v}`)
        .join(", ")}.`,
  },
  {
    match: /why.*quantum|quantum.*why|why did you/i,
    answer: () =>
      "Problems like this explode combinatorially — as they grow, the number of possible answers grows exponentially. Classical solvers handle today's size fine, but quantum algorithms stay practical at scales where classical methods stall. We ran quantum here to benchmark how your problem behaves and to establish a baseline for when it grows.",
  },
  {
    match: /advantage|faster|better than classical|worth it/i,
    answer: (r) =>
      r.verdictClass === "vb-advantage"
        ? "Yes — in this run the quantum approach genuinely beat the classical baseline. " + r.verdict
        : "Honest answer: " + r.verdict,
  },
  {
    match: /next|now what|recommend|should i/i,
    answer: () =>
      "Keep this result as your working baseline and compare it against your current approach. If the problem grows — more variables, more constraints — re-run it; the scaling chart in the Technical view shows where the quantum approach becomes the faster option.",
  },
  {
    match: /cost|price|credit|expensive/i,
    answer: () =>
      "The hardware portion of this run cost about $7.50 in compute credits; the simulator stages were essentially free. Every run shows you the estimated cost before any hardware is used, and you approve it explicitly.",
  },
  {
    match: /trust|sure|confident|reliable|error/i,
    answer: (r) =>
      `We ran ${r.shots.toLocaleString()} shots and cross-checked the hardware result against the simulator. The dominant outcome is a stable, repeatable signal — and where the result is uncertain, we say so rather than rounding up.`,
  },
];

export const SUGGESTED_QUESTIONS = [
  "What does this mean for my business?",
  "Why did you use quantum computing here?",
  "Is there a real quantum advantage in this result?",
  "What should I do next?",
];

function answerFor(result: ResultData, question: string): string {
  for (const qa of CANNED) {
    if (qa.match.test(question)) return qa.answer(result);
  }
  return (
    "Good question — in this prototype I can answer about the result, the choice of quantum approach, costs, confidence, and next steps. Once the live agent is connected, I'll answer anything about this run. " +
    `Meanwhile, the short version of this result: ${result.headline}`
  );
}

/** Streams the answer word-by-word, mimicking a streamed model reply. */
export function askAboutRun(
  result: ResultData,
  question: string,
  onToken: (partial: string) => void,
  onDone: () => void,
): () => void {
  const full = answerFor(result, question);
  const words = full.split(" ");
  let i = 0;
  const timer = window.setInterval(() => {
    i += 1 + Math.floor(Math.random() * 2);
    onToken(words.slice(0, i).join(" "));
    if (i >= words.length) {
      window.clearInterval(timer);
      onDone();
    }
  }, 35);
  return () => window.clearInterval(timer);
}
