import { HeroOverlay } from "@/components/HeroOverlay";
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

        <HeroOverlay headline={HEADLINE} />
      </section>

      <section
        id="about"
        className="relative flex min-h-[100dvh] scroll-mt-0 flex-col items-center justify-center px-6 py-32"
      >
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-white/40">
            LAST UPDATED: SEPTEMBER 2026 // CHAMPAIGN, IL
          </p>

          <div className="mt-10 space-y-7 font-serif text-[clamp(1.4rem,2.4vw,1.75rem)] leading-[1.5] text-white/55">
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
