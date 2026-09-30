import { IndustrialGlyph, UiucGlyph, VinskalGlyph, YonseiGlyph } from "@/components/glyphs";
import { MorphLink } from "@/components/MorphLink";
import { SpatialTimeline } from "@/components/SpatialTimeline";
import { UnicornHero } from "@/components/UnicornHero";

const HEADLINE = "hey, its kaush";

const links = [
  { label: "vinskal", href: "https://vinskal.com" },
  { label: "github", href: "https://github.com/Kaush10" },
  { label: "linkedin", href: "https://www.linkedin.com/in/kaushrajesh" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-black select-none">
        <UnicornHero projectId="P9NQwwDyqpdo8M1mJg53" hiddenLayers={["text"]} />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black"
        />

        <h1 className="pointer-events-none absolute inset-x-0 top-[72%] -translate-y-1/2 px-6 text-center font-serif text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[-0.01em] text-foreground [text-shadow:0_0_48px_rgb(255_255_255/0.28)]">
          {HEADLINE}
        </h1>

        <a
          href="#about"
          className="absolute bottom-6 flex min-h-11 min-w-11 flex-col items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-widest text-white/30 uppercase transition-colors hover:text-white/60 focus-visible:outline-1 focus-visible:outline-white/40"
        >
          scroll
          <span aria-hidden className="scroll-cue block h-8 w-px bg-white/40" />
        </a>
      </section>

      <section
        id="about"
        className="relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-6 py-32"
      >
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-white/40">
            LAST UPDATED: SEPTEMBER 2026 // CHAMPAIGN, IL
          </p>

          <div className="mt-10 space-y-6 text-lg leading-[1.75] text-muted">
            <p>
              im a senior studying brain & cognitive science with cs & informatics at{" "}
              <MorphLink href="https://illinois.edu" glyph={<UiucGlyph />}>
                uiuc
              </MorphLink>
              . im currently architecting your experience in{" "}
              <MorphLink href="https://vinskal.com" glyph={<VinskalGlyph />}>
                vinskal
              </MorphLink>
              , the last job search platform.
            </p>
            <p>
              previously, i’ve explored multimodal interaction models and spatial hallucination
              mitigation at{" "}
              <MorphLink href="https://www.yonsei.ac.kr" glyph={<YonseiGlyph />}>
                yonsei
              </MorphLink>
              , and engineered enterprise systems across{" "}
              <MorphLink href="#enterprise" glyph={<IndustrialGlyph />}>
                industrial environments
              </MorphLink>
              .
            </p>
            <p>
              outside of screens & design, my time goes into bouldering, hardware tinkering, and
              clearing out my steam backlog.
            </p>
          </div>

          <nav aria-label="Links" className="mt-14">
            <ul className="flex flex-wrap gap-2">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-white/70 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 active:scale-[0.98] md:min-h-0"
                  >
                    [{link.label}]
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <SpatialTimeline />
    </main>
  );
}
