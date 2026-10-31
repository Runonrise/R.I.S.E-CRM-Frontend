import { useCallback, useEffect, useRef, useState } from "react";
import runonriseLockup from "../assets/brand/runonrise-lockup-for-dark-header.webp";
import dashboardWide from "../assets/landing/dashboard-dark-wide.webp";
import dashboardMobile from "../assets/landing/dashboard-dark-mobile.webp";
import "./landing.css";

// Demo video. Accepts a YouTube embed link
// (https://www.youtube.com/embed/VIDEO_ID) or a direct video file (.mp4 or
// .webm). While it is empty, the Demo link and section are hidden and the
// hero's second button points to "How it works" instead.
const VIDEO_URL = "";
const HAS_VIDEO = VIDEO_URL.trim() !== "";
const IS_VIDEO_FILE = /\.(mp4|webm)(\?|#|$)/i.test(VIDEO_URL);

// Still image for the demo card and the player. If it is missing, the card
// shows a plain dark panel and the player goes without it.
const POSTER_URL = "/demo/rise-demo-poster.jpg";

// Plain links on purpose: a full page load into /app means the CRM styles
// never get added to this page, even after pressing Back.
const APP_URL = "/app";

const NAV = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  ...(HAS_VIDEO ? [{ id: "demo", label: "Demo" }] : []),
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

function withAutoplay(url) {
  return url + (url.includes("?") ? "&" : "?") + "autoplay=1";
}

// The demo player in a modal dialog. The player only exists while the
// dialog is open, so nothing downloads until someone asks to watch.
// showModal() makes the rest of the page inert, which keeps keyboard focus
// inside the dialog.
function DemoModal({ open, onClose, poster, returnFocusRef }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const pressedBackdrop = useRef(false);

  const requestClose = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch (e) {}
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return undefined;

    // Lock page scroll, and pad for the scrollbar so the page does not shift.
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevPadding = root.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = scrollbar + "px";

    // The button that opened the modal gets focus back when it closes.
    const opener = returnFocusRef.current;
    if (!dialog.open) dialog.showModal();

    const video = videoRef.current;
    if (video) {
      // Focus on the player, so Space plays and pauses right away.
      video.focus();
      if (!prefersReducedMotion()) video.play().catch(() => {});
    }

    return () => {
      if (video) video.pause();
      if (dialog.open) dialog.close();
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPadding;
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, returnFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      className="rise-landing__modal"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      // Esc: close through React state so cleanup runs the same way every time.
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // In case the browser closes the dialog on its own.
      onClose={onClose}
      // A click on the dimmed area around the player closes it. Both the
      // press and the release must land there, so a drag that starts on
      // the player does not count.
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) requestClose();
        pressedBackdrop.current = false;
      }}
    >
      {open && (
        <div className="rise-landing__modal-panel">
          <div className="rise-landing__modal-head">
            <h2 id="demo-modal-title">R.I.S.E CRM demo</h2>
            <button
              type="button"
              className="rise-landing__modal-close"
              aria-label="Close video"
              onClick={requestClose}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="rise-landing__modal-frame">
            <div className="rise-landing__modal-player">
              {IS_VIDEO_FILE ? (
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  poster={poster}
                  controls
                  playsInline
                  preload="none"
                >
                  Your browser cannot play this video.
                </video>
              ) : (
                <iframe
                  src={prefersReducedMotion() ? VIDEO_URL : withAutoplay(VIDEO_URL)}
                  title="R.I.S.E CRM demo video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

// The demo section's card: the poster with a play button over it.
function DemoCard({ onOpen, posterState, onPosterState }) {
  const showPoster = POSTER_URL !== "" && posterState !== "missing";
  return (
    <button
      type="button"
      className="rise-landing__poster"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      {showPoster && (
        <img
          src={POSTER_URL}
          alt=""
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
          onLoad={() => onPosterState("ok")}
          onError={() => onPosterState("missing")}
        />
      )}
      <span className="rise-landing__poster-cta">
        <span className="rise-landing__poster-disc" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M9 6.5v11l9-5.5z" /></svg>
        </span>
        Play demo
      </span>
    </button>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  // "unknown" until the poster loads or fails, so the player only gets a
  // poster that is known to exist.
  const [posterState, setPosterState] = useState("unknown");
  const demoOpenerRef = useRef(null);

  const openDemo = useCallback(
    (e) => {
      demoOpenerRef.current = e.currentTarget;
      if (posterState === "unknown" && POSTER_URL) {
        const img = new Image();
        img.onload = () => setPosterState("ok");
        img.onerror = () => setPosterState("missing");
        img.src = POSTER_URL;
      }
      setDemoOpen(true);
    },
    [posterState]
  );

  const closeDemo = useCallback(() => setDemoOpen(false), []);

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
    // A tap or click anywhere outside the header closes the menu too.
    const onPointer = (e) => {
      if (!e.target.closest(".rise-landing__header")) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  return (
    <div className="rise-landing">
      <a className="rise-landing__skip" href="#main">Skip to content</a>

      <header className="rise-landing__header">
        <div className="rise-landing__bar">
          <a className="rise-landing__brand" href="/" aria-label="Runonrise home">
            <img src={runonriseLockup} alt="Runonrise" width="383" height="90" />
          </a>

          <nav className="rise-landing__nav" aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={"#" + n.id} onClick={(e) => onSectionLink(e, n.id)}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Launch App stays in the bar at every width, so it is one tap
              away anywhere on the page. */}
          <div className="rise-landing__bar-actions">
            <a className="rise-landing__btn rise-landing__btn--primary rise-landing__btn--small" href={APP_URL}>
              Launch App
            </a>
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
              <span className="rise-landing__menu-label">Menu</span>
            </button>
          </div>
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
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="rise-landing__hero" aria-labelledby="hero-title">
          <div className="rise-landing__container rise-landing__hero-text">
            <p className="rise-landing__kicker">R.I.S.E CRM by Runonrise</p>
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
              {HAS_VIDEO ? (
                <button
                  type="button"
                  className="rise-landing__btn rise-landing__btn--secondary"
                  aria-haspopup="dialog"
                  onClick={openDemo}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5v11l9-5.5z" /></svg>
                  Watch demo
                </button>
              ) : (
                <a
                  className="rise-landing__btn rise-landing__btn--secondary"
                  href="#how-it-works"
                  onClick={(e) => onSectionLink(e, "how-it-works")}
                >
                  See how it works
                </a>
              )}
            </div>
            <p className="rise-landing__note">
              Launch App opens the sign-in page. New here? You can create an
              account there.
            </p>
          </div>

          <div className="rise-landing__container">
            <figure className="rise-landing__shot">
              {/* Two crops of the same screenshot: the full dashboard on
                  wider screens, and just the client total and its risk split
                  on phones, where the full view would be too small to read. */}
              <div className="rise-landing__frame">
                <picture>
                  <source media="(max-width: 767px)" srcSet={dashboardMobile} width="741" height="544" />
                  <img
                    src={dashboardWide}
                    alt="The R.I.S.E CRM dashboard with sample data: total clients split by churn risk into critical, at-risk, and healthy, with renewal totals and a list of clients."
                    width="1848"
                    height="1152"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
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

        {HAS_VIDEO && (
          <section id="demo" className="rise-landing__section" aria-labelledby="demo-title" tabIndex={-1}>
            <div className="rise-landing__container">
              <div className="rise-landing__intro">
                <h2 id="demo-title">See it in action</h2>
                <p>A short walkthrough of R.I.S.E CRM and how it helps your team keep customers.</p>
              </div>
              <DemoCard onOpen={openDemo} posterState={posterState} onPosterState={setPosterState} />
            </div>
          </section>
        )}

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

      {HAS_VIDEO && (
        <DemoModal
          open={demoOpen}
          onClose={closeDemo}
          poster={posterState === "ok" ? POSTER_URL : undefined}
          returnFocusRef={demoOpenerRef}
        />
      )}
    </div>
  );
}
