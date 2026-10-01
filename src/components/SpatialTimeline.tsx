import type { ReactNode } from "react";

import {
  DeublinGlyph,
  HfesGlyph,
  HoerbigerGlyph,
  MetalTekGlyph,
  RRGlyph,
  StevensonGlyph,
  UiucGlyph,
  VinskalGlyph,
  YonseiGlyph,
} from "@/components/glyphs";
import { ResumeDrop } from "@/components/ResumeDrop";
import {
  FloatingEntry,
  SpineNode,
  TimelineTrack,
} from "@/components/timeline-motion";

type Role = {
  /** The organisation's mark, shown beside the entry on the spine's side. */
  glyph?: ReactNode;
  period: string;
  title: string;
  org: string;
  summary: string;
  stack?: string[];
};

type Side = "left" | "right";

type Entry =
  | ({ kind: "role"; side: Side } & Role)
  | {
      kind: "cluster";
      side: Side;
      label: string;
      period: string;
      roles: Role[];
    };

const entries: Entry[] = [
  {
    kind: "role",
    side: "left",
    period: "2026 — present",
    title: "Co-founder & Product Lead",
    glyph: <VinskalGlyph />,
    org: "Vinskal",
    summary: "Product design, front-end architecture, and candidate telemetry.",
    stack: ["React", "Tailwind", "FastAPI", "Claude Code", "Tokens"],
  },
  {
    kind: "role",
    side: "right",
    period: "2026",
    title: "Multimodal HCI Researcher",
    glyph: <YonseiGlyph />,
    org: "Yonsei University (SeoulWalk)",
    summary:
      "Zero-guess spatial navigation engine mitigating LLM hallucinations.",
    stack: ["Expo", "React Native", "FastAPI", "CV", "RAG"],
  },
  {
    kind: "role",
    side: "left",
    period: "2026",
    title: "Lead Product Designer",
    glyph: <RRGlyph />,
    org: "R&R Custom Homes",
    summary:
      "Editorial web architecture and typography for luxury residential builds.",
    stack: ["Next.js", "Tailwind CSS", "Typography Systems"],
  },
  {
    kind: "role",
    side: "left",
    period: "2024 — 2025",
    title: "Student Chapter President",
    glyph: <HfesGlyph />,
    org: "Human Factors & Ergonomics Society (HFES)",
    summary:
      "Directed executive operations, cognitive ergonomics research, and UX workshops across UIUC.",
  },
  {
    kind: "cluster",
    side: "right",
    label: "Enterprise systems & industrial ergonomics",
    period: "2024 — 2025",
    roles: [
      {
        period: "2025",
        title: "UX Development Intern",
        glyph: <MetalTekGlyph />,
        org: "MetalTek International",
        summary:
          "Corporate intranet information architecture and internal discovery search.",
      },
      {
        period: "2025",
        title: "IT Intern (Enterprise UX)",
        glyph: <HoerbigerGlyph />,
        org: "HOERBIGER",
        summary:
          "Fleet-wide migration design systems and automated power workflows.",
      },
      {
        period: "2024",
        title: "IT Intern",
        glyph: <DeublinGlyph />,
        org: "Deublin Company",
        summary:
          "Global people & culture portal architecture and ERP process blueprints.",
      },
    ],
  },
  {
    kind: "role",
    side: "left",
    period: "2024",
    title: "Undergraduate ML Researcher",
    glyph: <UiucGlyph />,
    org: "Dr. Zhang Lab (UIUC)",
    summary:
      "Large-scale algorithmic data modeling and decision tree optimization.",
  },
  {
    kind: "role",
    side: "right",
    period: "2021 — 2023",
    title: "Student Council Vice President",
    glyph: <StevensonGlyph />,
    org: "Adlai E. Stevenson High School",
    summary:
      "Oversaw 400+ members, fundraising and event budgets, and coordinated a 2,400-person homecoming.",
  },
];

// Mobile: everything hangs off a spine at the list's left edge.
// Desktop: the spine sits at 50% and entries take one half each.
const sideClasses = {
  left: {
    item: "md:w-1/2 md:pl-0 md:pr-14 md:text-right",
    node: "md:left-auto md:right-0 md:translate-x-1/2",
  },
  right: {
    item: "md:ml-[50%] md:w-1/2 md:pl-14",
    node: "",
  },
} as const;

function RoleBody({ role, side }: { role: Role; side: Side }) {
  return (
    // The mark sits on the spine's side: left of the entry on phones and for
    // right-hand entries, right of it for left-hand ones on desktop. It's one
    // line tall, level with the title line.
    <div
      className={`group flex items-start gap-4 ${side === "left" ? "md:flex-row-reverse" : ""}`}
    >
      {role.glyph && (
        <span
          aria-hidden
          className="mt-6 flex h-[1.375rem] w-9 shrink-0 items-center justify-center text-[17px] text-white"
        >
          {role.glyph}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs tracking-wider text-muted uppercase">
          {role.period}
        </p>
        <h3 className="mt-2 text-base leading-snug font-medium text-foreground">
          {role.title}{" "}
          <span className="text-muted transition-colors duration-500 group-hover:text-foreground/80">
            @ {role.org}
          </span>
        </h3>
        <p
          className={`mt-2 max-w-sm text-sm leading-relaxed text-muted ${side === "left" ? "md:ml-auto" : ""}`}
        >
          {role.summary}
        </p>
        {role.stack && (
          <ul
            className={`mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] tracking-wide text-white/40 ${side === "left" ? "md:justify-end" : ""}`}
          >
            {role.stack.map((item, i) => (
              <li key={item}>
                {i > 0 && (
                  <span aria-hidden className="mr-2 text-faint">
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SpatialTimeline({ resumeHref }: { resumeHref: string }) {
  let floatIndex = 0;

  return (
    <section
      id="archive"
      aria-labelledby="archive-heading"
      className="relative mx-auto w-full max-w-4xl overflow-x-clip px-10 pt-32 md:px-6"
    >
      <h2 id="archive-heading" className="sr-only">
        archive
      </h2>

      <TimelineTrack>
        {entries.map((entry) => {
          const side = sideClasses[entry.side];

          if (entry.kind === "cluster") {
            return (
              <li
                key={entry.label}
                id="enterprise"
                className={`relative my-20 scroll-mt-32 pl-10 ${side.item}`}
              >
                <SpineNode className={side.node} />
                <div className="entry-dim">
                  <p className="font-mono text-[11px] tracking-widest text-white/40 uppercase">
                    {entry.label}{" "}
                    <span className="whitespace-nowrap">[{entry.period}]</span>
                  </p>
                  <div className="relative mt-6 pl-7">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-3 border-y border-l border-white/15"
                    />
                    <ul className="space-y-8 py-2">
                      {entry.roles.map((role) => (
                        <li key={role.org}>
                          <FloatingEntry index={floatIndex++} side="right">
                            <RoleBody role={role} side="right" />
                          </FloatingEntry>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          }

          return (
            <li key={entry.org} className={`relative my-20 pl-10 ${side.item}`}>
              <SpineNode className={side.node} />
              <div className="entry-dim">
                <FloatingEntry index={floatIndex++} side={entry.side}>
                  <RoleBody role={entry} side={entry.side} />
                </FloatingEntry>
              </div>
            </li>
          );
        })}
      </TimelineTrack>
      {/* Directly under the spine, so the spine's end is the lamp. */}
      <ResumeDrop href={resumeHref} />
    </section>
  );
}
