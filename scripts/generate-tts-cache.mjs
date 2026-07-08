// Pre-generate MP3 files for every sentence in the sentence bank and upload
// them to the Lovable Assets CDN. Writes src/lib/tts-cache.json mapping
// sentence.id -> CDN URL so the client can play instantly without hitting
// /api/tts at all.
//
// Usage: node scripts/generate-tts-cache.mjs [--only=bn] [--force]

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) {
  console.error("LOVABLE_API_KEY missing");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const only = [...args].find((a) => a.startsWith("--only="))?.split("=")[1];
const force = args.has("--force");

// Import the sentence bank via a tiny esbuild-free trick: strip TS types.
// Simpler: just parse it. We'll spawn tsx-less: use dynamic import through a
// transpile shim.
const sentencePath = new URL("../src/lib/sentence-bank.ts", import.meta.url);
const source = readFileSync(sentencePath, "utf8");
// Strip TS type-only constructs enough for evaluation.
const jsSource = source
  .replace(/export type [\s\S]*?;\n/g, "")
  .replace(/: Record<[^>]+>/g, "")
  .replace(/: Partial<[^>]+>/g, "")
  .replace(/: Bank\b/g, "")
  .replace(/: TargetSentence\b/g, "")
  .replace(/: LanguageCode\[\]/g, "")
  .replace(/: BnDialect\[\]/g, "")
  .replace(/type Bank = [\s\S]*?;\n/g, "")
  .replace(/export /g, "");
const tmpModule = join(tmpdir(), `sbank-${Date.now()}.mjs`);
writeFileSync(tmpModule, jsSource + "\nexport { SENTENCE_BANK };\n");
const { SENTENCE_BANK } = await import(pathToFileURL(tmpModule).href);

const OUT = new URL("../src/lib/tts-cache.json", import.meta.url);
const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const workDir = join(tmpdir(), "tts-cache");
mkdirSync(workDir, { recursive: true });

const langs = only ? [only] : Object.keys(SENTENCE_BANK);
let generated = 0;
let skipped = 0;

for (const lang of langs) {
  const levels = SENTENCE_BANK[lang];
  if (!levels) continue;
  for (const level of Object.keys(levels)) {
    for (const s of levels[level]) {
      if (!s.text) continue;
      if (!force && existing[s.id]) { skipped++; continue; }
      const filename = `${s.id}.mp3`;
      const filePath = join(workDir, filename);

      process.stdout.write(`[${lang}/${level}] ${s.id} -> `);
      const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: s.text,
          voice: "alloy",
          response_format: "mp3",
        }),
      });
      if (!res.ok) {
        console.error(`TTS failed ${res.status}: ${await res.text()}`);
        process.exit(1);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(filePath, buf);

      const cliOut = execSync(
        `lovable-assets create --file ${filePath} --filename ${filename}`,
        { encoding: "utf8" }
      );
      const asset = JSON.parse(cliOut);
      existing[s.id] = asset.url;
      writeFileSync(OUT, JSON.stringify(existing, null, 2));
      rmSync(filePath, { force: true });
      generated++;
      console.log(asset.url);
    }
  }
}

console.log(`\nDone. generated=${generated} skipped=${skipped} total=${Object.keys(existing).length}`);
