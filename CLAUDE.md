@AGENTS.md

# kaush-site

Kaush's personal website: a single page with his experience and links. It's a personal
project, **not Vinskal**. The Linear, worktree, batching and PR rules in `~/.claude/CLAUDE.md`
don't apply here.

## Stack

Next.js 16 (App Router, `src/`), React 19, Tailwind CSS 4, TypeScript, npm.

- `npm run dev`: local server at http://localhost:3000
- `npm run build` and `npm run lint`: run both before calling a change done.

The page lives in `src/app/page.tsx`; global styles and Tailwind are in `src/app/globals.css`.

## Where the content comes from

Read these; don't copy them into the repo.

- **Latest resume**: `~/Documents/career/resumes/Rajesh_Kaushal_Resume_09:17:26.pdf` (Sep 2026).
  A longer version is in `Kaushal Rajesh Resume unoptimized 8_2026.docx` in the same folder.
- **LinkedIn exports** (older): `~/Documents/career/resumes/Kaushal Rajesh _ LinkedIn.pdf` and
  `Experience _ Kaushal Rajesh _ LinkedIn.pdf`.
- **Headshot**: `~/Documents/personal/headshot 2026.png` (800×800). Copy it into `public/` once
  he picks it.

The resume carries contact details. This site is public, so ask before putting a phone
number, address or personal email on it.

## Working here

- Committing to `main` is fine. Ask Kaush before creating the GitHub repo, pushing, deploying,
  or buying a domain.
- Design is his call. Use the `frontend-design` skill, propose a direction, and check it with
  him before building it out.
- `~/Documents/mydev/kaush-portfolio` is an older React + Vite template with no content.
  Ignore it.

## Open questions for Kaush

- Which links go on the page (LinkedIn, GitHub, email, Vinskal, others)?
- Domain and hosting (Vercel is the default for Next.js).
