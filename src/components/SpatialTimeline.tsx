import { FloatingEntry, SpineNode, TimelineTrack } from "@/components/timeline-motion";

type Role = {
  period: string;
  title: string;
  org: string;
  summary: string;
  stack?: string[];
};

type Side = "left" | "right";

type Entry =
  | ({ kind: "role"; side: Side } & Role)
  | { kind: "cluster"; side: Side; label: string; period: string; roles: Role[] };

const entries: Entry[] = [
  {
    kind: "role",
    side: "left",
    period: "2026 — present",
    title: "Co-founder & Product Lead",
    org: "Vinskal",
    summary: "Product design, front-end architecture, and candidate telemetry.",
    stack: ["React", "Tailwind", "FastAPI", "Claude Code", "Tokens"],
  },
  {
    kind: "role",
    side: "right",
    period: "2026",
    title: "Multimodal HCI Researcher",
    org: "Yonsei University (SeoulWalk)",
    summary: "Zero-guess spatial navigation engine mitigating LLM hallucinations.",
    stack: ["Expo", "React Native", "FastAPI", "CV", "RAG"],
  },
  {
    kind: "role",
    side: "left",
    period: "2026",
    title: "Lead Product Designer",
    org: "R&R Custom Homes",
    summary: "Editorial web architecture and typography for luxury residential builds.",
    stack: ["Next.js", "Tailwind CSS", "Typography Systems"],
  },
  {
    kind: "role",
    side: "left",
    period: "2024 — 2025",
    title: "Student Chapter President",
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
        title: "IT Intern (Enterprise UX)",
        org: "HOERBIGER",
        summary: "Fleet-wide migration design systems and automated power workflows.",
      },
      {
        period: "2025",
        title: "UX Development Intern",
        org: "MetalTek International",
        summary: "Corporate intranet information architecture and internal discovery search.",
      },
      {
        period: "2024",
        title: "IT Intern",
        org: "Deublin Company",
        summary: "Global people & culture portal architecture and ERP process blueprints.",
      },
    ],
  },
  {
    kind: "role",
    side: "left",
    period: "2024",
    title: "Undergraduate ML Researcher",
    org: "Dr. Zhang Lab (UIUC)",
    summary: "Large-scale algorithmic data modeling and decision tree optimization.",
  },
  {
    kind: "role",
    side: "right",
    period: "2021 — 2023",
    title: "Student Council Vice President",
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
    <div className="group">
      <p className="font-mono text-xs tracking-wider text-muted uppercase">{role.period}</p>
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
  );
}

export function SpatialTimeline() {
  let floatIndex = 0;

  return (
    <section
      id="archive"
      aria-labelledby="archive-heading"
      className="relative mx-auto w-full max-w-4xl px-6 py-32"
    >
      <h2
        id="archive-heading"
        className="mb-24 font-mono text-xs tracking-widest text-white/40 uppercase md:text-center"
      >
        {"// archive_01: systems & operational provenance"}
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
                <p className="font-mono text-[11px] tracking-widest text-white/40 uppercase">
                  {entry.label} <span className="whitespace-nowrap">[{entry.period}]</span>
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
              </li>
            );
          }

          return (
            <li key={entry.org} className={`relative my-20 pl-10 ${side.item}`}>
              <SpineNode className={side.node} />
              <FloatingEntry index={floatIndex++} side={entry.side}>
                <RoleBody role={entry} side={entry.side} />
              </FloatingEntry>
            </li>
          );
        })}
      </TimelineTrack>
    </section>
  );
}
