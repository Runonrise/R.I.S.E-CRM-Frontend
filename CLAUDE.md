# R.I.S.E CRM Frontend

React app with Framer Motion and Recharts. Check package.json for the exact setup.
Backend is a separate Flask repo on Render. Do not touch API calls unless told to.

## Git rules
- Commit locally only. NEVER run git push. Push is disabled on purpose.
- Branches: thematic-overhaul, professional-website. Commit small and often.
- Deploying to Vercel happens last, and only when I say so.

## Brand
- Product name: R.I.S.E CRM (formerly RetainIQ). Never show "RetainIQ" in the UI.
- Inside the CRM app, use ONLY the R.I.S.E CRM logo. Never the Runonrise logo.
- The Runonrise logo is for the landing page only.
- Logo files live in src/assets/brand/.

## Theme tokens (single source of truth: src/theme/tokens.css)
- obsidian: #0A0910 (main dark background)
- indigo: #1A1590 (deep brand surface)
- gradient, top to bottom: #FFC83D, #FF7A3D, #EC3B8B, #8B2BE2, #3B3FD6
- page tint: #ECEAF5
- Use CSS variables only. No hardcoded hex values in components.

## Rules
- Keep text contrast at WCAG AA or better on dark backgrounds.
- Support prefers-reduced-motion for every animation.
- Mobile first. Check 390px and 1440px widths.
- Landing page at "/", CRM at "/app/*", login stays inside the CRM.
- Plain, natural copy. No em dashes, no corporate buzzwords.
