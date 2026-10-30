# R.I.S.E CRM Frontend

React app (create-react-app, `npm start`) with Framer Motion and Recharts.
Backend is a separate Flask repo on Render. Do not touch API calls unless told to.

## Git rules
- Commit often. Push only branches named in this file, never main.
- Never push to main. Deploying to Vercel happens last, and only when I say so.
- ../R.I.S.E-CRM-Baseline is a read-only memoir of the old RetainIQ version. Never edit, delete, or add files there. Copy out of it only when I ask.
- Branches: thematic-overhaul, professional-website.

## Brand
- Product name: R.I.S.E CRM (formerly RetainIQ). Never show "RetainIQ" in the UI.
- Inside the CRM app, use ONLY the R.I.S.E CRM logo. Never the Runonrise logo.
- The Runonrise logo is for the landing page only.
- Logo files live in src/assets/brand/.

## Theme tokens
- Tokens live in src/App.css (:root and [data-theme="dark"]). Do not create tokens.css.
- Keep the existing variable names. Change values only, and add gradient variables.
- Brand colors: obsidian #0A0910, indigo #1A1590, gradient #FFC83D, #FF7A3D, #EC3B8B, #8B2BE2, #3B3FD6, page tint #ECEAF5.
- Violet #8B2BE2 fails contrast as small text on obsidian. Use it for fills and borders only.
- Risk colors (low, medium, high, critical) stay semantic and distinct from the brand pink.
- Dark theme is the default. Light theme uses the page tint.
- Use CSS variables only. No hardcoded hex values in components.

## Rules
- Keep text contrast at WCAG AA or better.
- Support prefers-reduced-motion for every animation.
- Mobile first. Check 390px and 1440px widths.
- Landing page at "/", CRM at "/app/*", login stays inside the CRM.
- Plain, natural copy. No em dashes, no corporate buzzwords.

## Logo files
- In the CRM app: rise-crm-lockup-for-dark.png on dark surfaces, rise-crm-lockup.png on light surfaces, rise-crm-mark.png for small spots like the sidebar.
- Landing page only: runonrise-lockup-for-dark.png and runonrise-lockup-for-light.png, runonrise-mark.png for the hero reflection.

## Landing page rules
- Landing code lives in src/landing/. Styles go in src/landing/landing.css.
- Scope every landing style and token under .rise-landing. Never add landing tokens to :root or to src/App.css.
- Runonrise logos are allowed on the landing page only. The CRM keeps using only the R.I.S.E CRM logo.
- Landing work must not modify the CRM: no changes to src/App.js, src/App.css, src/pages, src/components, or the CRM's behavior.
- Link to the CRM with a plain <a href="/app">, not a router Link, so CRM styles never load on the landing page.
