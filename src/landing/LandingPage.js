import { useCallback, useEffect, useState } from "react";
import runonriseLockup from "../assets/brand/runonrise-lockup-for-dark.png";
import dashboardShot from "../assets/landing/dashboard-dark.webp";
import "./landing.css";

// Demo video. Leave empty to show the placeholder.
// Accepts a YouTube embed link (https://www.youtube.com/embed/VIDEO_ID)
// or a direct video file (.mp4 or .webm).
const VIDEO_URL = "";

// Plain links on purpose: a full page load into /app means the CRM styles
// never get added to this page, even after pressing Back.
const APP_URL = "/app";

const NAV = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "demo", label: "Demo" },
];

const FEATURES = [
  {
    id: "scoring",
    title: "Churn risk scoring",
    body: "Every account gets a churn risk score, so you can see at a glance who is healthy, who is slipping, and who needs a call now.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16" /><path d="M6 15l4-4 3 3 5-6" /><path d="M15 8h3v3" /></svg>
    ),
  },
  {
    id: "emails",
    title: "AI-drafted retention emails",
    body: <>R.I.S.E CRM writes a personal email for each <span className="rise-landing__nowrap">at-risk</span> account. Read it, adjust it, and send it from your own inbox.</>,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6 8.5-6" /></svg>
    ),
  },
  {
    id: "alerts",
    title: <>Live alerts for <span className="rise-landing__nowrap">at-risk</span> accounts</>,
    body: "When an account starts to look risky, it shows up in your alerts right away instead of at the next quarterly review.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg>
    ),
  },
  {
    id: "journey",
    title: "Customer journey map",
    body: "Follow each account from first deal to renewal and see the point where things started to change.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="17" r="2" /><circle cx="12" cy="7" r="2" /><circle cx="19" cy="15" r="2" /><path d="M6.4 15.4l4.2-6.8M13.5 8.5l4.2 5" /></svg>
    ),
  },
];

const STEPS = [
  {
    id: "data",
    title: "Bring in your customer data",
    body: "Upload a CSV of your accounts and contracts. R.I.S.E CRM organizes it into clients, contacts, and renewals.",
  },
  {
    id: "score",
    title: "Get a risk score for every account",
    body: "The model scores each account's chance of churning and ranks the ones that need attention first.",
  },
  {
    id: "email",
    title: "Send a personalized email",
    body: <>Open an <span className="rise-landing__nowrap">at-risk</span> account and send a retention email written for that customer, not a template.</>,
  },
];

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    return false;
  }
}

// Scroll to a section and move keyboard focus there, so screen reader and
// keyboard users land in the same place as everyone else.
function goToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
  try {
    window.history.replaceState(null, "", "#" + id);
  } catch (e) {}
}

function DemoVideo() {
  if (!VIDEO_URL) {
    return (
      <div className="rise-landing__video rise-landing__video--empty">
        <span className="rise-landing__play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M9 6.5v11l9-5.5z" /></svg>
        </span>
        <p className="rise-landing__video-note">Demo video coming soon</p>
      </div>
    );
  }
  if (/\.(mp4|webm)(\?|#|$)/i.test(VIDEO_URL)) {
    return (
      <div className="rise-landing__video">
        <video src={VIDEO_URL} controls preload="metadata" playsInline>
          Your browser cannot play this video.
        </video>
      </div>
    );
  }
  return (
    <div className="rise-landing__video">
      <iframe
        src={VIDEO_URL}
        title="R.I.S.E CRM demo video"
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const onSectionLink = useCallback((e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    goToSection(id);
  }, []);

  // The page renders after its code loads, so the browser's own jump to a
  // #hash in the URL has already happened. Do it once here instead.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && document.getElementById(id)) {
      document.getElementById(id).scrollIntoView({ block: "start" });
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("rise-landing-menu-button")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="rise-landing">
      <a className="rise-landing__skip" href="#main">Skip to content</a>

      <header className="rise-landing__header">
        <div className="rise-landing__bar">
          <a className="rise-landing__brand" href="/" aria-label="Runonrise home">
            <img src={runonriseLockup} alt="Runonrise" width="2343" height="550" />
          </a>

          <nav className="rise-landing__nav" aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={"#" + n.id} onClick={(e) => onSectionLink(e, n.id)}>{n.label}</a>
                </li>
              ))}
            </ul>
            <a className="rise-landing__btn rise-landing__btn--primary rise-landing__btn--small" href={APP_URL}>
              Launch App
            </a>
          </nav>

          <button
            id="rise-landing-menu-button"
            className="rise-landing__menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="rise-landing-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            Menu
          </button>
        </div>

        <nav
          id="rise-landing-menu"
          className="rise-landing__menu"
          aria-label="Main"
          hidden={!menuOpen}
        >
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={"#" + n.id} onClick={(e) => onSectionLink(e, n.id)}>{n.label}</a>
              </li>
            ))}
          </ul>
          <a className="rise-landing__btn rise-landing__btn--primary" href={APP_URL}>
            Launch App
          </a>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="rise-landing__hero" aria-labelledby="hero-title">
          <div className="rise-landing__container rise-landing__hero-text">
            <h1 id="hero-title">Spot churn before it happens</h1>
            <p className="rise-landing__lede">
              R.I.S.E CRM scores the churn risk of every account you manage and
              tells your team who to call today, so renewals stop slipping away
              unnoticed.
            </p>
            <div className="rise-landing__actions">
              <a className="rise-landing__btn rise-landing__btn--primary" href={APP_URL}>
                Launch App
              </a>
              <a
                className="rise-landing__btn rise-landing__btn--secondary"
                href="#demo"
                onClick={(e) => onSectionLink(e, "demo")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" /></svg>
                Watch demo
              </a>
            </div>
          </div>

          <div className="rise-landing__container rise-landing__container--wide">
            <figure className="rise-landing__shot">
              <div className="rise-landing__frame">
                <img
                  src={dashboardShot}
                  alt="The R.I.S.E CRM dashboard: client totals, accounts expiring in 90 days, critical accounts, value at risk, and a list of clients with their renewal status."
                  width="2240"
                  height="1400"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <figcaption>The R.I.S.E CRM dashboard, shown with sample data.</figcaption>
            </figure>
          </div>
        </section>

        <section id="features" className="rise-landing__section" aria-labelledby="features-title" tabIndex={-1}>
          <div className="rise-landing__container">
            <div className="rise-landing__intro">
              <h2 id="features-title">Built on AI, not bolted on</h2>
              <p>
                R.I.S.E CRM was built around AI from the first line of code.
                Churn prediction and email drafting are part of the product
                itself, not a paid <span className="rise-landing__nowrap">add-on</span> you switch on later.
              </p>
            </div>
            <ul className="rise-landing__cards">
              {FEATURES.map((f) => (
                <li key={f.id} className="rise-landing__card">
                  <span className="rise-landing__icon">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="rise-landing__section" aria-labelledby="how-title" tabIndex={-1}>
          <div className="rise-landing__container">
            <div className="rise-landing__intro">
              <h2 id="how-title">How it works</h2>
              <p>Three steps from a spreadsheet to a conversation that keeps a customer.</p>
            </div>
            <ol className="rise-landing__steps">
              {STEPS.map((s, i) => (
                <li key={s.id} className="rise-landing__step">
                  <span className="rise-landing__step-num" aria-hidden="true">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="demo" className="rise-landing__section" aria-labelledby="demo-title" tabIndex={-1}>
          <div className="rise-landing__container">
            <div className="rise-landing__intro">
              <h2 id="demo-title">See it in action</h2>
              <p>A short walkthrough of R.I.S.E CRM and how it helps your team keep customers.</p>
            </div>
            <DemoVideo />
          </div>
        </section>

        <section className="rise-landing__section rise-landing__section--cta" aria-labelledby="cta-title">
          <div className="rise-landing__container">
            <div className="rise-landing__cta">
              <h2 id="cta-title">See who needs a call today</h2>
              <p>Open the app and find out which accounts are at risk before they renew somewhere else.</p>
              <a className="rise-landing__btn rise-landing__btn--light" href={APP_URL}>
                Launch App
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="rise-landing__footer">
        <div className="rise-landing__container rise-landing__footer-inner">
          <p className="rise-landing__footer-name">Runonrise</p>
          <p>R.I.S.E CRM, Retention Intelligence on Sales Engagement</p>
          <p className="rise-landing__footer-note">Not yet an official release</p>
        </div>
      </footer>
    </div>
  );
}
