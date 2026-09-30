/* ============================================================
   MediTriage AI — PROTOTYPE ENGINE
   Hash router · screen controllers · chat triage demo ·
   WebRTC-call simulation · charts · offline simulation
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const D = window.MTDATA;
  const icon = (n, cls) => `<svg class="icon ${cls || ""}" aria-hidden="true"><use href="#i-${n}"></use></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const t = (k) => window.MTI18N.t(k);
  const lang = () => window.MTI18N.get();

  /* ---------------- Toasts ---------------- */
  const TOAST_ICON = { success: "check-circle", info: "info", warning: "alert-triangle", error: "x-circle" };
  function toast(title, type, body) {
    type = type || "success";
    const root = $("#toast-root");
    while (root.children.length > 3) root.firstChild.remove();
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.setAttribute("role", "status");
    el.innerHTML =
      `<span class="toast__icon">${icon(TOAST_ICON[type])}</span>
       <div><strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ""}</div>
       <button class="iconbtn toast__close" aria-label="Dismiss notification">${icon("x", "icon--sm")}</button>`;
    $(".toast__close", el).addEventListener("click", () => dismiss(el));
    root.appendChild(el);
    setTimeout(() => dismiss(el), 4600);
    function dismiss(node) { if (!node.isConnected) return; node.classList.add("is-leaving"); setTimeout(() => node.remove(), 220); }
  }

  /* ---------------- Modal ---------------- */
  function openModal(html, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal ${opts.wide ? "modal--wide" : ""}" role="dialog" aria-modal="true" aria-label="${esc(opts.label || "Dialog")}">
      <div class="modal__head"><h3>${esc(opts.title || "")}</h3>
      <button class="iconbtn" data-close aria-label="Close dialog">${icon("x")}</button></div>
      <div class="modal__body">${html}</div>${opts.foot ? `<div class="modal__foot">${opts.foot}</div>` : ""}</div>`;
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); document.removeEventListener("keydown", onKey); };
    wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest("[data-close]")) close(); });
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    if (opts.onMount) opts.onMount(wrap, close);
    $(".modal [data-close]", wrap) && $(".modal [data-close]", wrap).focus();
    return { close, el: wrap };
  }

  /* ---------------- Connectivity simulation (offline mode) ---------------- */
  function setOnline(on, silent) {
    document.body.classList.toggle("is-offline", !on);
    const lbl = $("#net-chip .lbl");
    if (lbl) lbl.textContent = on ? "Online" : "Offline";
    if (!silent) {
      if (on) toast(t("toast.synced"), "success");
      else toast(t("error.offline"), "error", t("offline.line"));
    }
    const warn = $("#net-warn");
    if (warn) warn.classList.toggle("is-on", !on);
  }

  /* ---------------- Skeleton helper ---------------- */
  function skeletonCards(n, tpl) {
    return Array.from({ length: n }, tpl).join("");
  }

  /* ============================================================
     ROUTER
     ============================================================ */
  const ROUTES = {
    "": { el: "screen-landing", chrome: true, init: initLanding, title: "MediTriage AI — Stay Home, Consult Online" },
    "login": { el: "screen-login", chrome: true, init: initLogin, title: "Log in · MediTriage AI" },
    "signup": { el: "screen-signup", chrome: true, init: initSignup, title: "Create account · MediTriage AI" },
    "call": { el: "screen-call", chrome: true, init: initCall, title: "Video Consultation · MediTriage AI" },
    "home": { el: "screen-home", nav: "home", init: initHome, title: "Home · MediTriage AI" },
    "assistant": { el: "screen-assistant", nav: "assistant", init: initAssistant, title: "AI Assistant · MediTriage AI" },
    "triage-result": { el: "screen-triage-result", nav: "assistant", init: initTriage, title: "Triage Result · MediTriage AI" },
    "doctors": { el: "screen-doctors", nav: "doctors", init: initDoctors, title: "Find Doctors · MediTriage AI" },
    "doctor": { el: "screen-doctor", nav: "doctors", init: initDoctorProfile, title: "Doctor Profile · MediTriage AI" },
    "book": { el: "screen-book", nav: "doctors", init: initBooking, title: "Book Appointment · MediTriage AI" },
    "booking-success": { el: "screen-booking-success", nav: "doctors", init: initBookingSuccess, title: "Appointment Confirmed · MediTriage AI" },
    "booking-conflict": { el: "screen-booking-conflict", nav: "doctors", init: initBookingConflict, title: "Slot Unavailable · MediTriage AI" },
    "summary": { el: "screen-summary", nav: "summary", init: initSummary, title: "Consultation Summary · MediTriage AI" },
    "records": { el: "screen-records", nav: "records", init: initRecords, title: "Health Records · MediTriage AI" },
    "vitals": { el: "screen-vitals", nav: "vitals", init: initVitals, title: "Vitals · MediTriage AI" },
    "admin": { el: "screen-admin", nav: "admin", init: initAdmin, title: "Analytics · MediTriage AI" }
  };

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = h.split("?");
    const segs = pathPart.split("/").filter(Boolean);
    return { name: segs[0] || "", params: segs.slice(1), query: new URLSearchParams(queryPart || "") };
  }

  function route() {
    const { name, params, query } = parseHash();
    const r = ROUTES[name] || ROUTES[""];
    document.title = r.title;

    const appRoot = $("#app-root"), chromeRoot = $("#chrome-root");
    if (r.chrome) { appRoot.classList.add("hide"); chromeRoot.classList.remove("hide"); document.body.classList.add("is-chrome"); }
    else { chromeRoot.classList.add("hide"); appRoot.classList.remove("hide"); document.body.classList.remove("is-chrome"); }

    $$(".screen.active").forEach((s) => s.classList.remove("active"));
    const el = $("#" + r.el);
    el.classList.remove("active");
    void el.offsetWidth;               // restart entrance animation
    el.classList.add("active");

    if (r.nav) syncNav(r.nav);
    window.scrollTo({ top: 0, behavior: "instant" });
    $(".app-main").scrollTop = 0;

    if (r.init) r.init(params, query);
    closeAllPopovers();
  }

  function syncNav(nav) {
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === nav));
  }

  /* ============================================================
     LANDING
     ============================================================ */
  function initLanding() {
    const swap = $("#tag-swap");
    if (!swap || swap._t) { return; }
    swap._t = 0;
    const spans = $$("span", swap);
    const tick = () => {
      spans.forEach((s, i) => s.classList.toggle("on", i === swap._t % spans.length));
      swap._t++;
    };
    tick();
    if (swap._timer) clearInterval(swap._timer);
    swap._timer = setInterval(tick, 2600);
  }

  /* ============================================================
     AUTH
     ============================================================ */
  function wireOtp(boxes, onDone) {
    boxes.forEach((b, i) => {
      b.addEventListener("input", () => {
        b.value = b.value.replace(/\D/g, "").slice(0, 1);
        b.classList.toggle("is-filled", !!b.value);
        if (b.value && boxes[i + 1]) boxes[i + 1].focus();
        if (boxes.every((x) => x.value)) onDone();
      });
      b.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !b.value && boxes[i - 1]) boxes[i - 1].focus();
      });
    });
  }

  function initLogin() {
    const form = $("#login-form");
    if (form._wired) return; form._wired = true;
    const otpArea = $("#otp-area"), sendBtn = $("#send-otp"), verifyBtn = $("#verify-otp");
    const phoneField = $("#login-phone-field"), phoneInput = $("#login-phone");
    const boxes = $$(".otp-box", otpArea);
    wireOtp(boxes, () => verifyBtn.focus());

    sendBtn.addEventListener("click", () => {
      if (!/^\d{10}$/.test(phoneInput.value.trim())) {
        phoneField.classList.add("is-error"); phoneInput.focus();
        toast("Please enter a valid 10-digit mobile number", "error");
        return;
      }
      phoneField.classList.remove("is-error");
      sendBtn.classList.add("is-loading");
      setTimeout(() => {
        sendBtn.classList.remove("is-loading");
        otpArea.classList.remove("hide");
        sendBtn.classList.add("hide");
        $("#login-hint").textContent = "OTP sent to +91 " + phoneInput.value.trim() + " · demo code 4 2 6 8";
        boxes[0].focus();
        toast("OTP sent", "info", "A 4-digit code was sent by SMS & WhatsApp");
        let n = 24;
        const res = $("#resend-otp");
        res.disabled = true;
        const iv = setInterval(() => {
          res.textContent = `Resend in ${n--}s`;
          if (n < 0) { clearInterval(iv); res.disabled = false; res.textContent = "Resend OTP"; }
        }, 1000);
      }, 900);
    });

    verifyBtn.addEventListener("click", () => {
      if (!boxes.every((x) => x.value)) { toast("Enter the 4-digit OTP", "warning"); boxes.find((x) => !x.value).focus(); return; }
      verifyBtn.classList.add("is-loading");
      setTimeout(() => { location.hash = "#/home"; toast("Welcome back, Kavita", "success", "Signed in securely with OTP"); }, 800);
    });

    /* live validation feedback */
    phoneInput.addEventListener("input", () => phoneField.classList.toggle("is-error", phoneInput.value.length > 0 && !/^\d{10}$/.test(phoneInput.value.trim())));
  }

  function initSignup() {
    const card = $("#screen-signup");
    if (card._wired) return; card._wired = true;
    $$(".role-card", card).forEach((c) =>
      c.addEventListener("click", () => {
        $$(".role-card", card).forEach((x) => x.setAttribute("aria-pressed", "false"));
        c.setAttribute("aria-pressed", "true");
        $("#signup-role-error").classList.add("hide");
      })
    );
    $("#signup-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#su-name").value.trim();
      const role = $(".role-card[aria-pressed='true']", card);
      if (!role) { $("#signup-role-error").classList.remove("hide"); return; }
      if (name.length < 2) { $("#su-name-field").classList.add("is-error"); $("#su-name").focus(); return; }
      $("#su-name-field").classList.remove("is-error");
      const btn = $("button[type=submit]", e.target);
      btn.classList.add("is-loading");
      setTimeout(() => {
        location.hash = "#/home";
        toast("Account created", "success", `Welcome, ${esc(name.split(" ")[0])} — profile is 80% complete`);
      }, 900);
    });
  }

  /* ============================================================
     HOME DASHBOARD
     ============================================================ */
  function initHome() {
    const d = new Date();
    $("#home-date").textContent = d.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    const ics = $("#home-ics");
    if (ics && !ics._wired) { ics._wired = true; ics.addEventListener("click", () => toast("Calendar invite downloaded", "success", "MT-420815.ics · reminder 30 min before")); }
  }

  /* ============================================================
     AI ASSISTANT — scripted triage chat + voice simulation
     ============================================================ */
  const chat = { step: 0, started: false, listening: false };

  function chatScroll() { const sc = $("#chat-scroll"); sc.scrollTop = sc.scrollHeight; }
  function nowTime() { return new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" }); }

  function addMsg(who, html, chips) {
    const sc = $("#chat-scroll");
    const wrap = document.createElement("div");
    wrap.className = `msg msg--${who}`;
    const badge = who === "ai"
      ? `<span class="ai-badge">${icon("logo")}</span>`
      : `<span class="avatar avatar--sm"><img src="assets/img/kavita.jpg" alt="Kavita (you)"></span>`;
    wrap.innerHTML = `${badge}<div><div class="msg__bubble">${html}${chips ? `<div class="chips-in">${chips.map((c) => `<button class="chip" type="button">${esc(c)}</button>`).join("")}</div>` : ""}</div><time>${nowTime()}</time></div>`;
    sc.appendChild(wrap);
    chatScroll();
    if (chips) $$(".chip", wrap).forEach((c) => c.addEventListener("click", () => { c.parentElement.remove(); userSays(c.textContent, true); }));
    return wrap;
  }

  function aiTyping(cb, delay) {
    const sc = $("#chat-scroll");
    const tp = document.createElement("div");
    tp.className = "msg msg--ai";
    tp.innerHTML = `<span class="ai-badge">${icon("logo")}</span><div><div class="msg__bubble"><span class="typing" aria-label="Assistant is typing"><i></i><i></i><i></i></span></div></div>`;
    sc.appendChild(tp); chatScroll();
    setTimeout(() => { tp.remove(); cb(); }, delay || 1100);
  }

  function userSays(text, fromChip) {
    addMsg("user", esc(text));
    const offline = document.body.classList.contains("is-offline");
    if (offline) {
      setTimeout(() => addMsg("ai", `<span class="chip chip--static" style="border-style:dashed;border-color:var(--amber-500);color:#8A5B00;background:var(--amber-100)">${icon("clock", "icon--sm")} Queued offline — will sync when you’re back online</span>`), 450);
      return;
    }
    advance(fromChip);
  }

  function advance() {
    const script = D.CHAT_SCRIPT[lang()] || D.CHAT_SCRIPT.en;
    aiTyping(() => {
      if (chat.step < script.followups.length) {
        const f = script.followups[chat.step++];
        addMsg("ai", md(f.ai), f.chips);
      } else {
        addMsg("ai", md(script.closing), []);
        showAnalyzeCta();
      }
    });
  }

  function showAnalyzeCta() {
    const sc = $("#chat-scroll");
    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.padding = "6px 0 10px";
    div.innerHTML = `<button class="btn btn--primary" id="btn-analyze">${icon("activity")} <span>Run triage analysis</span></button>`;
    sc.appendChild(div); chatScroll();
    $("#btn-analyze").addEventListener("click", runAnalysis, { once: true });
  }

  function runAnalysis() {
    const script = D.CHAT_SCRIPT[lang()] || D.CHAT_SCRIPT.en;
    const ov = $("#analyzing-overlay");
    $("#analyzing-text").textContent = script.analyzing;
    ov.classList.remove("hide");
    setTimeout(() => { ov.classList.add("hide"); location.hash = "#/triage-result"; }, 2100);
  }

  function initAssistant() {
    const input = $("#chat-input"), send = $("#chat-send"), mic = $("#chat-mic");
    if (chat.started) return;
    chat.started = true;
    const script = D.CHAT_SCRIPT[lang()] || D.CHAT_SCRIPT.en;
    setTimeout(() => aiTyping(() => addMsg("ai", md(script.intro), [lang() === "en" ? "I have fever" : lang() === "hi" ? "बुखार है" : "ताप आहे"])), 500);

    send.addEventListener("click", sendText);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendText(); });
    $$("#quick-chips .chip").forEach((c) => c.addEventListener("click", () => userSays(c.textContent.trim())));
    function sendText() {
      const v = input.value.trim();
      if (!v) return;
      input.value = "";
      userSays(v);
    }

    mic.addEventListener("click", () => {
      if (chat.listening) return;
      const sc = D.CHAT_SCRIPT[lang()] || D.CHAT_SCRIPT.en;
      chat.listening = true;
      mic.classList.add("is-live");
      const vp = $("#voice-panel"), heard = $("#voice-heard");
      $("#voice-lang").textContent = sc.listening;
      vp.classList.add("is-on");
      heard.textContent = "";
      /* progressively reveal recognized words */
      const words = sc.heard.split(" ");
      let i = 0;
      const iv = setInterval(() => {
        heard.textContent = words.slice(0, ++i).join(" ") + (i < words.length ? " …" : "");
        if (i >= words.length) clearInterval(iv);
      }, 190);
      setTimeout(() => {
        chat.listening = false;
        mic.classList.remove("is-live");
        vp.classList.remove("is-on");
        userSays(sc.heard);
      }, 190 * words.length + 700);
    });
  }

  /* ============================================================
     TRIAGE RESULT — animate meters
     ============================================================ */
  function animateMeters() {
    $$(".screen.active .meter > span").forEach((m) => {
      const w = m.dataset.w || "0%";
      m.style.width = "0%";
      requestAnimationFrame(() => setTimeout(() => (m.style.width = w), 120));
    });
  }

  function initTriage() {
    animateMeters();
    const triSave = $("#tri-save");
    if (triSave && !triSave._wired) { triSave._wired = true; triSave.addEventListener("click", () => toast("Saved to your records", "success", "Triage of 30/09/2026 added to your timeline")); }
  }

  /* ============================================================
     DOCTOR SEARCH + MAP
     ============================================================ */
  const finder = { spec: "All", mode: null, today: false, q: "", sort: "reco" };

  function starRow(r) {
    let out = "";
    for (let i = 1; i <= 5; i++) out += `<svg class="icon ${i <= Math.round(r) ? "" : "off"}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    return `<span class="stars" role="img" aria-label="Rated ${r} out of 5">${out}</span>`;
  }

  function docCard(doc) {
    const modes = doc.modes.map((m) => `<span class="mode-ico" title="${m === "video" ? "Video consult" : "In-person"}">${icon(m === "video" ? "video" : "building")}</span>`).join("");
    return `<article class="card card--hover doc-card" data-doc="${doc.id}" tabindex="0" role="link" aria-label="View profile of ${esc(doc.name)}, ${esc(doc.specialty)}">
      <span class="avatar"><img src="${doc.img}" alt="Portrait of ${esc(doc.name)}"><span class="online" title="Online now"></span></span>
      <div style="flex:1;min-width:0">
        <h3>${esc(doc.name)} ${doc.id === "asha" ? `<span class="verified">${icon("shield-check")} Verified</span>` : ""}</h3>
        <div class="spec">${esc(doc.specialty)} · ${doc.exp} yrs exp</div>
        <div class="meta">
          <span>${starRow(doc.rating)} <b style="color:var(--text)">${doc.rating}</b> (${doc.reviews.toLocaleString("en-IN")})</span>
          <span>${icon("map-pin")} ${doc.distanceKm} km · ${esc(doc.hospital.split(",")[0])}</span>
          <span>${modes}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${doc.langs.map((l) => `<span class="chip chip--lang chip--static">${esc(l)}</span>`).join("")}</div>
        <div class="doc-card__foot">
          <span class="fee">₹${doc.fee} <small>/ consult</small></span>
          <span class="next-slot">${icon("clock", "icon--sm")} ${esc(doc.next)}</span>
          <button class="btn btn--primary btn--sm book" data-book="${doc.id}">${esc(t("action.book"))}</button>
        </div>
      </div>
    </article>`;
  }

  function filteredDocs() {
    let list = D.DOCTORS.filter((d) => {
      if (finder.spec !== "All" && d.specialty !== finder.spec) return false;
      if (finder.mode && !d.modes.includes(finder.mode)) return false;
      if (finder.today && !/^Today/.test(d.next)) return false;
      if (finder.q) {
        const hay = (d.name + d.specialty + d.hospital + d.langs.join(" ")).toLowerCase();
        if (!hay.includes(finder.q.toLowerCase())) return false;
      }
      return true;
    });
    if (finder.sort === "near") list = list.slice().sort((a, b) => a.distanceKm - b.distanceKm);
    if (finder.sort === "top") list = list.slice().sort((a, b) => b.rating - a.rating);
    if (finder.sort === "fee") list = list.slice().sort((a, b) => a.fee - b.fee);
    return list;
  }

  function renderDocs() {
    const list = filteredDocs();
    const box = $("#doc-list");
    $("#result-count").textContent = `${list.length} doctor${list.length === 1 ? "" : "s"} available`;
    if (!list.length) {
      box.innerHTML = `<div class="card empty">${icon("search", "icon--xl")}<h3>No doctors match your filters</h3><p>Try clearing a filter or searching for another specialty.</p><button class="btn btn--secondary btn--sm" id="clear-filters" style="margin-top:14px">Clear all filters</button></div>`;
      $("#clear-filters").addEventListener("click", () => { finder.spec = "All"; finder.mode = null; finder.today = false; finder.q = ""; $("#doc-search").value = ""; syncFinderUi(); renderDocs(); });
    } else {
      box.innerHTML = list.map(docCard).join("");
      $$(".doc-card", box).forEach((c) => {
        const id = c.dataset.doc;
        c.addEventListener("click", (e) => { if (e.target.closest("[data-book]")) return; location.hash = "#/doctor/" + id; });
        c.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = "#/doctor/" + id; });
        $("[data-book]", c).addEventListener("click", () => (location.hash = "#/doctor/" + id + "?pick=1"));
      });
    }
    renderPins(list);
  }

  function renderPins(list) {
    const g = $("#map-pins");
    if (!g) return;
    g.innerHTML = list.map((d) => `
      <g class="map-pin" data-pin="${d.id}" tabindex="0" role="button" aria-label="${esc(d.name)} on map" transform="translate(${d.pin.x}%, ${d.pin.y}%)">
        <circle class="pulse" r="14" fill="rgba(38,141,209,.35)"></circle>
        <circle class="pin-body" r="13" fill="var(--blue-600)" stroke="#fff" stroke-width="2.5"></circle>
        <text text-anchor="middle" dy="4" font-size="11" font-weight="700" fill="#fff" style="pointer-events:none">${d.specialty[0]}</text>
      </g>`).join("");
    $$(".map-pin", g).forEach((p) => {
      const id = p.dataset.pin;
      const open = () => (location.hash = "#/doctor/" + id);
      p.addEventListener("click", open);
      p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      p.addEventListener("mouseenter", () => { const card = $(`.doc-card[data-doc="${id}"]`); card && card.classList.add("is-pin-hover"); });
      p.addEventListener("mouseleave", () => { const card = $(`.doc-card[data-doc="${id}"]`); card && card.classList.remove("is-pin-hover"); });
    });
  }

  function syncFinderUi() {
    $$("#spec-chips .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.spec === finder.spec)));
    $$("#mode-chips .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.mode === finder.mode || (c.dataset.mode === "today") === ("" + finder.today) && false)));
    $('#mode-chips .chip[data-mode="video"]').setAttribute("aria-pressed", String(finder.mode === "video"));
    $('#mode-chips .chip[data-mode="person"]').setAttribute("aria-pressed", String(finder.mode === "person"));
    $('#mode-chips .chip[data-mode="today"]').setAttribute("aria-pressed", String(finder.today));
    $("#sort-sel").value = finder.sort;
  }

  function initDoctors(params, query) {
    const box = $("#doc-list");
    /* skeleton shimmer while “fetching” */
    box.innerHTML = skeletonCards(3, () => `<div class="card card--pad"><div style="display:flex;gap:16px"><div class="skeleton" style="width:74px;height:74px;border-radius:50%"></div><div style="flex:1;display:grid;gap:10px"><div class="skeleton" style="width:55%;height:18px"></div><div class="skeleton" style="width:35%"></div><div class="skeleton" style="width:80%"></div><div class="skeleton" style="width:48%;height:28px"></div></div></div></div>`);

    const q = query.get("q");
    if (q !== null) { finder.q = q; $("#doc-search").value = q; }

    setTimeout(renderDocs, 620);

    if (!$("#screen-doctors")._wired) {
      $("#screen-doctors")._wired = true;
      $("#doc-search").addEventListener("input", (e) => { finder.q = e.target.value; renderDocs(); });
      $$("#spec-chips .chip").forEach((c) => c.addEventListener("click", () => { finder.spec = c.dataset.spec; syncFinderUi(); renderDocs(); }));
      $$("#mode-chips .chip").forEach((c) => c.addEventListener("click", () => {
        if (c.dataset.mode === "today") finder.today = !finder.today;
        else finder.mode = finder.mode === c.dataset.mode ? null : c.dataset.mode;
        syncFinderUi(); renderDocs();
      }));
      $("#sort-sel").addEventListener("change", (e) => { finder.sort = e.target.value; renderDocs(); });
      $("#doc-more-filters").addEventListener("click", () => {
        openModal(`<form style="display:grid;gap:18px" onsubmit="return false">
          <div class="field"><label class="field__label" for="mf-lang">Doctor speaks</label>
            <select class="select" id="mf-lang"><option>Any language</option><option lang="hi">हिन्दी</option><option lang="mr">मराठी</option><option>English</option></select></div>
          <div class="field"><label class="field__label" for="mf-fee">Max consultation fee</label>
            <input type="range" id="mf-fee" min="199" max="999" value="799" style="accent-color:var(--blue-600)" oninput="this.nextElementSibling.textContent='Up to ₹'+this.value">
            <span class="field__hint">Up to ₹799</span></div>
          <div class="field"><span class="field__label">Availability window</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip is-active" type="button" aria-pressed="true">Morning</button><button class="chip" type="button" aria-pressed="false">Afternoon</button><button class="chip is-active" type="button" aria-pressed="true">Evening</button></div></div>
          <label class="check"><input type="checkbox"><span class="box">${icon("check")}</span><span style="font-size:var(--fs-14)">Female doctors only</span></label>
        </form>`, {
          title: "All filters", label: "All filters",
          foot: `<button class="btn btn--ghost" data-close>Reset</button><button class="btn btn--primary" data-close id="mf-apply">Show 6 doctors</button>`,
          onMount(w) { $$(".chip", w).forEach((c) => c.addEventListener("click", () => c.classList.toggle("is-active"))); }
        });
      });
    }
    syncFinderUi();
  }

  /* ============================================================
     DOCTOR PROFILE + AVAILABILITY
     ============================================================ */
  const pick = { day: 0, slot: null };

  function initDoctorProfile(params, query) {
    const doc = D.DOCTORS.find((d) => d.id === params[0]) || D.DOCTORS[0];
    pick.day = 0; pick.slot = null;
    const root = $("#dp-root");
    root.innerHTML = `
      <div class="card profile-hero card--hover-none">
        <span class="avatar"><img src="${doc.img}" alt="Portrait of ${esc(doc.name)}"><span class="online"></span></span>
        <div>
          <h1>${esc(doc.name)} <span class="verified">${icon("shield-check")} Verified · NMC ${String(40000 + doc.id.length * 137)}</span></h1>
          <div class="spec" style="color:var(--blue-700);font-weight:600">${esc(doc.specialty)} · ${esc(doc.quals)}</div>
          <div class="profile-facts">
            <span>${icon("award")} ${doc.exp} years experience</span>
            <span>${icon("map-pin")} ${esc(doc.hospital)} · ${doc.distanceKm} km</span>
            <span>${starRow(doc.rating)} <b style="color:var(--text)">${doc.rating}</b>&nbsp;(${doc.reviews.toLocaleString("en-IN")} reviews)</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${doc.langs.map((l) => `<span class="chip chip--lang chip--static">${esc(l)}</span>`).join("")}</div>
        </div>
        <div class="cta-col" style="display:grid;gap:10px;justify-items:end">
          <div style="text-align:right"><b style="font-size:var(--fs-24);font-family:var(--font-display)">₹${doc.videoFee}</b> <span class="muted">/ video consult</span></div>
          <button class="btn btn--primary" id="dp-book-top">${icon("calendar-check")} ${esc(t("action.book"))}</button>
          <span class="next-slot">${icon("clock", "icon--sm")} Next: ${esc(doc.next)}</span>
        </div>
      </div>

      <div class="profile-grid">
        <div style="display:grid;gap:24px">
          <section class="card card--pad">
            <div class="card__title"><h3>About</h3></div>
            <p style="line-height:var(--lh-loose)">${esc(doc.about)}</p>
            <hr class="hairline" style="margin:18px 0">
            <div class="small-caps" style="margin-bottom:10px">Consultation modes</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${doc.modes.includes("video") ? `<span class="badge badge--info badge--lg">${icon("video")} Video consult · ₹${doc.videoFee}</span>` : ""}
              ${doc.modes.includes("person") ? `<span class="badge badge--neutral badge--lg">${icon("building")} In-person · ₹${doc.fee}</span>` : ""}
            </div>
            <hr class="hairline" style="margin:18px 0">
            <div class="small-caps" style="margin-bottom:10px">Why patients trust ${esc(doc.name.split(" ")[1] || doc.name)}</div>
            <div class="cond-row"><div class="lbl"><span>Explains clearly in my language</span><span>96%</span></div><div class="meter meter--green"><span data-w="96%"></span></div></div>
            <div class="cond-row"><div class="lbl"><span>On-time consultations</span><span>93%</span></div><div class="meter meter--green"><span data-w="93%"></span></div></div>
            <div class="cond-row"><div class="lbl"><span>Waits and listens patiently</span><span>98%</span></div><div class="meter meter--green"><span data-w="98%"></span></div></div>
          </section>
          <section class="card card--pad">
            <div class="card__title"><h3>Recent patient reviews</h3><span class="badge badge--neutral">${doc.reviews.toLocaleString("en-IN")} total</span></div>
            ${review("Sunita P.", 5, "Video consult · Hindi", "Doctor listened very patiently and explained everything in simple Hindi. Got the prescription on WhatsApp right after the call.")}
            ${review("Amit K.", 5, "In-person", "Very professional. The clinic is clean and the appointment started on time. Highly recommended.")}
            ${review("Farah N.", 4, "Video consult · English", "Good experience overall — the call quality dropped once but the app reconnected automatically within seconds.")}
          </section>
        </div>

        <section class="card card--pad avail" aria-label="Availability calendar">
          <div class="card__title"><h3>This week’s availability</h3><span class="badge badge--info">${icon("video")} Video</span></div>
          <div class="avail__days" id="avail-days"></div>
          <div class="avail__legend">
            <span><i style="background:var(--blue-50);border:1.5px solid var(--blue-200)"></i>Available</span>
            <span><i style="background:var(--surface-2);border:1.5px solid var(--border)"></i>Booked</span>
            <span><i style="background:var(--blue-600)"></i>Selected</span>
          </div>
          <hr class="hairline" style="margin:16px 0">
          <div id="pick-bar"></div>
        </section>
      </div>`;

    function review(name, stars, tag, textP) {
      return `<div class="cond-row"><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><span class="avatar avatar--sm avatar--initials">${esc(name[0])}</span><div><b style="font-size:var(--fs-14)">${name}</b><div style="display:flex;gap:8px;align-items:center">${starRow(stars)}<span class="muted" style="font-size:var(--fs-12)">${tag}</span></div></div></div><p style="font-size:var(--fs-14);color:var(--text-muted);line-height:1.6">${textP}</p></div>`;
    }

    const days = D.weekDays();
    const daysEl = $("#avail-days", root);
    daysEl.innerHTML = days.map((d, i) => {
      const slots = D.slotsFor(doc.id, i);
      return `<div class="day-col ${i === pick.day ? "is-selected" : ""}" data-day="${i}">
        <div class="day-head">${esc(d.dow)}<b>${d.dayNum}</b></div>
        ${slots.map((s) => `<button class="slot" data-time="${s.time}" ${s.booked ? "disabled" : ""} aria-pressed="false">${s.time}</button>`).join("")}
      </div>`;
    }).join("");

    $$(".day-col", daysEl).forEach((col) => {
      $$(".slot:not([disabled])", col).forEach((s) => s.addEventListener("click", () => {
        // simulate real-time lock: slot may have just been taken
        $$(".slot", daysEl).forEach((x) => x.setAttribute("aria-pressed", "false"));
        $$(".day-col", daysEl).forEach((x) => x.classList.toggle("is-selected", x === col));
        s.setAttribute("aria-pressed", "true");
        pick.day = +col.dataset.day; pick.slot = s.dataset.time;
        renderPickBar();
      }));
    });

    function renderPickBar() {
      const bar = $("#pick-bar", root);
      if (!pick.slot) {
        bar.innerHTML = `<p class="muted" style="font-size:var(--fs-14);text-align:center;padding:6px 0">${icon("clock", "icon--sm")} Select a time slot to continue — slots are locked for you for 5 minutes.</p>`;
        return;
      }
      const d = days[pick.day];
      bar.innerHTML = `<div style="display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap">
          <div style="display:flex;gap:12px;align-items:center"><span class="tile tile--soft" style="width:40px;height:40px">${icon("calendar-check")}</span>
          <div><b>${d.dow} ${d.label} · ${pick.slot}</b><br><span class="muted" style="font-size:var(--fs-12)">Video consult with ${esc(doc.name)}</span></div></div>
          <button class="btn btn--primary" id="pick-continue">${esc(t("action.continue"))} ${icon("arrow-right")}</button></div>`;
      $("#pick-continue", bar).addEventListener("click", () => {
        sessionStorage.setItem("mt-pick", JSON.stringify({ docId: doc.id, day: pick.day, slot: pick.slot, date: d.label }));
        location.hash = `#/book/${doc.id}`;
      });
    }
    renderPickBar();

    $("#dp-book-top", root).addEventListener("click", () => {
      $("#avail-days").scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Pick any available slot below", "info");
    });
    if (query.get("pick")) setTimeout(() => $("#avail-days").scrollIntoView({ behavior: "smooth", block: "center" }), 350);

    /* animate trust meters */
    initTriage();
  }

  /* ============================================================
     BOOKING FLOW (3 steps)
     ============================================================ */
  const booking = { step: 1, type: "video", reason: "", name: "Kavita Deshmukh", phone: "98220 44567", age: "45", forWhom: "self" };

  function initBooking(params) {
    const doc = D.DOCTORS.find((d) => d.id === params[0]) || D.DOCTORS[0];
    let p = null;
    try { p = JSON.parse(sessionStorage.getItem("mt-pick")); } catch (e) { }
    const days = D.weekDays();
    const sel = p && p.docId === doc.id ? p : { docId: doc.id, day: 1, slot: "10:30", date: days[1].label };
    const day = days[Math.min(sel.day, 6)];
    booking.step = 1;
    const root = $("#book-root");

    function shell(step, bodyHtml, footHtml) {
      const steps = ["Choose slot & type", "Patient details", "Review & pay"];
      return `<div class="stepper" role="list" aria-label="Booking progress">
          ${steps.map((s, i) => {
        const n = i + 1, st = n < step ? "is-done" : n === step ? "is-active" : "";
        return `${i ? `<span class="line ${n <= step ? "is-done" : ""}"></span>` : ""}
              <span class="step ${st}" role="listitem"><span class="n">${n < step ? icon("check", "icon--sm") : n}</span><span class="txt">${s}</span></span>`;
      }).join("")}
        </div>
        ${bodyHtml}
        <div style="display:flex;gap:12px;justify-content:space-between;margin-top:24px;flex-wrap:wrap">${footHtml}</div>`;
    }

    function docSummary() {
      return `<div class="card" style="padding:18px;display:flex;gap:16px;align-items:center;margin-bottom:24px">
        <span class="avatar avatar--md"><img src="${doc.img}" alt=""></span>
        <div style="flex:1"><b>${esc(doc.name)}</b><div class="muted" style="font-size:var(--fs-14)">${esc(doc.specialty)} · ${esc(doc.hospital)}</div></div>
        <span class="badge badge--info">${icon(day && booking.type === "video" ? "video" : "building")} ${booking.type === "video" ? "Video consult" : "In-person"}</span>
        <div style="text-align:right"><b style="font-family:var(--font-display)">${day.dow} ${day.dayNum}/${String(day.date.getMonth() + 1).padStart(2, "0")}</b><div class="muted" style="font-size:var(--fs-14)">${sel.slot} IST</div></div>
      </div>`;
    }

    function render() {
      if (booking.step === 1) {
        root.innerHTML = shell(1,
          docSummary() +
          `<div class="card card--pad">
            <div class="card__title"><h3>Consultation type</h3></div>
            <div class="role-grid" style="margin-bottom:22px">
              <button type="button" class="role-card" data-type="video" aria-pressed="${booking.type === "video"}">
                <span class="tile tile--blue">${icon("video")}</span><b>Video consult</b><span>From anywhere · report included</span><span class="tick">${icon("check", "icon--sm")}</span>
              </button>
              <button type="button" class="role-card" data-type="person" aria-pressed="${booking.type === "person"}" ${doc.modes.includes("person") ? "" : "disabled style='opacity:.5;pointer-events:none'"}>
                <span class="tile tile--teal">${icon("building")}</span><b>In-person visit</b><span>${doc.modes.includes("person") ? esc(doc.hospital) : "Not offered by this doctor"}</span><span class="tick">${icon("check", "icon--sm")}</span>
              </button>
            </div>
            <div class="field"><label class="field__label" for="bk-reason">Reason for visit <span class="muted" style="font-weight:400">(optional)</span></label>
            <textarea class="textarea" id="bk-reason" data-i18n-attr="placeholder" placeholder="Fever since 2 days, body ache…">${esc(booking.reason)}</textarea>
            <span class="field__hint">${icon("lock", "icon--sm")} Shared only with your doctor · end-to-end encrypted</span></div>
          </div>`,
          `<a class="btn btn--ghost" href="#/doctor/${doc.id}">${icon("arrow-left")} ${esc(t("action.back"))}</a>
           <button class="btn btn--primary" id="bk-next">${esc(t("action.continue"))} ${icon("arrow-right")}</button>`);
        $$(".role-card", root).forEach((c) => c.addEventListener("click", () => { booking.type = c.dataset.type; render(); }));
        $("#bk-reason").addEventListener("input", (e) => (booking.reason = e.target.value));
        $("#bk-next").addEventListener("click", () => { booking.step = 2; render(); });
      }

      if (booking.step === 2) {
        root.innerHTML = shell(2,
          docSummary() +
          `<div class="card card--pad">
            <div class="card__title"><h3>Who is this consultation for?</h3>
              <div class="segmented segmented--sm"><button type="button" id="for-self" aria-pressed="${booking.forWhom === "self"}">Myself</button><button type="button" id="for-other" aria-pressed="${booking.forWhom === "other"}">Family member</button></div></div>
            <form id="bk-form" style="display:grid;gap:18px" novalidate>
              <div class="field" id="bk-name-field"><label class="field__label" for="bk-name">Full name</label>
                <input class="input" id="bk-name" value="${esc(booking.name)}" autocomplete="name">
                <span class="field__error">${icon("alert-triangle", "icon--sm")} Please enter the patient’s full name</span></div>
              <div style="display:grid;grid-template-columns:2fr 1fr;gap:18px">
                <div class="field" id="bk-phone-field"><label class="field__label" for="bk-phone">Mobile number</label>
                  <div class="input-prefix"><span class="prefix">+91</span><input id="bk-phone" inputmode="numeric" value="${esc(booking.phone)}" autocomplete="tel"></div>
                  <span class="field__error">${icon("alert-triangle", "icon--sm")} Enter a valid 10-digit number</span></div>
                <div class="field"><label class="field__label" for="bk-age">Age</label>
                  <input class="input" id="bk-age" inputmode="numeric" maxlength="3" value="${esc(booking.age)}"></div>
              </div>
              <label class="check"><input type="checkbox" checked><span class="box">${icon("check")}</span><span style="font-size:var(--fs-14)">Share my triage summary & past records with the doctor <span class="muted">(ABHA linked, revocable anytime)</span></span></label>
            </form>
          </div>`,
          `<button class="btn btn--ghost" id="bk-back">${icon("arrow-left")} ${esc(t("action.back"))}</button>
           <button class="btn btn--primary" id="bk-next2">${esc(t("action.continue"))} ${icon("arrow-right")}</button>`);
        $("#for-self").addEventListener("click", () => { booking.forWhom = "self"; $("#for-self").setAttribute("aria-pressed", "true"); $("#for-other").setAttribute("aria-pressed", "false"); });
        $("#for-other").addEventListener("click", () => { booking.forWhom = "other"; $("#for-other").setAttribute("aria-pressed", "true"); $("#for-self").setAttribute("aria-pressed", "false"); });
        $("#bk-back").addEventListener("click", () => { booking.step = 1; render(); });
        $("#bk-next2").addEventListener("click", () => {
          const name = $("#bk-name").value.trim();
          const phone = $("#bk-phone").value.replace(/\s/g, "");
          let ok = true;
          $("#bk-name-field").classList.toggle("is-error", name.length < 3); ok = ok && name.length >= 3;
          $("#bk-phone-field").classList.toggle("is-error", !/^\d{10}$/.test(phone)); ok = ok && /^\d{10}$/.test(phone);
          if (!ok) { toast("Please fix the highlighted fields", "error"); return; }
          booking.name = name; booking.phone = phone; booking.age = $("#bk-age").value;
          booking.step = 3; render();
        });
      }

      if (booking.step === 3) {
        const fee = booking.type === "video" ? doc.videoFee : doc.fee, platform = 29;
        root.innerHTML = shell(3,
          docSummary() +
          `<div class="card card--pad">
            <div class="card__title"><h3>Review booking</h3></div>
            <dl>
              ${row("Patient", `${esc(booking.name)} · ${esc(booking.age)} yrs`)}
              ${row("Contact", `+91 ${esc(booking.phone)}`)}
              ${row("Schedule", `${day.dow}, ${day.label} at ${sel.slot} IST`)}
              ${row("Consultation fee", `₹${fee}`)}
              ${row("Platform fee", `₹${platform}`)}
            </dl>
            <hr class="hairline" style="margin:8px 0">
            <div class="review-line" style="border:0"><dt style="font-weight:700;color:var(--text)">Total</dt><dd style="font-family:var(--font-display);font-size:var(--fs-20)">₹${fee + platform}</dd></div>
            <div class="field-warn" style="margin-top:14px">${icon("info")}<span>Your slot is held for <b>4:59</b>. If payment isn’t completed, it will be released automatically and shown as available to other patients.</span></div>
          </div>`,
          `<button class="btn btn--ghost" id="bk-back3">${icon("arrow-left")} ${esc(t("action.back"))}</button>
           <button class="btn btn--primary btn--lg" id="bk-confirm">${icon("lock")} Pay ₹${fee + platform} & ${esc(t("action.confirm"))}</button>`);
        function row(k, v) { return `<div class="review-line"><dt>${k}</dt><dd>${v}</dd></div>`; }
        $("#bk-back3").addEventListener("click", () => { booking.step = 2; render(); });
        $("#bk-confirm").addEventListener("click", (e) => {
          const btn = e.currentTarget;
          btn.classList.add("is-loading");
          setTimeout(() => {
            btn.classList.remove("is-loading");
            const wantConflict = sessionStorage.getItem("mt-conflict") === "1";
            if (wantConflict) {
              sessionStorage.setItem("mt-conflict", "0");
              sessionStorage.setItem("mt-book-last", JSON.stringify({ docId: doc.id, day: sel.day, slot: sel.slot, date: day.label }));
              location.hash = "#/booking-conflict";
            } else {
              const id = "MT-" + (100000 + Math.floor(Math.random() * 899999));
              sessionStorage.setItem("mt-book-last", JSON.stringify({ docId: doc.id, day: sel.day, slot: sel.slot, date: day.label, type: booking.type, bookingId: id, name: booking.name }));
              location.hash = "#/booking-success";
              toast(t("toast.booked"), "success", `${doc.name} · ${day.label} ${sel.slot}`);
            }
          }, 1300);
        });
      }
    }
    render();
  }

  function initBookingSuccess() {
    let b; try { b = JSON.parse(sessionStorage.getItem("mt-book-last")); } catch (e) { }
    if (!b) b = { docId: "asha", date: "01/10/2026", slot: "10:30", type: "video", bookingId: "MT-420815", name: "Kavita Deshmukh" };
    const doc = D.DOCTORS.find((d) => d.id === b.docId) || D.DOCTORS[0];
    $("#bs-root").innerHTML = `
      <div class="card success-hero" style="max-width:640px;margin:0 auto">
        <span class="check-pop">${icon("check")}</span>
        <h1 style="font-size:var(--fs-28)">${esc(t("toast.booked"))}</h1>
        <p class="muted" style="margin-top:8px">A confirmation SMS & WhatsApp message has been sent to +91 98220 44567.</p>
        <div class="booking-id">${icon("check-circle")} ${esc(b.bookingId)}</div>
        <div class="card" style="text-align:left;padding:18px;display:flex;gap:14px;align-items:center;margin:6px 0 22px">
          <span class="avatar avatar--md"><img src="${doc.img}" alt=""></span>
          <div style="flex:1"><b>${esc(doc.name)}</b><div class="muted" style="font-size:var(--fs-14)">${esc(doc.specialty)}</div></div>
          <span class="badge badge--info">${icon("video")} ${b.type === "video" ? "Video" : "In-person"}</span>
          <div style="text-align:right"><b>${esc(b.date)}</b><div class="muted" style="font-size:var(--fs-14)">${esc(b.slot)} IST</div></div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn--secondary" id="bs-ics">${icon("download")} Add to calendar</button>
          <a class="btn btn--primary" href="#/call">${icon("video")} ${esc(t("action.joinCall"))}</a>
          <a class="btn btn--ghost" href="#/home">${esc(t("nav.home"))}</a>
        </div>
      </div>`;
    $("#bs-ics").addEventListener("click", () => {
      toast("Calendar invite downloaded", "success", `${b.bookingId}.ics saved — reminder set for 30 min before`);
    });
  }

  function initBookingConflict() {
    let b; try { b = JSON.parse(sessionStorage.getItem("mt-book-last")); } catch (e) { }
    if (!b) b = { docId: "asha", day: 1, slot: "10:30", date: "01/10/2026" };
    const doc = D.DOCTORS.find((d) => d.id === b.docId) || D.DOCTORS[0];
    const slots = D.slotsFor(doc.id, b.day).filter((s) => !s.booked).slice(0, 4);
    $("#bc-root").innerHTML = `
      <div class="card success-hero fail-hero" style="max-width:640px;margin:0 auto">
        <span class="check-pop">${icon("x")}</span>
        <h1 style="font-size:var(--fs-28)">This slot was just booked</h1>
        <p class="muted" style="margin-top:8px">Another patient confirmed <b>${esc(b.slot)} on ${esc(b.date)}</b> while you were reviewing. You weren’t charged.</p>
        <div class="card" style="text-align:left;padding:20px;margin:22px 0">
          <div class="small-caps" style="margin-bottom:12px">Nearest available with ${esc(doc.name)}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${slots.map((s) => `<button class="slot" style="padding:11px 16px" data-alt="${s.time}">${s.time}</button>`).join("") || `<span class="badge badge--warning">No slots left tomorrow — pick another day</span>`}
          </div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn--secondary" href="#/doctor/${doc.id}">${icon("calendar")} Choose another day</a>
          <a class="btn btn--ghost" href="#/doctors">Find similar doctors</a>
        </div>
      </div>`;
    $$("#bc-root [data-alt]").forEach((sBtn) => sBtn.addEventListener("click", () => {
      sessionStorage.setItem("mt-pick", JSON.stringify({ docId: doc.id, day: b.day, slot: sBtn.dataset.alt, date: b.date }));
      toast("New slot locked for you", "success", `${b.date} · ${sBtn.dataset.alt}`);
      location.hash = "#/book/" + doc.id;
    }));
  }

  /* ============================================================
     VIDEO CALL — waiting room → live → wrap-up
     ============================================================ */
  function initCall() {
    const root = $("#screen-call");
    if (root._wired) { resetCall(); return; }
    root._wired = true;

    let secs = root._secs || 0;
    const fmt = () => `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

    function stopTimer() { if (root._timer) { clearInterval(root._timer); root._timer = null; } }
    function startTimer() {
      stopTimer(); secs = 0; root._secs = 0;
      root._timer = setInterval(() => { secs++; root._secs = secs; $("#call-timer").textContent = fmt(); }, 1000);
    }

    function resetCall() {
      $("#wait-room").classList.remove("hide");
      $("#live-call").classList.add("hide");
      stopTimer(); secs = 0; root._secs = 0; $("#call-timer").textContent = "00:00";
      $("#join-status").textContent = "";
      $("#net-warn").classList.toggle("is-on", document.body.classList.contains("is-offline"));
    }
    root._reset = resetCall;

    /* waiting-room device diagnostics settle */
    if (!root._netChecked) {
      root._netChecked = true;
      setTimeout(() => {
        const li = $("#net-check-li");
        if (li && li.querySelector(".spin")) li.innerHTML = `${icon("check-circle")} Connection · excellent, 84 ms — HD quality selected`;
      }, 1800);
    }

    /* waiting-room device check then join */
    $("#wait-join").addEventListener("click", () => {
      if (document.body.classList.contains("is-offline")) {
        toast(t("error.offline"), "error", "Video consults need an internet connection. Try the voice-call option or reconnect.");
        return;
      }
      const btn = $("#wait-join");
      btn.classList.add("is-loading");
      const status = $("#join-status");
      status.textContent = t("call.connecting");
      setTimeout(() => {
        btn.classList.remove("is-loading");
        $("#wait-room").classList.add("hide");
        $("#live-call").classList.remove("hide");
        toast("Secure channel established", "success", "End-to-end encrypted · WebRTC");
        startTimer();
      }, 1500);
    });

    /* controls */
    $("#ctrl-mic").addEventListener("click", function () {
      const off = this.classList.toggle("is-off");
      this.setAttribute("aria-pressed", String(off));
      this.innerHTML = icon(off ? "mic-off" : "mic");
      $("#ctrl-mic-lbl").textContent = off ? "Unmute" : "Mute";
      toast(off ? "Microphone muted" : "Microphone on", off ? "warning" : "info");
    });
    $("#ctrl-cam").addEventListener("click", function () {
      const off = this.classList.toggle("is-off");
      this.setAttribute("aria-pressed", String(off));
      this.innerHTML = icon(off ? "video-off" : "video");
      $("#ctrl-cam-lbl").textContent = off ? "Start video" : "Stop video";
      $("#self-view").classList.toggle("is-off", off);
      if (off) $("#self-view").innerHTML = `<span class="avatar avatar--lg avatar--initials" style="width:64px;height:64px">K</span><span class="tag">You · camera off</span>`;
      else $("#self-view").innerHTML = `<img src="assets/img/kavita.jpg" alt="Your camera preview"><span class="tag">You</span>`;
    });
    const drawers = { chat: $("#drawer-chat"), notes: $("#drawer-notes") };
    function toggleDrawer(which) {
      const target = drawers[which];
      const open = target.classList.contains("is-open");
      Object.values(drawers).forEach((d) => d.classList.remove("is-open"));
      $$("#live-call .ctrl[data-drawer]").forEach((c) => c.classList.remove("is-off"));
      if (!open) { target.classList.add("is-open"); $(`#ctrl-${which}`).classList.add("is-off"); }
    }
    $("#ctrl-chat").addEventListener("click", () => toggleDrawer("chat"));
    $("#ctrl-notes").addEventListener("click", () => toggleDrawer("notes"));
    $$(".call__drawer [data-close-drawer]").forEach((b) => b.addEventListener("click", () => {
      Object.values(drawers).forEach((d) => d.classList.remove("is-open"));
    }));

    $("#call-chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = $("#call-chat-input");
      const v = inp.value.trim(); if (!v) return;
      const box = $("#call-chat-msgs");
      box.insertAdjacentHTML("beforeend", `<div class="cmsg"><b>You</b>${esc(v)}</div>`);
      inp.value = ""; box.scrollTop = box.scrollHeight;
      setTimeout(() => {
        box.insertAdjacentHTML("beforeend", `<div class="cmsg"><b>Dr. Mehta</b>Yes, I can see it. Noted in your chart.</div>`);
        box.scrollTop = box.scrollHeight;
      }, 1200);
    });

    /* poor-network simulation + reconnect */
    $("#sim-net").addEventListener("click", () => {
      const w = $("#net-warn");
      if (w.classList.contains("is-on")) return;
      w.classList.add("is-on");
      $("#call-quality").innerHTML = `${icon("wifi")} Weak`;
      setTimeout(() => { if (w.classList.contains("is-on")) toast("Connection unstable", "warning", "We lowered video quality to keep the call going"); }, 600);
    });
    $("#btn-reconnect").addEventListener("click", function () {
      this.classList.add("is-loading");
      setTimeout(() => {
        this.classList.remove("is-loading");
        $("#net-warn").classList.remove("is-on");
        $("#call-quality").innerHTML = `${icon("wifi")} HD`;
        toast("Reconnected", "success", "Call quality restored to HD");
      }, 1400);
    });

    /* end-call flow */
    $("#ctrl-end").addEventListener("click", () => {
      openModal(`<p style="margin-bottom:6px">End this consultation after <b>${fmt()}</b>?</p>
        <p class="muted" style="font-size:var(--fs-14)">The AI-drafted summary will be prepared for the doctor to verify, then shared to your records.</p>`, {
        title: "End consultation?",
        label: "End consultation confirmation",
        foot: `<button class="btn btn--ghost" data-close>${esc(t("action.cancel"))}</button>
               <button class="btn btn--danger" id="confirm-end">${icon("phone-off")} End call</button>`,
        onMount(wrap, close) {
          $("#confirm-end", wrap).addEventListener("click", () => {
            close();
            stopTimer();
            openModal(`<div style="text-align:center;padding:8px 0 4px">
                <h3 style="margin-bottom:6px">How was your consultation?</h3>
                <p class="muted" style="font-size:var(--fs-14);margin-bottom:16px">Your feedback keeps doctors accountable.</p>
                <div class="stars stars--lg" id="fb-stars" style="justify-content:center;gap:8px;transform:scale(1.5);margin-bottom:22px">${[1, 2, 3, 4, 5].map((i) => `<button class="fb-star" data-n="${i}" aria-label="${i} star" style="background:none;border:0;color:#D5DEE4;cursor:pointer"><svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>`).join("")}</div>
              </div>`, {
              title: "Consultation ended", label: "Rate your consultation",
              foot: `<a class="btn btn--ghost" href="#/home">Skip</a>
                     <button class="btn btn--primary" id="fb-done">Submit & view summary</button>`,
              onMount(w2, c2) {
                $$(".fb-star", w2).forEach((s) => s.addEventListener("click", () => {
                  const n = +s.dataset.n;
                  $$(".fb-star", w2).forEach((x) => (x.style.color = +x.dataset.n <= n ? "var(--amber-500)" : "#D5DEE4"));
                }));
                $("#fb-done", w2).addEventListener("click", () => { c2(); location.hash = "#/summary"; toast("Thanks for your feedback", "success"); });
              }
            });
          });
        }
      });
    });

    resetCall();
  }

  /* ============================================================
     SUMMARY EDITOR (doctor’s AI-draft review)
     ============================================================ */
  function initSummary() {
    const root = $("#screen-summary");
    if (root._wired) return; root._wired = true;

    $$("[data-cmd]", root).forEach((b) => b.addEventListener("click", () => {
      document.execCommand(b.dataset.cmd === "ul" ? "insertUnorderedList" : b.dataset.cmd, false, null);
      $("#editor-area", root).focus();
    }));

    $("#add-rx", root).addEventListener("click", () => {
      const tbody = $("#rx-body", root);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><input value="" placeholder="Medicine name"></td><td><input placeholder="500 mg"></td><td><input placeholder="1-0-1"></td><td><input placeholder="5 days"></td>
        <td><button class="iconbtn rx-del" aria-label="Remove medicine">${icon("x", "icon--sm")}</button></td>`;
      tbody.appendChild(tr);
      $("input", tr).focus();
    });
    root.addEventListener("click", (e) => {
      const del = e.target.closest(".rx-del");
      if (del) del.closest("tr").remove();
    });

    $("#save-draft", root).addEventListener("click", function () {
      this.classList.add("is-loading");
      setTimeout(() => { this.classList.remove("is-loading"); toast(t("toast.saved"), "success", "Draft visible only to you until signed"); }, 800);
    });
    $("#approve-sign", root).addEventListener("click", function () {
      this.classList.add("is-loading");
      setTimeout(() => {
        this.classList.remove("is-loading");
        openModal(`<div style="text-align:center;padding:6px 0">
            <span class="check-pop" style="width:76px;height:76px;margin:0 auto 16px;border-radius:50%;background:var(--green-100);color:var(--green-700);display:grid;place-items:center">${icon("check", "icon--lg")}</span>
            <h3 style="margin-bottom:6px">Notes signed & shared</h3>
            <p class="muted" style="font-size:var(--fs-14)">The verified summary and e-prescription were added to Kavita’s ABHA-linked records (FHIR DocumentReference) and appear in her timeline.</p></div>`, {
          title: "Signed", label: "Summary signed",
          foot: `<a class="btn btn--primary" href="#/records" data-close>${icon("folder")} View patient timeline</a>`
        });
      }, 900);
    });
  }

  /* ============================================================
     RECORDS / TIMELINE
     ============================================================ */
  function initRecords() {
    const root = $("#screen-records");
    renderTimeline("all");
    if (root._wired) return; root._wired = true;
    $$("#rec-filters button", root).forEach((b) => b.addEventListener("click", () => {
      $$("#rec-filters button", root).forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      renderTimeline(b.dataset.f);
    }));
    $("#rec-share").addEventListener("click", () => toast("Secure link copied", "success", "Timeline read access for 24h · audit-logged"));
    $("#rec-bundle").addEventListener("click", () => toast("Preparing FHIR bundle…", "info", "6 documents · encrypted ZIP will download shortly"));
  }

  function docRow(d) {
    return `<div style="display:flex;gap:10px;align-items:center;background:var(--surface-2);border-radius:10px;padding:10px 12px;margin-top:8px">
      ${icon("file-text")} <span style="flex:1;font-weight:600">${esc(d.name)} <span class="muted" style="font-weight:400">· ${d.size}</span></span>
      <button class="btn btn--secondary btn--sm" data-view="${esc(d.name)}">${icon("eye")} View</button>
      <button class="btn btn--ghost btn--sm" data-dl="${esc(d.name)}" aria-label="Download ${esc(d.name)}">${icon("download")}</button></div>`;
  }

  function renderTimeline(filter) {
    const list = $("#rec-list");
    const items = D.TIMELINE.filter((x) => filter === "all" || x.type === filter);
    $$("#rec-filters .cnt").forEach((c) => {
      const f = c.parentElement.dataset.f;
      c.textContent = f === "all" ? D.TIMELINE.length : D.TIMELINE.filter((x) => x.type === f).length;
    });
    list.innerHTML = items.map((x) => `
      <div class="tl-item ${x.variant ? "tl-item--" + x.variant : ""}">
        <div class="muted" style="font-size:var(--fs-12);font-weight:700;letter-spacing:.04em;margin-bottom:6px">${esc(x.date)} · ${esc(x.time)}</div>
        <div class="tl-card" data-tl="${x.id}" tabindex="0" role="button" aria-expanded="false">
          <div class="head">
            <span class="tile ${x.type === "record" ? "tile--violet" : x.type === "triage" ? "tile--blue" : x.type === "vitals" ? "tile--green" : "tile--teal"}" style="width:38px;height:38px;border-radius:11px">${icon(x.icon)}</span>
            <div style="flex:1;min-width:0"><b style="color:var(--text)">${esc(x.title)}</b><div class="muted" style="font-size:var(--fs-13,13px)">${esc(x.sub)}</div></div>
            ${x.type === "triage" ? `<span class="urgency urgency--urgent" style="padding:5px 12px;font-size:var(--fs-12)">${icon("alert-triangle")} ${esc(t("urgency.urgent"))}</span>` : ""}
            ${icon("chevron-down", "rot")}
          </div>
          <div class="detail"><div class="inner"><p style="line-height:var(--lh-loose)">${esc(x.detail)}</p>${x.docs.map(docRow).join("")}</div></div>
        </div>
      </div>`).join("");

    $$(".tl-card", list).forEach((card) => {
      const toggle = () => {
        const open = card.classList.toggle("is-open");
        card.setAttribute("aria-expanded", String(open));
      };
      card.addEventListener("click", (e) => { if (e.target.closest("button")) return; toggle(); });
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    });
    $$("[data-dl]", list).forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      toast("Download started", "info", `${b.dataset.dl} · encrypted, audit-logged`);
    }));
    $$("[data-view]", list).forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(`<div class="doc-viewer"><div class="doc-page">
          <h3>${icon("logo", "icon--lg")} MediTriage e-Prescription <span class="badge badge--success">${icon("check-circle")} Verified</span></h3>
          <p><b>Patient:</b> Kavita Deshmukh (45/F) · ABHA 91-XXXX-XX54</p>
          <p><b>Doctor:</b> Dr. Rohan Mehta, Cardiology · Reg. 40167</p>
          <p><b>Date:</b> 24/09/2026 · Video consult (22 min)</p>
          <hr class="hairline" style="margin:12px 0">
          <b>Rx</b>
          <ol style="padding-left:20px;margin:8px 0 12px">
            <li>Metoprolol 25 mg — 1 tab twice daily × 30 days</li>
            <li>Pantoprazole 40 mg — 1 tab before breakfast × 15 days</li>
            <li>ORS / fluids — as needed</li>
          </ol>
          <b>Advice</b>
          <p style="margin:6px 0">Reduce caffeine, 30-min daily walk, monitor pulse twice daily with OxyGo. Review in 4 weeks or sooner if chest pain recurs.</p>
          <hr class="hairline" style="margin:12px 0">
          <p class="muted" style="font-size:var(--fs-12)">Digitally signed · FHIR R4 DocumentReference · ${esc(b.dataset.view)}</p>
        </div></div>`, {
        title: b.dataset.view, label: "Record viewer", wide: true,
        foot: `<button class="btn btn--ghost" data-close>Close</button>
               <button class="btn btn--secondary" id="dv-share">${icon("share-2")} Share with doctor</button>
               <button class="btn btn--primary" id="dv-dl">${icon("download")} Download PDF</button>`,
        onMount(w, close) {
          $("#dv-dl", w).addEventListener("click", () => { toast("Download started", "info", `${b.dataset.view} · encrypted`); });
          $("#dv-share", w).addEventListener("click", () => { toast("Secure link copied", "success", "Expires in 24 hours · view is audit-logged"); });
        }
      });
    }));
  }

  /* ============================================================
     ADMIN ANALYTICS
     ============================================================ */
  function initAdmin() {
    const line = $("#adm-line");
    if (line && !line._done) {
      line._done = true;
      const pts = D.ADMIN.line.series, W = 660, H = 240, P = 34;
      const max = Math.max(...pts) * 1.08, min = Math.min(...pts) * 0.82;
      const X = (i) => P + (i * (W - P * 1.4)) / (pts.length - 1);
      const Y = (v) => H - P - ((v - min) / (max - min)) * (H - P * 1.6);
      const path = pts.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
      const area = path + ` L${X(pts.length - 1)},${H - P} L${P},${H - P} Z`;
      line.innerHTML = `
        <svg class="chart-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="Consultations per day, rising trend from 420 to 1386">
          <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#268DD1" stop-opacity=".28"/><stop offset="1" stop-color="#268DD1" stop-opacity="0"/></linearGradient></defs>
          ${[0, 1, 2, 3].map((i) => `<line x1="${P}" x2="${W - 10}" y1="${P + (i * (H - P * 1.6)) / 3}" y2="${P + (i * (H - P * 1.6)) / 3}" stroke="var(--border)" stroke-dasharray="3 5"/>`).join("")}
          <path d="${area}" fill="url(#areaGrad)"/>
          <path class="line" d="${path}" fill="none" stroke="#268DD1" stroke-width="3" stroke-linecap="round"/>
          <circle class="dot" cx="${X(pts.length - 1)}" cy="${Y(pts[pts.length - 1])}" r="6" fill="#268DD1" stroke="#fff" stroke-width="3" style="animation-delay:1.4s"/>
          <text x="${X(pts.length - 1) - 8}" y="${Y(pts[pts.length - 1]) - 14}" text-anchor="end" font-size="13" font-weight="700" fill="#1A6FA8">1,386</text>
          ${D.ADMIN.line.labels.map((l, i) => `<text x="${P + (i * (W - P * 1.4)) / 6}" y="${H - 10}" text-anchor="middle" font-size="11" fill="var(--text-muted)">Sep ${l}</text>`).join("")}
        </svg>`;
    }
    const donut = $("#adm-donut");
    if (donut && !donut._done) {
      donut._done = true;
      const total = D.ADMIN.donut.reduce((a, s) => a + s.value, 0);
      const C = 2 * Math.PI * 44; let off = 0;
      donut.querySelector("svg").innerHTML = D.ADMIN.donut.map((s) => {
        const frac = s.value / total, len = frac * C;
        const seg = `<circle cx="70" cy="70" r="44" fill="none" stroke="${s.color.replace(/var\((--chart-\d)\)/, (_, v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim())}" stroke-width="20"
            stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 70 70)">
            <title>${s.label}: ${s.value}%</title></circle>`;
        off += len; return seg;
      }).join("") + `<text x="70" y="66" text-anchor="middle" font-size="20" font-weight="700" fill="var(--text)" font-family="Poppins">14.2k</text>
        <text x="70" y="84" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">consults/mo</text>`;
      donut.querySelector(".legend").innerHTML = D.ADMIN.donut.map((s) => `<li><i style="background:${s.color}"></i>${s.label}<b>${s.value}%</b></li>`).join("");
    }
    const bars = $("#adm-bars");
    if (bars && !bars._done) {
      bars._done = true;
      const s = D.ADMIN.bars.series, max = Math.max(...s);
      bars.innerHTML = `<svg class="bars" viewBox="0 0 380 190" role="img" aria-label="New signups per weekday">
        ${s.map((v, i) => `<rect x="${22 + i * 50}" y="${170 - (v / max) * 140}" width="28" height="${(v / max) * 140}" rx="7" fill="${i === 5 ? "#FFA726" : "#268DD1"}" style="animation-delay:${i * 70}ms"><title>${D.ADMIN.bars.labels[i]}: ${v}</title></rect>
          <text x="${36 + i * 50}" y="186" text-anchor="middle" font-size="11" fill="var(--text-muted)">${D.ADMIN.bars.labels[i]}</text>`).join("")}
      </svg>`;
    }
    const tb = $("#adm-users");
    if (tb && !tb._done) {
      tb._done = true;
      tb.innerHTML = D.ADMIN.users.map((u) => `<tr>
        <td><div style="display:flex;gap:10px;align-items:center"><span class="avatar avatar--sm avatar--initials">${esc(u.name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span><div><b style="color:var(--text)">${esc(u.name)}</b><div class="muted" style="font-size:var(--fs-12)">${esc(u.meta)}</div></div></div></td>
        <td><span class="role-tag role-tag--${u.role}">${u.role}</span></td>
        <td class="muted">${esc(u.joined)}</td>
        <td><span class="badge ${u.status === "Verified" || u.status === "Active" ? "badge--success" : "badge--warning"}">${u.status}</span></td>
      </tr>`).join("");
    }
  }

  /* ============================================================
     VITALS
     ============================================================ */
  function initVitals() {
    const r = $("#spo2-ring");
    if (r && !r._done) {
      r._done = true;
      const C = 2 * Math.PI * 60;
      setTimeout(() => { r.style.strokeDashoffset = String(C * (1 - 0.97)); }, 250);
    }
  }

  /* ============================================================
     GLOBAL CHROME — header, popovers, language, launchpad
     ============================================================ */
  function closeAllPopovers() {
    $$(".popover").forEach((p) => p.remove());
  }

  function buildGlobal() {
    /* language switchers */
    let prevLang = lang();
    document.addEventListener("click", (e) => {
      const lb = e.target.closest("[data-lang-btn]");
      if (lb) window.MTI18N.set(lb.dataset.langBtn);
    });
    document.addEventListener("mt:lang", (e) => {
      if (e.detail.lang !== prevLang) { prevLang = e.detail.lang; toast(`Language: ${t("lang." + prevLang)}`, "info"); }
    });

    /* notifications */
    $("#btn-bell").addEventListener("click", (e) => {
      e.stopPropagation();
      const existing = $("#notif-pop");
      if (existing) { existing.remove(); return; }
      const pop = document.createElement("div");
      pop.className = "popover"; pop.id = "notif-pop";
      pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Notifications");
      pop.innerHTML = `<div class="popover__head"><b>Notifications</b><button class="btn btn--ghost btn--sm" id="mark-read">Mark all read</button></div>
        ${D.NOTIFICATIONS.map((n) => `<div class="notif ${n.unread ? "is-unread" : ""}"><span class="tile ${n.tone}">${icon(n.icon)}</span><div style="flex:1"><strong>${n.title}</strong><p>${n.body}</p></div><time>${n.time}</time></div>`).join("")}`;
      $(".header-actions").appendChild(pop);
      pop.addEventListener("click", (ev) => ev.stopPropagation());
      $("#mark-read", pop).addEventListener("click", () => {
        $$(".notif", pop).forEach((n) => n.classList.remove("is-unread"));
        $("#bell-dot").classList.add("hide");
        toast("All notifications marked as read", "info");
      });
      document.addEventListener("click", closeAllPopovers, { once: true });
    });

    /* profile */
    $("#btn-profile").addEventListener("click", (e) => {
      e.stopPropagation();
      if ($("#profile-pop")) { $("#profile-pop").remove(); return; }
      const pop = document.createElement("div");
      pop.className = "popover"; pop.id = "profile-pop";
      pop.style.width = "260px";
      pop.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;padding:16px 18px">
          <span class="avatar avatar--md"><img src="assets/img/kavita.jpg" alt=""></span>
          <div><b>Kavita Deshmukh</b><div class="muted" style="font-size:var(--fs-12)">Patient · ABHA linked ${icon("check-circle", "icon--sm")}</div></div>
        </div>
        <hr class="hairline">
        <a href="#/records" class="sidenav" style="border-radius:10px">${icon("folder")} My records</a>
        <a href="#/vitals" class="sidenav" style="border-radius:10px">${icon("activity")} My devices</a>
        <a href="styleguide.html" class="sidenav" style="border-radius:10px">${icon("book-open")} Design system</a>
        <hr class="hairline">
        <a href="#/" class="sidenav" style="border-radius:10px;color:var(--red-700)">${icon("log-out")} Sign out</a>`;
      $(".header-actions").appendChild(pop);
      pop.addEventListener("click", (ev) => { if (ev.target.closest("a")) closeAllPopovers(); ev.stopPropagation(); });
      document.addEventListener("click", closeAllPopovers, { once: true });
    });

    /* global search → doctor finder */
    $("#global-search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#global-search").value.trim();
      location.hash = "#/doctors" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    /* network chip — demo control for offline flows */
    $("#net-chip").addEventListener("click", () => {
      setOnline(document.body.classList.contains("is-offline"));
    });

    /* mobile “More” sheet */
    $("#tab-more").addEventListener("click", () => {
      openModal(`<div style="display:grid;gap:4px">
        <a class="sidenav" href="#/vitals" data-close>${icon("activity")} Vitals &amp; devices</a>
        <a class="sidenav" href="#/summary" data-close>${icon("edit-2")} Consult notes (doctor)</a>
        <a class="sidenav" href="#/admin" data-close>${icon("trending-up")} Analytics (admin)</a>
        <a class="sidenav" href="styleguide.html">${icon("book-open")} Design system</a>
        <hr class="hairline" style="margin:10px 0">
        <a class="sidenav" href="#/" data-close style="color:var(--red-700)">${icon("log-out")} Sign out</a>
      </div>`, { title: "More", label: "More sections" });
    });
    window.addEventListener("offline", () => setOnline(false, true));
    window.addEventListener("online", () => setOnline(true, true));

    /* launchpad (screen index + review tools) */
    $("#launch-fab").addEventListener("click", () => {
      $("#launchpad").classList.toggle("hide");
      $("#launch-fab").setAttribute("aria-expanded", String(!$("#launchpad").classList.contains("hide")));
    });
    $$("#launchpad a").forEach((a) => a.addEventListener("click", () => $("#launchpad").classList.add("hide")));
    $("#lp-offline").addEventListener("click", () => setOnline(document.body.classList.contains("is-offline")));
    $("#lp-offline2").addEventListener("click", () => { if (!document.body.classList.contains("is-offline")) setOnline(false); });
    $("#lp-conflict").addEventListener("click", () => {
      sessionStorage.setItem("mt-conflict", "1");
      toast("Conflict demo armed", "warning", "Next booking confirmation will show the ‘slot just taken’ state");
      $("#launchpad").classList.add("hide");
    });
    $("#lp-device").addEventListener("click", function () {
      const on = document.body.classList.toggle("device-phone");
      this.setAttribute("aria-pressed", String(on));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeAllPopovers(); $("#launchpad").classList.add("hide"); }
    });
  }

  /* ---------------- boot ---------------- */
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    buildGlobal();
    route();
  });
})();
