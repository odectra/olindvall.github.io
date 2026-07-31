# olindvall.se

Personal website for Oskar Lindvall. Astro static site, deployed to GitHub Pages
at olindvall.se via GitHub Actions.

## Design language
- Minimal, clean typography, no heavy JS, no UI framework
- Content column: max-width 680px, centered
- Body text: Georgia (serif) via `font-family: Georgia, 'Times New Roman', serif`
- Navigation / headings: system sans-serif stack
- Dark mode: `prefers-color-scheme`, no JS toggle needed initially

## Layout structure
- Single-column layout throughout — no sidebars, no multi-column grids
- Header: site owner name/wordmark + flat horizontal (or collapsible) nav list,
  no hero image or tagline graphic
- Homepage (= Thoughts view) content area is a reverse-chronological list of
  entries: `Title — Date` per line, linking directly to the post. No excerpts,
  no thumbnails, no pagination controls for now
- Reflection post pages: title, date, tags, body only — no sidebar, no
  "related posts" widget, no comments
- Every page shares one content column (max-width 680px), regardless of page type

## Site structure
- `/` (index.astro) → same content as the Thoughts view
- `/about` → bio placeholders (professional bio, personal bio, photo placeholder,
  links: LinkedIn, Strava, Goodreads, a Strava activity feed placeholder block)
- `/projects` → grid/list of tools (Training: fuel calculator, FInance: savings/compound-interest calculator, FIRE calculator — placeholders to start)
- `/thoughts` → placeholder sections: leadership, exercise, learning, family, career
- `/reflections/[slug]` → individual blog post pages rendered from content collection
- `/reflections` (index) → list of all reflections

## Strava feed (about page)
- Placeholder only for now — a bordered/dashed box labeled "Strava activity feed"
  with a note "connected soon"
- Build it as a self-contained component (`src/components/StravaFeed.astro`) so
  the real data source can be swapped in later without touching the page layout
- Do NOT wire up a live embed or API call yet — no client-side iframe, no fetch,
  no API keys

## Content collections
- `src/content/reflections/*.md`
- Schema: title (string), date (date), description (string), tags (array of string)
- Use Astro Content Collections (`src/content/config.ts`), NOT raw file globbing

## Conventions
- Components in `src/components/`
- Shared layout in `src/layouts/Layout.astro` (nav + footer + <head>)
- Keep dependencies minimal — no Tailwind/React unless I ask for it