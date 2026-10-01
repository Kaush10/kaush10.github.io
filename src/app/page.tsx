import { BioSpotlight } from "@/components/BioSpotlight";
import { HeroOverlay } from "@/components/HeroOverlay";
import {
  IndustrialGlyph,
  SteamGlyph,
  UiucGlyph,
  VinskalGlyph,
  YonseiGlyph,
} from "@/components/glyphs";
import { MorphLink } from "@/components/MorphLink";
import { FrameDot, FrameRails, FrameRule } from "@/components/PageFrame";
import { SpatialTimeline } from "@/components/SpatialTimeline";
import { UnicornHero } from "@/components/UnicornHero";

const HEADLINE = "hey, its kaush";

// The hero's Unicorn Studio scene. After republishing it, bump the version
// (any new value, e.g. the publish time) so browsers fetch the new one.
const HERO_SCENE = "P9NQwwDyqpdo8M1mJg53";
const HERO_SCENE_VERSION = "20261001-0409";

// TODO(kaush): swap in your Steam profile link.
const STEAM_URL = "https://store.steampowered.com";

const links = [
  { label: "vinskal", href: "https://vinskal.com" },
  { label: "github", href: "https://github.com/Kaush10" },
  { label: "linkedin", href: "https://www.linkedin.com/in/kaushrajesh" },
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-background">
      <FrameRails />

      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-black select-none">
        <UnicornHero projectId={`${HERO_SCENE}?update=${HERO_SCENE_VERSION}`} />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black"
        />

        <HeroOverlay headline={HEADLINE} />
      </section>

      <BioSpotlight>
        <p className="font-mono text-[11px] tracking-widest text-white/40">
          LAST UPDATED: SEPTEMBER 2026 // CHAMPAIGN, IL
        </p>

        <div className="mt-9 space-y-6 font-serif text-[clamp(1.26rem,2.16vw,1.575rem)] leading-[1.5] text-white/55">
          <p>
            im a senior studying brain & cognitive science with cs & informatics
            at{" "}
            <MorphLink href="https://illinois.edu" glyph={<UiucGlyph />}>
              uiuc
            </MorphLink>
            . im currently designing and building{" "}
            <MorphLink href="https://vinskal.com" glyph={<VinskalGlyph />}>
              vinskal
            </MorphLink>
            , an incredible job search homebase software.
          </p>
          <p>
            previously, i’ve explored multimodal interaction models and human-ai
            interaction principles at{" "}
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
            outside of screens & design, my time’s spent climbing, hardware
            tinkering, and late nights clearing out my{" "}
            <MorphLink href={STEAM_URL} glyph={<SteamGlyph />}>
              steam
            </MorphLink>{" "}
            backlog.
          </p>
        </div>

        <nav aria-label="Links" className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-white/70 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 active:scale-[0.98] md:min-h-0"
                >
                  [{link.label}]
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </BioSpotlight>

      <div className="relative pt-[calc(var(--frame-top)*1.5)]">
        <FrameRule index="02" label="archive">
          <FrameDot variant="ring" />
        </FrameRule>
        <SpatialTimeline />
      </div>

      {/* The frame closes here, with a dim dot answering the hero's. */}
      <footer className="relative h-[28dvh]">
        <FrameRule
          index="end"
          label={`© ${new Date().getFullYear()}`}
          position="bottom"
        >
          <FrameDot variant="solid" />
        </FrameRule>
      </footer>
    </main>
  );
}
