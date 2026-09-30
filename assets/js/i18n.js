/* ============================================================
   MediTriage AI — i18n (English · हिन्दी · मराठी)
   Fallback chain: mr/hi → en. Devanagari strings carry proper
   lang attributes in markup; numerals/dates use DD/MM/YYYY.
   ============================================================ */
(function () {
  "use strict";

  const I18N = {
    en: {
      "app.name": "MediTriage AI",
      "nav.home": "Home", "nav.assistant": "AI Assistant", "nav.doctors": "Find Doctors",
      "nav.records": "Records", "nav.vitals": "Vitals", "nav.more": "More", "nav.admin": "Analytics",
      "nav.summary": "Consult Notes", "nav.appointments": "Appointments",

      "action.book": "Book Appointment", "action.cancel": "Cancel", "action.confirm": "Confirm",
      "action.continue": "Continue", "action.back": "Back", "action.save": "Save",
      "action.send": "Send", "action.reschedule": "Reschedule", "action.login": "Log in",
      "action.getStarted": "Get Started", "action.startTriage": "Start AI Triage",
      "action.findDoctor": "Find a Doctor", "action.download": "Download", "action.share": "Share",
      "action.viewAll": "View all", "action.joinCall": "Join Video Call",

      "landing.tagline": "Stay Home, Consult Online",
      "landing.heroSub": "Voice-first AI triage in your language, verified doctors, and secure video consultations — built for every Indian household, from metros to the last mile.",
      "triage.prompt": "Describe your symptoms…",
      "urgency.routine": "Routine", "urgency.moderate": "Moderate", "urgency.urgent": "Urgent",
      "search.placeholder": "Search by specialty or location",
      "call.connecting": "Connecting to Doctor…",
      "error.offline": "No Internet Connection",
      "offline.line": "You are offline — showing saved data. New triage will be queued and synced.",
      "toast.booked": "Appointment Confirmed",
      "toast.saved": "Consultation notes saved",
      "toast.synced": "Back online — queued items synced",

      "lang.en": "English", "lang.hi": "हिन्दी", "lang.mr": "मराठी",
      "a11y.langSwitch": "Change language (English / हिन्दी / मराठी)"
    },

    hi: {
      "app.name": "मेडीट्रिएज AI",
      "nav.home": "होम", "nav.assistant": "AI सहायक", "nav.doctors": "डॉक्टर खोजें",
      "nav.records": "रिकॉर्ड", "nav.vitals": "वाइटल्स", "nav.more": "और", "nav.admin": "एनालिटिक्स",
      "nav.summary": "परामर्श नोट्स", "nav.appointments": "अपॉइंटमेंट",

      "action.book": "अपॉइंटमेंट बुक करें", "action.cancel": "रद्द करें", "action.confirm": "पुष्टि करें",
      "action.continue": "जारी रखें", "action.back": "वापस", "action.save": "सहेजें",
      "action.send": "भेजें", "action.reschedule": "पुनः निर्धारित करें", "action.login": "लॉग इन",
      "action.getStarted": "शुरू करें", "action.startTriage": "AI जाँच शुरू करें",
      "action.findDoctor": "डॉक्टर खोजें", "action.download": "डाउनलोड", "action.share": "साझा करें",
      "action.viewAll": "सभी देखें", "action.joinCall": "वीडियो कॉल जॉइन करें",

      "landing.tagline": "घर पर रहें, ऑनलाइन सलाह लें",
      "landing.heroSub": "आपकी भाषा में वॉइस-आधारित AI जाँच, सत्यापित डॉक्टर और सुरक्षित वीडियो परामर्श — शहर से गाँव तक, हर भारतीय घर के लिए।",
      "triage.prompt": "अपनी शिकायत बताएं…",
      "urgency.routine": "सामान्य", "urgency.moderate": "मध्यम", "urgency.urgent": "तत्काल",
      "search.placeholder": "विशेषज्ञता या स्थान से खोजें",
      "call.connecting": "चिकित्सक से कनेक्ट हो रहा है…",
      "error.offline": "कोई इंटरनेट कनेक्शन नहीं",
      "offline.line": "आप ऑफ़लाइन हैं — सहेजा गया डेटा दिखाया जा रहा है। नई जाँच कतार में रहेगी।",
      "toast.booked": "अपॉइंटमेंट की पुष्टि हो गई",
      "toast.saved": "परामर्श नोट्स सहेजे गए",
      "toast.synced": "वापस ऑनलाइन — कतारबद्ध आइटम सिंक हो गए",

      "lang.en": "English", "lang.hi": "हिन्दी", "lang.mr": "मराठी",
      "a11y.langSwitch": "भाषा बदलें (English / हिन्दी / मराठी)"
    },

    mr: {
      "app.name": "मेडीट्रिएज AI",
      "nav.home": "मुख्यपृष्ठ", "nav.assistant": "AI सहाय्यक", "nav.doctors": "डॉक्टर शोधा",
      "nav.records": "रेकॉर्ड्स", "nav.vitals": "व्हायटल्स", "nav.more": "आणखी", "nav.admin": "अॅनालिटिक्स",
      "nav.summary": "सल्ला नोंदी", "nav.appointments": "भेटी",

      "action.book": "नियुक्ती बुक करा", "action.cancel": "रद्द करा", "action.confirm": "निश्चित करा",
      "action.continue": "पुढे जा", "action.back": "मागे", "action.save": "जतन करा",
      "action.send": "पाठवा", "action.reschedule": "पुन्हा शेड्यूल करा", "action.login": "लॉग इन",
      "action.getStarted": "सुरू करा", "action.startTriage": "AI तपासणी सुरू करा",
      "action.findDoctor": "डॉक्टर शोधा", "action.download": "डाउनलोड करा", "action.share": "शेअर करा",
      "action.viewAll": "सर्व पहा", "action.joinCall": "व्हिडिओ कॉलमध्ये सहभागी व्हा",

      "landing.tagline": "घरात रहा, ऑनलाइन सल्ला घ्या",
      "landing.heroSub": "तुमच्या भाषेत व्हॉइस-आधारित AI तपासणी, सत्यापित डॉक्टर आणि सुरक्षित व्हिडिओ सल्ला — शहरापासून गावापर्यंत प्रत्येक भारतीय घरासाठी.",
      "triage.prompt": "आपली लक्षणे सांगा…",
      "urgency.routine": "सामान्य", "urgency.moderate": "मध्यम", "urgency.urgent": "तातडीचे",
      "search.placeholder": "विशेषज्ञता किंवा ठिकाणानुसार शोधा",
      "call.connecting": "डॉक्टरशी संपर्क साधत आहे…",
      "error.offline": "इंटरनेट कनेक्शन नाही",
      "offline.line": "तुम्ही ऑफलाइन आहात — जतन केलेला डेटा दाखवला जात आहे. नवीन तपासणी रांगेत राहील.",
      "toast.booked": "नियुक्ती पुष्टी झाली",
      "toast.saved": "सल्ला नोंदी जतन केल्या",
      "toast.synced": "पुन्हा ऑनलाइन — रांगेतील नोंदी सिंक झाल्या",

      "lang.en": "English", "lang.hi": "हिन्दी", "lang.mr": "मराठी",
      "a11y.langSwitch": "भाषा बदला (English / हिन्दी / मराठी)"
    }
  };

  let current = localStorage.getItem("mt-lang") || "en";

  function t(key) {
    return (I18N[current] && I18N[current][key]) || I18N.en[key] || key;
  }

  function apply(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (el.hasAttribute("data-i18n-attr")) el.setAttribute(el.getAttribute("data-i18n-attr"), val);
      else el.textContent = val;
    });
    document.documentElement.lang = current === "en" ? "en" : current;
    document.querySelectorAll("[data-lang-btn]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.langBtn === current))
    );
    document.dispatchEvent(new CustomEvent("mt:lang", { detail: { lang: current } }));
  }

  function set(lang) {
    if (!I18N[lang]) return;
    current = lang;
    localStorage.setItem("mt-lang", lang);
    apply();
  }

  window.MTI18N = { I18N, t, apply, set, get: () => current };
  document.addEventListener("DOMContentLoaded", () => apply());
})();
