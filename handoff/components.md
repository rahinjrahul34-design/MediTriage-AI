# MediTriage AI — Component Handoff

Annotated component contracts for engineering. Implementations live in
`assets/css/components.css` + `assets/js/app.js`; every example renders live in
`styleguide.html` (§05).

Conventions: props are camelCase; booleans default `false`; events in **bold**.
All components are keyboard-operable and localisation-safe (min-width, wrap,
no fixed text widths).

---

## Button

```tsx
Button({
  variant: "primary" | "secondary" | "soft" | "ghost" | "amber" | "danger",
  size: "sm" | "md" | "lg",            // md hit-target = 48px
  block: boolean, loading: boolean, disabled: boolean,
  iconLeft?: Icon, iconRight?: Icon
})
```

| Behavior | Spec |
|---|---|
| Press | `transform: scale(.965)`, 120 ms `--ease-out` |
| Loading | spinner replaces label, `aria-busy="true"`, interaction locked |
| Disabled | `opacity .55`, no shadow, `aria-disabled` + `disabled` |
| Focus | 3 px ring `--ring` (`rgba(38,141,209,.28)`) |

CSS: `.btn` `.btn--{variant}` `.btn--{size}` `.btn--block` `.is-loading`

### IconButton — `.iconbtn`
`IconButton({ icon, label /* aria-label required */, variant: "ghost"|"solid" })`

---

## Inputs

```tsx
TextField({ label, hint?, error?, prefix?, disabled })
TextArea({ label, rows=4 })
Select({ label, options })
OtpInput({ length=4, onComplete })     // digit boxes, auto-advance, backspace-chain
PhoneField({ countryCode="+91" })      // .input-prefix pattern
Checkbox({ label, checked })           // custom .check box, 22px, spring tick
```

- Focus: `border-color: --blue-500` + `--ring`; error: `--red-500` border +
  `.field__error` (icon + message, `aria-invalid`, `aria-describedby`).
- Min body size 16 px (prevents iOS zoom). Placeholder samples in `i18n.js`.

---

## Chip / Badge / Urgency

```tsx
Chip({ label, icon?, selected, onToggle })   // aria-pressed; filter rows scroll-x on mobile
Badge({ tone: "success"|"info"|"warning"|"error"|"neutral", icon? })
UrgencyBadge({ level: "routine"|"moderate"|"urgent" })  // ALWAYS icon + localised label — never colour alone
```

## Card — `.card` `.card--pad` `.card--hover`
`Card({ padded=true, interactive })` — hover lifts 3 px + shadow-2, 320 ms.

## DoctorCard

```tsx
DoctorCard({
  doctor: { name, specialty, photo, rating, reviews, languages[], modes[],
            fee, distanceKm, hospital, nextSlot, verified },
  onOpen, onBook
})
```
Row is a single focusable `role="link"` (Enter opens profile); nested *Book* is a
real button — verify keyboard order stays photo→title→book. Skeleton state:
`.skeleton` shimmer 1.4 s while fetching (FHIR `Practitioner` search).

## AvailabilityCalendar / Slot

```tsx
Slots({ doctorId, week, onSelect })  // .slot states: default / [aria-pressed] / [disabled]
```
Concurrency rule: poll `GET /slots?doctorId&date` on step enter (≤15 s stale);
on select, `POST /slots/:id/lock` (TTL 5 min, `--warning` countdown in UI). If
lock returns `409`, disable that slot, flash `taken-flash`, show the
**SlotConflict** empty state with nearest alternatives (see screen 6b).

## AvailabilityCalendar — responsive
Desktop: 7 day columns × time rows. ≤900 px: horizontal-scroll day strip (min
width 560 px inside `.avail`).

## Chat (Assistant)

```tsx
ChatWindow({ messages, quickReplies: string[], onSend, onVoice })
VoiceButton({ state: "idle"|"listening", onToggle })   // .mic-btn.is-live → sonar rings
TypingDots()                                            // 3-dot, 1.2 s loop
```
- Voice capture shows interim transcript (`#voice-heard`) → user confirms.
- Chat region is `aria-live="polite"`; new AI messages arrive in ≤ 1.1 s typed delay.
- Offline: composer stays enabled; outbound messages badge “Queued — will sync”
  and are POSTed when `online` fires (IndexedDB outbox).

## TriageResult
`UrgencyHero({ level })` (tint per level) · `SymptomItem({ name, detail, confidence })` ·
`ConfidenceMeter({ label, pct, tone })` · accordion *“Why this recommendation?”*
lists contributing factors with direction arrows (raises / lowers). Always render
disclaimer + emergency escape (`tel:108`).

## AppShell
Desktop: header (68 px) + sidebar (244 px). ≤1024 px: header shortens,
sidebar → `.tabbar` (Home · Doctors · **mic FAB** · Records · More-sheet).
`data-nav` keys drive active state from the router.

## Availability of network state
`NetChip` reflects `navigator.onLine`; toggling adds `body.is-offline`:
`.offline-bar` shows, `.offline-only` sections (sync queue) appear,
video *Join* is disabled with a toast reason. **Never** silently fail.

## VideoCall

```tsx
CallStage({ remote, local, state: "waiting"|"connecting"|"live"|"reconnecting" })
Controls({ mic, camera, chat, notes, end })       // 58px targets; red gradient end
NetWarning({ onReconnect })                       // auto: drop video → keep audio
```
Waiting room runs device checklist before *Join* (camera / mic / network RTT < 250 ms
→ HD default, else “Audio-only suggested”). In-call drawers (chat/notes) slide in
from right, `--ease-in-out` 320 ms, Esc to close.

## SummaryEditor (doctor)
Rich text (`contenteditable`) with tracked AI draft; toolbar = bold / italic /
list (`document.execCommand`, replace with ProseMirror in prod).
Blocking warnings (`.field-warn`) must resolve before **Approve & sign** enables;
sign → FHIR `Composition` + `DocumentReference` shared to patient ABHA locker, e-Rx
as `MedicationRequest[]`.

## Timeline / RecordViewer
`.tl-item` rail + `.tl-card` (click / Enter / Space expands; `aria-expanded`).
Doc viewer modal: preview + **Download** (signed URL, audit-logged) +
**Share** (24 h link). Records are FHIR `DocumentReference`; bundle export
produces encrypted ZIP.

## Charts (admin)
Hand-rolled SVG (no vendor lib): `LineChart, DonutChart, BarChart` —
animated draw (`stroke-dashoffset` 1.6 s; bars scaleY 700 ms).
Palette `--chart-1…6` (colour-blind-aware); every series has `<title>` +
`role="img"` summary.

## Toast
`toast(title, type, body?)` — stack top-right (bottom on mobile), auto-dismiss
4.6 s, max 4, `role="status"`, close button 30 px.

## Modal
`openModal(content, { title, wide, foot })` — backdrop blur, Esc/backdrop close,
focus moves to close control, `role="dialog" aria-modal="true"`.

---

## Data / API mapping (FHIR R4 + platform)

| UI entity | Resource / endpoint |
|---|---|
| Doctor card, profile | `Practitioner` + `PractitionerRole`, `HealthcareService` |
| Slots / booking lock | `Schedule`, `Slot`; `POST /appointments` idempotency-key |
| Appointment | `Appointment` (status proposed→booked→fulfilled) |
| Triage session | `QuestionnaireResponse` + `RiskAssessment` (AI-assist flag) |
| Vitals (IoT) | `Observation` (LOINC: 59408-5 SpO₂, 8867-4 HR, 85354-9 BP, 8310-5 Temp) |
| Records | `DocumentReference` in ABHA locker (ABDM consented) |
| Video token | `POST /rtc/token` (short-lived, room-scoped) |

Accessibility invariants to assert in CI: 4.5:1 text contrast, focus outline
presence, `lang` attributes on hi/mr nodes, form labels bound, all icon-only
buttons labelled.
