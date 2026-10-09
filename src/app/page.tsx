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

// The hero's Unicorn Studio scene, served from the site's own copy (saved by
// `npm run scene:pull`), so a later publish on Unicorn's side can't change
// it. After pulling a new version, bump this so browsers fetch it.
const HERO_SCENE_VERSION = "20261009-0022";

const STEAM_URL = "https://steamcommunity.com/id/kaushreverse/";

// TODO(kaush): confirm which email goes on the public site, and your X handle.
const EMAIL = "";
const X_URL = "";
// The résumé PDF in public/, downloaded by the [resume] link.
const RESUME_URL = "/Kaushal_Rajesh_Resume.pdf";

const links = [
  { label: "email", href: EMAIL ? `mailto:${EMAIL}` : "" },
  { label: "linkedin", href: "https://www.linkedin.com/in/kaushrajesh" },
  { label: "github", href: "https://github.com/Kaush10" },
  { label: "x", href: X_URL },
].filter((link) => link.href);

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col bg-background">
      <FrameRails />

      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black select-none">
        <UnicornHero src={`/hero-scene.json?v=${HERO_SCENE_VERSION}`} />

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
            </MorphLink>{" "}
            to fix the job search.
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
            tinkering, and late nights chipping away at my{" "}
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
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
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
        <SpatialTimeline resumeHref={RESUME_URL} />
      </div>

      {/* The frame closes here, with a dim dot answering the hero's. */}
      <footer className="relative h-[13svh] md:h-[22svh]">
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
