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
