# MediTriage AI — Telemedicine Platform UI

Premium, accessible, multilingual (English · हिन्दी · मराठी) UI for the MediTriage
AI-powered telemedicine & triage platform — delivered as a **living design
system**: a pixel-perfect, fully interactive high-fidelity prototype plus the
complete developer-handoff package (tokens, Tailwind preset, component
contracts, flows).

> Figma-equivalent deliverable: every screen, component variant, state and flow
> from the design brief is implemented in real HTML/CSS/JS, so what you review
> is exactly what engineers build.

## Quick start

Any static server works — no build step:

```bash
python3 -m http.server 4173
# open http://localhost:4173            → hi-fi prototype (landing)
# open http://localhost:4173/styleguide.html  → design system & tokens
```

Inside the prototype, use the floating **“▦ Screens”** launcher (bottom-right)
as the prototype map: it lists all 14 screens and exposes demo controls
(simulate offline, arm the booking-conflict state, phone-frame preview).

## Screen inventory (per brief)

| # | Screen | Route |
|---|--------|-------|
| A | Landing (hero, features, impact, doctors, CTA, footer) | `#/` |
| B | Login — mobile + OTP, error/success states | `#/login` |
| C | Signup — role selection (patient/doctor) | `#/signup` |
| 1 | Patient dashboard — next appt, quick triage, vitals, records, reminders | `#/home` |
| 2 | AI Assistant — voice capture UI + chat, quick-symptom chips, triage log | `#/assistant` |
| 3 | Triage result — urgency badge, symptom checklist, explainable accordion | `#/triage-result` |
| 4 | Doctor search — filters, sort, list + live map | `#/doctors` |
| 5 | Doctor profile — credentials, reviews, availability calendar | `#/doctor/asha` |
| 6 | Booking flow — 3-step (slot type → patient → review/pay) | `#/book/asha` |
| 6a/6b | Booking success · slot-conflict (double-book prevention) | `#/booking-success` · `#/booking-conflict` |
| 7 | Video call — waiting room, device check, controls, chat/notes drawers, weak-network warning + reconnect | `#/call` |
| 8 | Medical timeline — filterable, expandable, record viewer modal | `#/records` |
| 9 | Consultation summary editor (doctor) — AI draft, Rx table, sign-off | `#/summary` |
| 10 | Admin analytics — stat cards, animated line/donut/bar charts, user table | `#/admin` |

**Advanced features (3):** ★ multilingual voice triage (switch EN/हिं/मराठी in
the top bar — the assistant hears and replies in the selected script) ·
★ offline mode + sync queue (toggle the network chip) · ★ IoT vitals dashboard
(`#/vitals` — SpO₂ radial, live ECG line, BLE device banner).

## Repository layout

```
index.html               # Assembled prototype (generated from src/ — do not hand-edit)
styleguide.html          # Design-system documentation (tokens, components, motion, copy, flows)
src/                     # Screen partials (edit these, then re-cat into index.html)
assets/
  css/  tokens.css · base.css · components.css · screens.css · responsive.css · styleguide.css
  js/   i18n.js (EN/HI/MR strings) · data.js (demo data) · app.js (router + interactions)
  img/  Generated photography (hero, doctors, patient, rural)
handoff/
  tokens.json            # All design tokens (colors, type, space, radius, shadow, motion, bp’s)
  tailwind.config.js     # Matching Tailwind preset
  components.md          # Annotated component contracts (props, states, behaviors, FHIR map)
  flow.mmd               # Core user flow (Mermaid)
```

## Design decisions

- **Palette** — trust-blue ramp (#268DD1 → #14527D), teal #71BDDF,
  marigold accent #FFA726/#FFC107 on clinical neutrals (#F4F9FA / #413B4B).
  AA-tuned derivatives are used for small text-on-white (documented per token).
- **Type** — Poppins (display, Devanagari-capable) + Inter + Noto Sans
  Devanagari; base 16 px, 1.55–1.75 line-height, fluid clamp() headings.
- **Indian accents** — slow-spinning mandala wireframes, lotus mark, DD/MM/YYYY,
  Indian photography & copy — quiet, never cliché.
- **Motion** — 120–480 ms, soft ease-out/spring; sonar mic rings, shimmer
  skeletons, sonorous success pops; `prefers-reduced-motion` honoured.
- **Accessibility** — WCAG 2.2 AA: ≥4.5:1 text, visible focus rings, ARIA
  label/pressed/live-region coverage, 44–58 px touch targets, skip links,
  colour-never-alone statuses.
- **Offline-first** — banner + queued triage + cached-record chips +
  auto-sync behaviours are all simulated and documented.
