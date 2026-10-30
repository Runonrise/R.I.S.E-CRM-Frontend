import runonriseLockup from "../assets/brand/runonrise-lockup-for-dark.png";
import "./landing.css";

// Placeholder landing page. The real design comes later.
export default function LandingPage() {
  return (
    <main className="rise-landing">
      <img
        className="rise-landing__logo"
        src={runonriseLockup}
        alt="Runonrise"
        width="2343"
        height="550"
      />
      <h1 className="rise-landing__title">R.I.S.E CRM</h1>
      {/* A plain link on purpose: a full page load into /app means the CRM
          styles never get added to this page, even after pressing Back. */}
      <a className="rise-landing__cta" href="/app">
        Launch App
      </a>
    </main>
  );
}
