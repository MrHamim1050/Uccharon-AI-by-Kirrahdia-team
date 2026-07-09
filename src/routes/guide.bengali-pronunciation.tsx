import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://ucchararon-ai-by-kirrahdia.lovable.app/guide/bengali-pronunciation";
const TITLE = "How to Learn Bengali Pronunciation — A Step-by-Step Guide";
const DESCRIPTION =
  "A practical guide to mastering Standard Bengali pronunciation from local dialects like Sylheti, Chatgaiya, and Noakhali — vowels, consonants, common mistakes, and daily practice drills.";

export const Route = createFileRoute("/guide/bengali-pronunciation")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to Learn Bengali Pronunciation",
          description: DESCRIPTION,
          url: URL,
          totalTime: "P30D",
          step: [
            { "@type": "HowToStep", name: "Learn the vowel system", text: "Master Bengali's 7 vowel sounds and nasalization before touching consonants." },
            { "@type": "HowToStep", name: "Drill the consonant contrasts", text: "Focus on aspirated vs unaspirated (ক/খ, প/ফ) and dental vs retroflex (ত/ট) pairs." },
            { "@type": "HowToStep", name: "Fix your dialect substitutions", text: "Identify the Sylheti, Chatgaiya, or Noakhali sounds you swap in for Standard Bengali equivalents." },
            { "@type": "HowToStep", name: "Practice minimal pairs daily", text: "Use word pairs that differ by one sound (কাল/খাল, বাড়ি/বারি) and record yourself." },
            { "@type": "HowToStep", name: "Get instant feedback", text: "Use an AI pronunciation coach like Uccharon AI to score each attempt and flag exact errors." },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How long does it take to learn Bengali pronunciation?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most learners can reach clear, understandable Standard Bengali pronunciation in 4–8 weeks of daily 15-minute practice, especially if they already speak a related dialect.",
              },
            },
            {
              "@type": "Question",
              name: "What is the hardest part of Bengali pronunciation?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The aspirated/unaspirated consonant pairs (ক/খ, প/ফ, ত/থ) and dental/retroflex contrasts (ত/ট, দ/ড) trip up most learners, plus the inherent 'অ' vowel that changes value between words.",
              },
            },
            {
              "@type": "Question",
              name: "Can I learn Bengali pronunciation online?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Pair listening (native audio, songs, news) with an AI pronunciation tool that scores your speech and pinpoints exact errors — this replaces the tutor feedback loop.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span>Guide</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          How to Learn Bengali Pronunciation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A step-by-step guide to mastering Standard Bengali (প্রমিত বাংলা) if you grew up
          speaking Sylheti, Chatgaiya, Noakhali, or another local dialect.
        </p>
      </header>

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <h2 className="font-display text-2xl font-semibold">Why Bengali pronunciation feels hard</h2>
        <p>
          Standard Bengali has sound contrasts that many regional dialects merge or replace.
          If your dialect uses <em>h</em> where Standard Bengali uses <em>s</em> (common in
          Sylheti), or drops the aspirated <em>kh/ph/th</em>, you'll be understood by family
          but mismatched in interviews, classrooms, and media. The good news: these are a
          small set of concrete swaps, not a whole new language.
        </p>

        <h2 className="font-display text-2xl font-semibold">Step 1 — Lock in the vowel system</h2>
        <p>
          Bengali has 7 vowel sounds: <strong>অ, আ, ই, উ, এ, ও, অ্যা</strong>. Two vowels do
          most of the damage:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>অ (inherent vowel)</strong> — sounds like "o" in <em>hot</em> in some
            positions and "aw" in <em>saw</em> in others. Learn the rule by word shape, not
            by translation.
          </li>
          <li>
            <strong>এ vs অ্যা</strong> — <em>দেখা</em> (dekha, "to see") vs <em>দ্যাখা</em>
            (dyakha) — a contrast most dialects flatten.
          </li>
        </ul>
        <p>Practice 20 minimal-pair words a day until the two vowels feel physically different in your mouth.</p>

        <h2 className="font-display text-2xl font-semibold">Step 2 — Drill the consonant contrasts</h2>
        <p>Four pairs matter more than everything else combined:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>ক / খ</strong> — unaspirated vs aspirated k</li>
          <li><strong>প / ফ</strong> — unaspirated vs aspirated p (not "f")</li>
          <li><strong>ত / ট</strong> — dental t vs retroflex t</li>
          <li><strong>দ / ড</strong> — dental d vs retroflex d</li>
        </ul>
        <p>
          Hold a hand in front of your mouth. Aspirated consonants push a puff of air; unaspirated
          ones don't. If your palm doesn't feel it, the sound isn't landing.
        </p>

        <h2 className="font-display text-2xl font-semibold">Step 3 — Identify your dialect substitutions</h2>
        <p>The most common swaps to reverse:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Sylheti:</strong> <em>স → হ</em> (shesh → hesh), missing aspiration, dropped final vowels.</li>
          <li><strong>Chatgaiya:</strong> heavy nasalization, <em>চ → ছ</em> shifts, tonal patterns.</li>
          <li><strong>Noakhali:</strong> <em>র → গ</em> in some positions, altered vowel length.</li>
        </ul>
        <p>
          Write down 10 words you say differently from a news anchor. That personal list is your
          curriculum for the next month.
        </p>

        <h2 className="font-display text-2xl font-semibold">Step 4 — Minimal pairs, every day</h2>
        <p>
          Minimal pairs are two words that differ by one sound. Read each pair aloud slowly, then at
          normal speed, then record yourself:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>কাল / খাল (kal / khal)</li>
          <li>পাল / ফাল (pal / phal)</li>
          <li>তাল / টাল (tal — dental / retroflex)</li>
          <li>বাড়ি / বারি (bari — retroflex ড় / flap র)</li>
        </ul>

        <h2 className="font-display text-2xl font-semibold">Step 5 — Get instant AI feedback</h2>
        <p>
          The single fastest accelerator is a feedback loop tighter than "record, listen, guess."
          <Link to="/" className="text-primary underline underline-offset-4"> Uccharon AI</Link> scores
          each attempt against Standard Bengali, highlights the exact syllable that missed, and
          suggests the specific mouth shape to fix — the same loop a private tutor gives you, without
          scheduling.
        </p>

        <h2 className="font-display text-2xl font-semibold">A realistic 30-day plan</h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li><strong>Week 1:</strong> Vowel drills, 10 min/day.</li>
          <li><strong>Week 2:</strong> Add consonant pair drills, 15 min/day.</li>
          <li><strong>Week 3:</strong> Your personal 10-word substitution list, recorded daily.</li>
          <li><strong>Week 4:</strong> Read a news paragraph aloud, score with AI, log the top 3 errors.</li>
        </ol>

        <h2 className="font-display text-2xl font-semibold">FAQ</h2>
        <h3 className="font-semibold">How long does it take to learn Bengali pronunciation?</h3>
        <p>Most learners reach clear Standard Bengali in 4–8 weeks of daily 15-minute practice.</p>

        <h3 className="font-semibold">What is the hardest part of Bengali pronunciation?</h3>
        <p>Aspirated/unaspirated pairs and dental/retroflex contrasts — most dialects merge them.</p>

        <h3 className="font-semibold">Can I learn Bengali pronunciation online?</h3>
        <p>Yes — pair native audio with an AI tool that scores your speech and pinpoints errors.</p>
      </section>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="font-display text-2xl font-semibold">Try Uccharon AI free</h2>
        <p className="mt-2 text-muted-foreground">
          Speak a word, get an instant pronunciation score, and see exactly what to fix.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          Start practicing →
        </Link>
      </div>
    </article>
  );
}
