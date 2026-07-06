// Client-side session history store (localStorage)
// Used for anonymous / guest users before they sign in.
// Syncs to the cloud database after login.

export type SessionRecord = {
  id: string;
  language: string;
  dialect: string | null;
  level: string;
  targetSentence: string | null;
  transcript: string;
  score: number | null;
  issues: { word: string; problem: string; tip: string }[];
  strengths: string[];
  practiceTip: string;
  createdAt: string;
};

const STORAGE_KEY = "uccharon-session-history";
const MAX_SESSIONS = 50;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getGuestId(): string {
  let id = localStorage.getItem("uccharon-guest-id");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : generateId();
    localStorage.setItem("uccharon-guest-id", id);
  }
  return id;
}

export function getAllSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getRecentSessions(language: string, limit = 10): SessionRecord[] {
  return getAllSessions()
    .filter((s) => s.language === language)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function saveSession(session: Omit<SessionRecord, "id" | "createdAt">): SessionRecord {
  const record: SessionRecord = {
    ...session,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const all = getAllSessions();
  all.unshift(record);
  if (all.length > MAX_SESSIONS) all.length = MAX_SESSIONS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return record;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

// Extract recurring issue patterns from recent sessions
export type RecurringIssue = {
  pattern: string;
  count: number;
  lastTip: string;
};

export function getRecurringIssues(language: string, minCount = 2): RecurringIssue[] {
  const sessions = getRecentSessions(language, 20);
  const map = new Map<string, { count: number; lastTip: string }>();

  for (const s of sessions) {
    for (const issue of s.issues) {
      const key = normalizeIssue(issue.word, issue.problem);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { count: 1, lastTip: issue.tip });
      }
    }
  }

  return Array.from(map.entries())
    .filter(([, v]) => v.count >= minCount)
    .map(([pattern, v]) => ({ pattern, count: v.count, lastTip: v.lastTip }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function normalizeIssue(word: string, problem: string): string {
  // Strip punctuation and lowercase for grouping
  const w = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const p = problem.toLowerCase().replace(/\s+/g, " ").trim();
  return `${w} | ${p}`;
}

// Compute average score over last N sessions for adaptive difficulty
export function getAverageScore(language: string, n = 5): number | null {
  const sessions = getRecentSessions(language, n);
  if (sessions.length === 0) return null;
  const scores = sessions.map((s) => s.score).filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function getSessionCount(language: string): number {
  return getAllSessions().filter((s) => s.language === language).length;
}
