This repository is a small static website (HTML/CSS/JS) for "Çevre Topluluğu" with a client-side Medium RSS integration.

Key files
- `medium-config.js` — central config for Medium integration. Supports `username` (single) and `usernames` (array) and exposes `rssUrls` and `rssUrl` for compatibility.
- `medium-integration.js` — main logic: fetches RSS (uses `corsProxy`), parses XML with DOMParser, extracts items, and renders into DOM elements (`featured-post-container`, `blog-grid`, `homepage-posts-grid`).
- `index.html`, `blog.html`, and partial templates — pages reference the above scripts and DOM element IDs.

What an AI agent should know when editing this project
- The Medium integration is client-side and runs in the browser (no backend). Use the `corsProxy` in `MEDIUM_CONFIG` when fetching the RSS feed(s).
- `medium-config.js` is written to be global on `window.MEDIUM_CONFIG`. Editors should update that file to change behavior site-wide.
- Adding multiple Medium accounts: update `MEDIUM_CONFIG.usernames` (array). `medium-integration.js` will fetch and merge their feeds, deduplicate by `link`, and sort by publication date.
- Rendering targets are expected to exist by ID; if you change HTML element IDs, update the corresponding selectors in `medium-integration.js` (`getElementById` calls).

Conventions & patterns
- Defensive parsing: code checks for missing RSS elements and returns `null` from `parsePost` for malformed items — preserve this pattern (filtering nulls) when refactoring.
- Date handling: parsed into JS `Date` objects and sorted descending for newest-first ordering.
- Default images and category mappings live in `settings` within `MEDIUM_CONFIG`; prefer using those instead of hardcoding images or categories in the integration.
- Backwards compatibility: `rssUrl` remains available (first username) — don't remove it unless you update all callers.

Developer workflows
- This is a static site — open `index.html`/`blog.html` in a browser. Because RSS fetches cross-origin, the `corsProxy` is required for local files unless hosting the site with a server that allows CORS.
- Quick local check: serve the folder with a simple static server (e.g., `npx http-server .` or Python `python -m http.server`) and open `http://localhost:8080/index.html`. If RSS fetching fails, check browser console logs.

Examples (patterns to follow)
- Add multiple usernames in `medium-config.js`:
  - usernames: ['mehmetalibeylikci', 'anotherUser']
- Ensure `settings.blogPagePostCount` controls the aggregated count shown on `blog.html`.

Edge cases to preserve/fix
- RSS items missing `pubDate`, `title`, or `link` are skipped — keep this behavior to avoid rendering broken cards.
- Duplicate posts across accounts are deduped by `link` and the newest `pubDate` is kept.
- If all feeds fail or return zero items, `showNoPostsMessage()` is used — don't remove this UX fallback.

When making changes
- Update `medium-config.js` for config changes; keep the file export global on `window.MEDIUM_CONFIG`.
- If you modify parsing or DOM insertion, run a quick browser check and inspect console logs — `medium-integration.js` logs detailed steps and errors.

If anything is unclear or you need a test harness (e.g., sample RSS files or a small node script to simulate the feed), ask and I'll add it.

End of instructions.
