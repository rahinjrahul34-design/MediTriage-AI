/* ============================================================
   MediTriage AI — DEMO DATA  (stands in for REST/FHIR APIs)
   Doctors, slots, timeline, notifications, charts, vitals.
   In production these map to FHIR R4 resources:
   Practitioner · Schedule/Slot · Appointment · Observation ·
   DocumentReference · Consent (ABDM/ABHA linked).
   ============================================================ */
(function () {
  "use strict";

  const DOCTORS = [
    {
      id: "asha", name: "Dr. Ananya Sharma", specialty: "General Medicine",
      quals: "MBBS, MD (Internal Medicine)", exp: 14, rating: 4.9, reviews: 1240,
      langs: ["English", "हिन्दी", "मराठी"], modes: ["video", "person"],
      fee: 399, distanceKm: 1.2, hospital: "Apollo Clinic, Pune",
      img: "assets/img/doctor-asha.jpg",
      about: "General physician specialising in primary care, fevers and chronic disease management. Known for patient-friendly explanations in Hindi and Marathi.",
      next: "Today, 4:30 PM", pin: { x: 46, y: 34 }, videoFee: 399
    },
    {
      id: "rohan", name: "Dr. Rohan Mehta", specialty: "Cardiology",
      quals: "MBBS, MD, DM (Cardiology)", exp: 17, rating: 4.8, reviews: 968,
      langs: ["English", "हिन्दी"], modes: ["video", "person"],
      fee: 899, distanceKm: 3.8, hospital: "HeartCare Institute, Pune",
      img: "assets/img/doctor-rohan.jpg",
      about: "Interventional cardiologist focused on preventive heart health, hypertension and post-discharge tele follow-ups.",
      next: "Today, 6:00 PM", pin: { x: 63, y: 52 }, videoFee: 899
    },
    {
      id: "priya", name: "Dr. Priya Nair", specialty: "Pediatrics",
      quals: "MBBS, DCH", exp: 9, rating: 4.9, reviews: 2105,
      langs: ["English", "हिन्दी", "தமிழ்"], modes: ["video"],
      fee: 499, distanceKm: 2.4, hospital: "Rainbow Children's Clinic",
      img: "assets/img/doctor-priya.jpg",
      about: "Pediatrician for newborn care, nutrition, vaccination guidance and childhood infections — consults over video across 4 states.",
      next: "Tomorrow, 10:00 AM", pin: { x: 30, y: 60 }, videoFee: 499
    },
    {
      id: "arjun", name: "Dr. Arjun Desai", specialty: "Dermatology",
      quals: "MBBS, MD (Dermatology)", exp: 11, rating: 4.7, reviews: 812,
      langs: ["English", "हिन्दी", "ગુજરાતી"], modes: ["video", "person"],
      fee: 649, distanceKm: 4.6, hospital: "SkinFirst Centre, Pune",
      img: "assets/img/doctor-arjun.jpg",
      about: "Dermatologist for acne, eczema and pigmentation; supports photo-based asynchronous reviews between video visits.",
      next: "Today, 8:15 PM", pin: { x: 74, y: 28 }, videoFee: 649
    },
    {
      id: "vikram", name: "Dr. Vikram Kulkarni", specialty: "Orthopedics",
      quals: "MBBS, MS (Ortho)", exp: 26, rating: 4.8, reviews: 1560,
      langs: ["English", "मराठी", "हिन्दी"], modes: ["person"],
      fee: 749, distanceKm: 5.1, hospital: "Kulkarni Bone & Joint Care",
      img: "assets/img/doctor-vikram.jpg",
      about: "Senior orthopedic surgeon for joint pain, arthritis and fracture follow-ups; first consults and reviews available online.",
      next: "Tomorrow, 12:30 PM", pin: { x: 22, y: 40 }, videoFee: 749
    },
    {
      id: "asha2", name: "Dr. Meera Iyer", specialty: "Gynecology",
      quals: "MBBS, DGO", exp: 13, rating: 4.8, reviews: 990,
      langs: ["English", "हिन्दी"], modes: ["video"],
      fee: 599, distanceKm: 6.3, hospital: "Sakhi Women's Health (Online)",
      img: "assets/img/kavita.jpg",
      about: "Gynecologist offering private, judgment-free video consults for menstrual health, pregnancy care and menopause guidance.",
      next: "Today, 5:45 PM", pin: { x: 55, y: 72 }, videoFee: 599
    }
  ];

  /* Deterministic slot generator — stable per doctor+day so the
     demo behaves consistently; ~30% slots pre-booked, one slot
     engineered to be “just taken” for the conflict demo.       */
  const SLOT_TIMES = ["09:00", "09:45", "10:30", "11:15", "12:00", "16:00", "16:45", "17:30", "18:15", "19:00"];

  function seedNum(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function weekDays() {
    const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      out.push({
        idx: i, date: d,
        dayNum: String(d.getDate()).padStart(2, "0"),
        dow: i === 0 ? "Today" : fmt.format(d),
        iso: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
      });
    }
    return out;
  }

  function slotsFor(doctorId, dayIdx) {
    return SLOT_TIMES.map((t, i) => {
      const s = seedNum(doctorId + ":" + dayIdx + ":" + t);
      const past = dayIdx === 0 && i < 2; // earlier today is gone
      const booked = past || s % 10 < 3;
      return { time: t, booked };
    });
  }

  const TIMELINE = [
    {
      id: "tl1", type: "appointment", variant: "", icon: "video", date: "24/09/2026", time: "6:00 PM",
      title: "Video consult — Dr. Rohan Mehta", sub: "Cardiology · 22 min",
      detail: "Follow-up on palpitations. ECG reviewed remotely; beta-blocker dose adjusted. Next review in 4 weeks.",
      docs: [{ name: "Prescription_Sep24.pdf", size: "212 KB" }, { name: "ECG_Report.pdf", size: "1.1 MB" }]
    },
    {
      id: "tl2", type: "record", variant: "violet", icon: "file-text", date: "24/09/2026", time: "6:24 PM",
      title: "Consultation summary added", sub: "AI-drafted, verified by Dr. Mehta",
      detail: "Symptoms, assessment and plan summarised and signed. Shared with your ABHA locker (FHIR DocumentReference).",
      docs: [{ name: "Consult_Summary_Sep24.pdf", size: "188 KB" }]
    },
    {
      id: "tl3", type: "triage", variant: "", icon: "chat", date: "21/09/2026", time: "9:12 AM",
      title: "AI triage — chest discomfort", sub: "Urgency: Urgent · 4 symptoms",
      detail: "Detected: chest tightness, breathlessness on exertion, mild sweating, fatigue ×1 week. Advised same-day cardiology consult.",
      docs: []
    },
    {
      id: "tl4", type: "vitals", variant: "green", icon: "activity", date: "18/09/2026", time: "7:45 AM",
      title: "Vitals synced — OxyGo oximeter", sub: "SpO₂ 97% · Pulse 76 bpm",
      detail: "Morning reading auto-synced over Bluetooth. All values within normal range. Trend shared with Dr. Mehta.",
      docs: []
    },
    {
      id: "tl5", type: "appointment", variant: "", icon: "stethoscope", date: "02/09/2026", time: "11:00 AM",
      title: "In-person visit — Dr. Ananya Sharma", sub: "General Medicine · Apollo Clinic",
      detail: "Seasonal viral fever. Prescribed paracetamol + hydration; recovered in 4 days. Records verified.",
      docs: [{ name: "Prescription_Sep02.pdf", size: "164 KB" }, { name: "CBC_Lab_Report.pdf", size: "896 KB" }]
    },
    {
      id: "tl6", type: "record", variant: "violet", icon: "folder", date: "28/08/2026", time: "—",
      title: "Annual health checkup report", sub: "Metropolis Labs · 42 parameters",
      detail: "HbA1c 5.4% (normal), LDL borderline high — lifestyle advice noted. Full panel attached.",
      docs: [{ name: "Health_Checkup_Aug28.pdf", size: "2.4 MB" }]
    }
  ];

  const NOTIFICATIONS = [
    { icon: "calendar-check", tone: "tile--blue", title: "Appointment tomorrow", body: "Dr. Rohan Mehta, Cardiology · 6:00 PM video consult", time: "2 h ago", unread: true },
    { icon: "file-text", tone: "tile--violet", title: "New record shared", body: "Consult summary from 24/09 is ready to download", time: "Yesterday", unread: true },
    { icon: "pill", tone: "tile--amber", title: "Medication reminder", body: "Metoprolol 25 mg — evening dose at 8:00 PM", time: "Yesterday", unread: true },
    { icon: "heart", tone: "tile--green", title: "Health tip", body: "Monsoon alert: 8 tips to avoid seasonal viral fever", time: "2 days ago", unread: false }
  ];

  const ADMIN = {
    stats: [
      { label: "Doctors active", value: "312", trend: "+8.2%", up: true, icon: "stethoscope", tone: "tile--blue" },
      { label: "Consultations today", value: "1,024", trend: "+12.6%", up: true, icon: "video", tone: "tile--teal" },
      { label: "New patients (7d)", value: "4,806", trend: "+5.1%", up: true, icon: "users", tone: "tile--green" },
      { label: "Avg. wait time", value: "6m 20s", trend: "-14.0%", up: false, goodDown: true, icon: "clock", tone: "tile--amber" }
    ],
    line: { /* consultations per day, 30d */
      labels: ["01", "05", "10", "15", "20", "25", "30"],
      series: [420, 465, 448, 520, 640, 590, 702, 655, 710, 780, 742, 830, 910, 868, 905, 990, 940, 1024, 980, 1030, 1105, 1072, 1150, 1098, 1180, 1240, 1196, 1272, 1310, 1386]
    },
    donut: [
      { label: "General Medicine", value: 34, color: "var(--chart-1)" },
      { label: "Pediatrics", value: 22, color: "var(--chart-2)" },
      { label: "Cardiology", value: 16, color: "var(--chart-3)" },
      { label: "Dermatology", value: 14, color: "var(--chart-4)" },
      { label: "Gynecology", value: 9, color: "var(--chart-5)" },
      { label: "Others", value: 5, color: "var(--chart-6)" }
    ],
    bars: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], series: [62, 78, 71, 90, 104, 132, 96] },
    users: [
      { name: "Dr. Kavita Joshi", role: "doctor", meta: "Dermatology · Nagpur", joined: "29/09/2026", status: "Verified" },
      { name: "Suresh Yadav", role: "patient", meta: "Patna, Bihar", joined: "29/09/2026", status: "Active" },
      { name: "Dr. Imran Sheikh", role: "doctor", meta: "General Medicine · Bhopal", joined: "28/09/2026", status: "Pending KYC" },
      { name: "Lakshmi Ammal", role: "patient", meta: "Madurai, TN", joined: "28/09/2026", status: "Active" },
      { name: "Priya Rane", role: "admin", meta: "Ops · Pune HQ", joined: "27/09/2026", status: "Active" },
      { name: "Dr. Arjun Desai", role: "doctor", meta: "Dermatology · Pune", joined: "26/09/2026", status: "Verified" }
    ]
  };

  /* Chat script for the guided triage demo, per language */
  const CHAT_SCRIPT = {
    en: {
      intro: "Namaste Kavita 🙏 I'm your MediTriage assistant. Describe what you're feeling — type or tap the mic and speak in English, हिन्दी or मराठी.",
      heard: "I have fever and body ache since 2 days…",
      followups: [
        { ai: "I heard: **fever** and **body ache** for 2 days. Any of these as well?", chips: ["Headache", "Cough", "Breathing difficulty", "Chills", "Sore throat"] },
        { ai: "Got it — adding **headache** and **chills**. On a scale of 1–10, how severe is the body ache?", chips: ["Mild (1–3)", "Moderate (4–6)", "Severe (7–10)"] }
      ],
      closing: "Thank you. I have enough to run a triage analysis now.",
      listening: "Listening… (English)", analyzing: "Analyzing your symptoms…"
    },
    hi: {
      intro: "नमस्ते कविता 🙏 मैं आपकी मेडीट्रिएज सहायक हूँ। आप जो महसूस कर रही हैं वह बताएं — टाइप करें या माइक दबाकर हिन्दी में बोलें।",
      heard: "मुझे 2 दिन से बुखार और बदन दर्द है…",
      followups: [
        { ai: "मैंने सुना: **बुखार** और **बदन दर्द** 2 दिन से। क्या ये भी हैं?", chips: ["सिरदर्द", "खांसी", "सांस लेने में तकलीफ", "ठंड लगना", "गले में दर्द"] },
        { ai: "ठीक है — **सिरदर्द** और **ठंड लगना** जोड़ा। 1 से 10 में बदन दर्द कितना तेज़ है?", chips: ["हल्का (1–3)", "मध्यम (4–6)", "तेज़ (7–10)"] }
      ],
      closing: "धन्यवाद। अब मैं त्रिएज विश्लेषण चलाने के लिए तैयार हूँ।",
      listening: "सुन रही हूँ… (हिन्दी)", analyzing: "आपके लक्षणों का विश्लेषण हो रहा है…"
    },
    mr: {
      intro: "नमस्ते कविता 🙏 मी तुमची मेडीट्रिएज सहाय्यक आहे. तुम्हाला कसे वाटत आहे ते सांगा — टाइप करा किंवा माइक दाबून मराठीत बोला.",
      heard: "मला २ दिवसांपासून ताप आणि अंगदुखी आहे…",
      followups: [
        { ai: "मी ऐकले: **ताप** आणि **अंगदुखी** २ दिवसांपासून. हेही आहे का?", chips: ["डोकेदुखी", "खोकला", "श्वास घेण्यास त्रास", "थंडी वाजणे", "घसा दुखणे"] },
        { ai: "ठीक आहे — **डोकेदुखी** आणि **थंडी वाजणे** जोडले. १ ते १० मध्ये अंगदुखी किती तीव्र आहे?", chips: ["सौम्य (१–३)", "मध्यम (४–६)", "तीव्र (७–१०)"] }
      ],
      closing: "धन्यवाद. आता मी ट्रायज विश्लेषण चालवू शकते.",
      listening: "ऐकत आहे… (मराठी)", analyzing: "तुमच्या लक्षणांचे विश्लेषण सुरू आहे…"
    }
  };

  window.MTDATA = { DOCTORS, SLOT_TIMES, weekDays, slotsFor, TIMELINE, NOTIFICATIONS, ADMIN, CHAT_SCRIPT };
})();
