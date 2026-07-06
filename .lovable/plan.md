Current state: The AI is fully stateless. Each analysis is a fresh API call. No data is stored.

Phase 0 — Fix SSR crash (prerequisite)
- Move the `@sapphi-red/web-noise-suppressor` import inside a browser-only guard so server render never touches `AudioWorkletNode`.
- Make `startEnhancedCapture` dynamically imported only when `typeof window !== 'undefined'`.

Phase 1 — Enable persistence (Lovable Cloud)
- Enable Lovable Cloud to get Supabase PostgreSQL.
- Create a `pronunciation_sessions` table:
  - id, user_id (anon/guest UUID or auth.uid()), language, dialect, level, target_sentence, transcript, score, issues JSONB, created_at.
- Create a `user_profiles` table to store per-user preferences (preferred language, output language, auto-difficulty flag).

Phase 2 — Per-user memory (personal learning)
- Server function `saveSession({ transcript, score, issues, language, target })` inserts into `pronunciation_sessions`.
- Server function `getRecentMistakes({ userId, language, limit })` fetches the last 5–10 sessions, extracts recurring issue patterns (e.g., "শ vs ষ", Sylheti vowel shift).
- Modify the analysis prompt in `analyze-pronunciation.ts`:
  - When a user has history, inject a "Learner history" block: "This learner often struggles with X, Y, Z. Tailor tips accordingly."
  - If the same word was flagged in the last 2 sessions, make the tip more targeted.
- UI: After analysis, show a "Your recurring issues" chip list (e.g., "শ/ষ confusion — 4 times").

Phase 3 — Adaptive difficulty (per-user intelligence)
- Track average score over last N sessions per level.
- If average > 85 for 3 sessions, auto-suggest level up.
- If average < 50, suggest dropping down or generating custom drill sentences targeting the weakest phonemes.
- Add a "Personalized Practice" button that generates a sentence using only the sounds the user misses most.

Phase 4 — Global improvement (collective learning)
- Anonymous aggregation query: most common issues per language/dialect pair.
- Use aggregated data to improve the default system prompt (e.g., if 60% of Sylheti learners confuse "ই" and "ঈ", add that as a known pattern in the base prompt).
- Admin/owner view (simple table) showing top 10 dialect→standard error patterns across all users.
- Use aggregated patterns to generate better stock sentences for the sentence bank.

Out of scope for this plan:
- Model fine-tuning (requires thousands of labeled audio samples; not cost-effective at this stage).
- Paid server-side voice isolation (ElevenLabs Voice Isolator).
