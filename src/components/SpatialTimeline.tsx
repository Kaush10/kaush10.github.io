type Role = {
  period: string;
  title: string;
  org: string;
  summary: string;
  stack?: string[];
};

type Entry =
  | ({ kind: "role"; side: "left" | "right" } & Role)
  | { kind: "cluster"; label: string; period: string; roles: Role[] };

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
];

// Mobile: everything hangs off a spine at the list's left edge.
// Desktop: the spine sits at 50% and entries take one half each.
const sideClasses = {
  left: {
    item: "md:w-1/2 md:pl-0 md:pr-12 md:text-right",
    node: "md:left-auto md:right-0 md:translate-x-1/2",
  },
  right: {
    item: "md:ml-[50%] md:w-1/2 md:pl-12",
    node: "",
  },
} as const;

function Node({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute top-1.5 left-0 size-2 -translate-x-1/2 rounded-full border border-white/30 bg-black ${className}`}
    />
  );
}

function RoleBody({ role, align }: { role: Role; align?: "right" }) {
  return (
    <>
      <p className="font-mono text-xs tracking-wider text-muted uppercase">{role.period}</p>
      <h3 className="mt-2 text-[15px] leading-snug font-medium text-foreground">
        {role.title} <span className="text-muted">@ {role.org}</span>
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{role.summary}</p>
      {role.stack && (
        <ul
          className={`mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] tracking-wide text-white/40 ${align === "right" ? "md:justify-end" : ""}`}
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
    </>
  );
}

export function SpatialTimeline() {
  return (
    <section
      id="archive"
      aria-labelledby="archive-heading"
      className="relative mx-auto w-full max-w-4xl px-6 py-32"
    >
      <h2
        id="archive-heading"
        className="font-mono text-xs tracking-widest text-white/40 uppercase md:text-center"
      >
        {"// archive_01: systems & operational provenance"}
      </h2>

      <div
        aria-hidden
        className="absolute top-48 bottom-24 left-6 w-px -translate-x-1/2 bg-gradient-to-b from-white/10 via-white/5 to-transparent md:left-1/2"
      />

      <ol className="relative mt-24">
        {entries.map((entry) => {
          if (entry.kind === "cluster") {
            return (
              <li
                key={entry.label}
                id="enterprise"
                className="relative my-16 scroll-mt-24 pl-10 md:ml-[50%] md:w-1/2 md:pl-12"
              >
                <Node />
                <p className="font-mono text-[11px] tracking-widest text-white/40 uppercase">
                  {entry.label} <span className="whitespace-nowrap">[{entry.period}]</span>
                </p>
                <div className="relative mt-4 pl-6">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-3 border-y border-l border-white/[0.08]"
                  />
                  <ul>
                    {entry.roles.map((role) => (
                      <li
                        key={role.org}
                        className="my-3 rounded-md border border-white/[0.05] bg-surface-1 px-4 py-3 first:mt-0 last:mb-0"
                      >
                        <RoleBody role={role} />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }

          const side = sideClasses[entry.side];
          return (
            <li key={entry.org} className={`relative my-16 pl-10 ${side.item}`}>
              <Node className={side.node} />
              <RoleBody role={entry} align={entry.side === "left" ? "right" : undefined} />
            </li>
          );
        })}
      </ol>

      <p className="relative mt-24 pl-10 font-mono text-xs tracking-wider text-white/40 md:pl-0 md:text-center">
        2021 — 2023 / vernon hills / student council vice president
      </p>
    </section>
  );
}
