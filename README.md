# Future Youth Market website

Future Youth Market (FYM) is a student-led organization where students work together on projects they can share. This repository contains the standalone FYM V1 website prepared for Netlify. The existing Wix site is not changed by this build or deployment configuration.

## Run locally

Requires Node.js 20 or newer. No Wix tooling or environment variables are needed to build the public site.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4177/`. The preview serves the generated `dist/` directory. Run `npm run build` to rebuild after editing content; restart `npm run dev` to preview the new build. Run `npm test` for route and content checks.

## Structure

- `fym-site-copy/`: approved standalone HTML/CSS/JS design, local project imagery, and Decap `/admin/` files.
- `content/projects/*.json`: project content. Active and completed projects get `/projects/<slug>/` pages from one template; coming-soon projects appear only in the marketplace.
- `content/team.json`: verified team members, in display order.
- `scripts/build-site.cjs`: zero-dependency static build into `dist/`.
- `scripts/dev-site.cjs`: local static preview of that build.
- `scripts/test-site.cjs`: direct-route and launch-content checks.
- `src/`, `wix.config.json`, and `scripts/build-wix-embed.cjs`: legacy Wix/Velo integration, preserved for reference but excluded from the Netlify build.

The build copies existing pages, replaces the Home featured project, Projects marketplace, Team feature, and reusable project detail from the JSON content, then writes standalone HTML. It does not use Velo or a Wix embed. Historical Kelly Angelovic and TravelerLenz case studies remain separate from the current-project marketplace.

## Netlify

Connect the existing GitHub repository `aayushjain1230/FYM-WEBSITE` to a **new Netlify preview project**, not the current Wix production site. `netlify.toml` runs `npm run build` and publishes `dist/`. Each public route has its own `index.html`; direct visits and refreshes do not need an SPA fallback. Keep Wix and DNS untouched until FYM approves the replacement.

No build-time environment variables are required. The Scholarship Opportunity Finder application opens its verified Google Form in a new tab. Idea submissions currently open the existing FYM Wix Form as an external service; replacing that form later requires an FYM-owned form URL, not a site rebuild.

## Content manager

Decap CMS is at `/admin/`. Its GitHub backend edits `content/projects/*.json` and `content/team.json`, then commits to `main`; Netlify rebuilds when that branch changes. FYM's Netlify owner must configure GitHub OAuth before anyone can log in. No token or client secret belongs in this repository. See [the non-developer CMS guide](docs/FYM-CMS-GUIDE.md) and [developer handoff](docs/DEVELOPER-HANDOFF.md).

The supported setup is [Decap's GitHub backend](https://decapcms.org/docs/github-backend/) with [Netlify's OAuth provider](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/). Netlify's Git Gateway is deprecated for new configurations, so this project does not use it.

FYM should retain administrative access to GitHub, Netlify, the domain/DNS account, Decap OAuth configuration, Google Forms, and response Sheets. Two appropriate FYM leaders should have admin access where possible. Do not put passwords or tokens in project files.
