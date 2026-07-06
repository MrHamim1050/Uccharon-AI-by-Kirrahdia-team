## Goal
Improve transcription accuracy in Uchcharon AI, especially for multilingual input (English, Bangla + dialects, and the other 8 supported languages).

## Reality check on the hybrid models you mentioned
Canary-Qwen, IBM Granite Speech 3.3, and Phi-4-Multimodal are excellent, but they are **not available through Lovable AI Gateway**. Our server route can only call models the gateway exposes. The gateway's speech-to-text allowlist is:

- `openai/gpt-4o-mini-transcribe` (current)
- `openai/gpt-4o-transcribe` (higher accuracy, same API)

Additionally, Gemini chat models (`google/gemini-3-flash-preview`, `google/gemini-3-pro-preview`) accept audio input via `/v1/chat/completions` and can transcribe — useful as a second opinion or for language-aware coaching.

Wiring a self-hosted Conformer+LLM (Canary-Qwen etc.) would require standing up an external inference endpoint (Replicate / HF Inference / your own GPU) and storing an API key — out of scope unless you want that path.

## Proposed plan (works within the gateway)

### 1. Upgrade the primary STT model
`src/routes/api/transcribe.ts`: switch `openai/gpt-4o-mini-transcribe` → `openai/gpt-4o-transcribe`. Same request shape, meaningfully better accuracy on accented and code-switched speech.

### 2. Add a "hybrid" verification pass for Bengali dialects
When the selected language is Bengali (any dialect), run a second transcription through `google/gemini-3-pro-preview` with the audio attached and a prompt like "Transcribe this audio in Bengali script. The speaker may use Sylheti/Chittagonian/Standard Bangla." Then:

- If both transcripts agree (normalized), use it with high confidence.
- If they disagree, pass **both** candidates + the target sentence into the existing `analyze-pronunciation` route so Gemini picks the most plausible one before scoring.

This mimics the accuracy gains of hybrid encoder+LLM systems using models we actually have.

### 3. Tighten the language bias prompt
Current `prompt` field lists all 10 languages, which can confuse Whisper-style models. Change to send only the currently selected language + (for Bengali) the dialect hint. Removes cross-language hallucination.

### 4. Optional: model picker
Add a small "Accuracy: Standard / High" toggle in the UI that switches between `gpt-4o-mini-transcribe` (fast, cheap) and the hybrid `gpt-4o-transcribe + Gemini verify` path (slower, best). Default = High.

## Files touched
- `src/routes/api/transcribe.ts` — model swap, per-language prompt, optional Gemini verification pass, dual-candidate return.
- `src/routes/api/analyze-pronunciation.ts` — accept optional second candidate transcript and reconcile.
- `src/components/VoiceInput.tsx` — (only if you want the accuracy toggle) add the switch and pass the mode to the API.

## Not in this plan
Self-hosting Canary-Qwen / Granite Speech / Phi-4-Multimodal. Say the word if you want me to add that via Replicate or a custom endpoint — I'll write a separate plan for it since it needs an API key and a new integration.

## Question before I build
Do you want:
- **A)** Just the model upgrade + smarter prompt (fast, one-file change), or
- **B)** The full hybrid pipeline (gpt-4o-transcribe + Gemini verification for Bengali) with the accuracy toggle, or
- **C)** I draft a separate plan for actually integrating Canary-Qwen / Phi-4-Multimodal via Replicate?
