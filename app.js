/* ==========================================================================
   BelegFlow — App Logic
   Reines Vanilla JS, keine Frameworks. Alle Daten bleiben lokal
   (localStorage). Struktur:
     1. Konfiguration & Konstanten
     2. KI/OCR-Anbindung (modular austauschbar)
     3. Datenhaltung (Storage)
     4. Utilities (Format, Zeit, Icons)
     5. Demo-Datengenerator
     6. Analyse-Engine (Insights, Produktstatistik, Zusammenfassung)
     7. UI-Rendering pro Ansicht
     8. Modals (Upload/Analyse/Review, Beleg-Details, Bestätigungen)
     9. Event-Wiring & Init
   ========================================================================== */

/* ==========================================================================
   1. Konfiguration & Konstanten
   ========================================================================== */

const CATEGORIES = ["Lebensmittel", "Haushalt", "Kinder", "Auto", "Freizeit", "Kleidung", "Technik", "Gesundheit", "Sonstiges"];

const CATEGORY_COLOR = {
  Lebensmittel: "#2fb350", Haushalt: "#af52de", Kinder: "#ff9f0a", Auto: "#5e5ce6",
  Freizeit: "#ff375f", Kleidung: "#32ade6", Technik: "#0a84ff", Gesundheit: "#ff453a", Sonstiges: "#8e8e93"
};

const CATEGORY_EMOJI = {
  Lebensmittel: "🛒", Haushalt: "🧽", Kinder: "🧸", Auto: "⛽",
  Freizeit: "🎬", Kleidung: "👕", Technik: "💻", Gesundheit: "💊", Sonstiges: "📦"
};

/* Produktkatalog: dient sowohl der Demo-Datenerzeugung als auch der
   automatischen Kategorie-Erkennung (Keyword-Zuordnung). */
const PRODUCT_CATALOG = [
  // Lebensmittel
  { name: "Milch 1,5%", category: "Lebensmittel", price: [1.09, 1.35], merchants: ["REWE", "EDEKA", "ALDI SÜD", "LIDL", "Netto"] },
  { name: "Bio-Eier (10er)", category: "Lebensmittel", price: [2.79, 3.49], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Butter", category: "Lebensmittel", price: [1.99, 2.49], merchants: ["REWE", "EDEKA", "LIDL", "Netto"] },
  { name: "Toastbrot", category: "Lebensmittel", price: [1.49, 1.99], merchants: ["REWE", "EDEKA", "ALDI SÜD", "Penny"] },
  { name: "Bio-Äpfel", category: "Lebensmittel", price: [2.49, 3.29], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Bananen", category: "Lebensmittel", price: [1.29, 1.79], merchants: ["REWE", "EDEKA", "ALDI SÜD", "LIDL"] },
  { name: "Joghurt Natur", category: "Lebensmittel", price: [0.89, 1.19], merchants: ["REWE", "EDEKA", "ALDI SÜD", "Netto"] },
  { name: "Gouda Käse", category: "Lebensmittel", price: [2.19, 2.89], merchants: ["REWE", "EDEKA", "LIDL"] },
  { name: "Hähnchenbrust", category: "Lebensmittel", price: [5.49, 7.29], merchants: ["REWE", "EDEKA"] },
  { name: "Rinderhackfleisch", category: "Lebensmittel", price: [4.49, 5.99], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Spaghetti", category: "Lebensmittel", price: [0.89, 1.39], merchants: ["REWE", "EDEKA", "ALDI SÜD", "Penny"] },
  { name: "Basmati Reis", category: "Lebensmittel", price: [2.49, 3.29], merchants: ["REWE", "EDEKA", "LIDL"] },
  { name: "Olivenöl", category: "Lebensmittel", price: [4.99, 7.49], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Tomaten", category: "Lebensmittel", price: [2.29, 3.19], merchants: ["REWE", "EDEKA", "ALDI SÜD", "LIDL"] },
  { name: "Kartoffeln 2,5kg", category: "Lebensmittel", price: [2.99, 3.79], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Orangensaft", category: "Lebensmittel", price: [1.99, 2.59], merchants: ["REWE", "EDEKA", "Netto"] },
  { name: "Kaffee gemahlen", category: "Lebensmittel", price: [4.49, 6.99], merchants: ["REWE", "EDEKA", "ALDI SÜD", "LIDL"] },
  { name: "Vollkornbrot", category: "Lebensmittel", price: [2.49, 3.29], merchants: ["REWE", "EDEKA", "Bäckerei Kamps"] },
  { name: "Schokolade", category: "Lebensmittel", price: [0.99, 1.79], merchants: ["REWE", "EDEKA", "ALDI SÜD", "dm"] },
  { name: "Kartoffelchips", category: "Lebensmittel", price: [1.49, 2.19], merchants: ["REWE", "EDEKA", "ALDI SÜD", "Netto"] },
  { name: "Mineralwasser 6x1,5L", category: "Lebensmittel", price: [3.49, 4.49], merchants: ["REWE", "EDEKA", "ALDI SÜD", "LIDL"] },
  { name: "Pils Kiste", category: "Lebensmittel", price: [11.99, 15.99], merchants: ["REWE", "EDEKA", "Getränke Hoffmann"] },
  // Haushalt
  { name: "Spülmittel", category: "Haushalt", price: [1.79, 2.49], merchants: ["REWE", "EDEKA", "dm", "Rossmann"] },
  { name: "Waschmittel", category: "Haushalt", price: [7.99, 12.99], merchants: ["REWE", "dm", "Rossmann", "Netto"] },
  { name: "Toilettenpapier (8 Rollen)", category: "Haushalt", price: [4.29, 5.79], merchants: ["REWE", "EDEKA", "ALDI SÜD", "dm", "Rossmann"] },
  { name: "Küchenrolle", category: "Haushalt", price: [2.99, 3.99], merchants: ["REWE", "EDEKA", "ALDI SÜD"] },
  { name: "Müllbeutel", category: "Haushalt", price: [2.49, 3.49], merchants: ["REWE", "dm", "Rossmann"] },
  { name: "Allzweckreiniger", category: "Haushalt", price: [1.99, 2.99], merchants: ["REWE", "dm", "Rossmann"] },
  { name: "Duschgel", category: "Haushalt", price: [1.99, 3.49], merchants: ["dm", "Rossmann"] },
  { name: "LED-Glühbirne", category: "Haushalt", price: [3.99, 6.99], merchants: ["OBI", "IKEA"] },
  { name: "Batterien AA (4er)", category: "Haushalt", price: [3.49, 5.49], merchants: ["dm", "Rossmann", "Media Markt"] },
  { name: "Stauraumbox", category: "Haushalt", price: [7.99, 14.99], merchants: ["IKEA", "OBI"] },
  { name: "Bettwäsche", category: "Haushalt", price: [19.99, 34.99], merchants: ["IKEA"] },
  // Kinder
  { name: "Windeln Pampers Gr.4", category: "Kinder", price: [11.99, 15.49], merchants: ["dm", "Rossmann", "REWE"] },
  { name: "Babynahrung Gläschen", category: "Kinder", price: [0.79, 1.19], merchants: ["dm", "Rossmann", "REWE"] },
  { name: "Feuchttücher", category: "Kinder", price: [1.49, 2.29], merchants: ["dm", "Rossmann"] },
  { name: "Lego Set", category: "Kinder", price: [14.99, 39.99], merchants: ["Media Markt", "Thalia"] },
  { name: "Buntstifte", category: "Kinder", price: [3.99, 7.99], merchants: ["Thalia", "dm"] },
  // Auto
  { name: "Diesel", category: "Auto", price: [65.0, 92.0], merchants: ["Shell", "Aral", "Esso"] },
  { name: "Super E10", category: "Auto", price: [55.0, 85.0], merchants: ["Shell", "Aral", "Esso"] },
  { name: "Scheibenwischwasser", category: "Auto", price: [3.49, 5.99], merchants: ["Shell", "Aral", "OBI"] },
  { name: "Autowäsche", category: "Auto", price: [8.0, 16.0], merchants: ["Shell", "Aral"] },
  { name: "Motoröl 1L", category: "Auto", price: [9.99, 16.99], merchants: ["Aral", "OBI"] },
  // Freizeit
  { name: "Kinokarte", category: "Freizeit", price: [9.5, 13.5], merchants: ["CineStar"] },
  { name: "Taschenbuch", category: "Freizeit", price: [9.99, 22.99], merchants: ["Thalia"] },
  { name: "Fitnessstudio Beitrag", category: "Freizeit", price: [29.9, 49.9], merchants: ["FitX"] },
  { name: "Konzertticket", category: "Freizeit", price: [35.0, 79.0], merchants: ["Eventim"] },
  { name: "Puzzle 1000 Teile", category: "Freizeit", price: [12.99, 19.99], merchants: ["Thalia"] },
  // Kleidung
  { name: "T-Shirt", category: "Kleidung", price: [9.99, 19.99], merchants: ["H&M", "Zalando", "C&A"] },
  { name: "Jeans", category: "Kleidung", price: [29.99, 59.99], merchants: ["H&M", "Zalando", "C&A"] },
  { name: "Sneaker", category: "Kleidung", price: [49.99, 99.99], merchants: ["Zalando", "Decathlon"] },
  { name: "Socken 3er Pack", category: "Kleidung", price: [5.99, 9.99], merchants: ["H&M", "Zalando"] },
  { name: "Winterjacke", category: "Kleidung", price: [59.99, 129.99], merchants: ["Zalando", "C&A"] },
  // Technik
  { name: "USB-C Kabel", category: "Technik", price: [7.99, 14.99], merchants: ["Media Markt", "Saturn"] },
  { name: "Kopfhörer", category: "Technik", price: [19.99, 79.99], merchants: ["Media Markt", "Saturn"] },
  { name: "HDMI Kabel", category: "Technik", price: [6.99, 12.99], merchants: ["Media Markt", "Saturn"] },
  { name: "Powerbank", category: "Technik", price: [19.99, 39.99], merchants: ["Media Markt", "Saturn"] },
  { name: "Handyhülle", category: "Technik", price: [9.99, 24.99], merchants: ["Media Markt", "Saturn"] },
  // Gesundheit
  { name: "Kopfschmerztabletten", category: "Gesundheit", price: [3.99, 6.99], merchants: ["Apotheke am Markt", "dm"] },
  { name: "Vitamin C Brausetabletten", category: "Gesundheit", price: [2.99, 4.99], merchants: ["dm", "Rossmann", "Apotheke am Markt"] },
  { name: "Nasenspray", category: "Gesundheit", price: [3.49, 5.49], merchants: ["Apotheke am Markt", "dm"] },
  { name: "Pflaster", category: "Gesundheit", price: [1.99, 3.49], merchants: ["dm", "Rossmann"] },
  { name: "Sonnencreme LSF 50", category: "Gesundheit", price: [6.99, 12.99], merchants: ["dm", "Rossmann"] },
  // Sonstiges
  { name: "Geschenkgutschein", category: "Sonstiges", price: [15.0, 50.0], merchants: ["Thalia", "Media Markt"] },
  { name: "Zeitschrift", category: "Sonstiges", price: [3.5, 6.5], merchants: ["REWE", "Thalia"] },
  { name: "Blumenstrauß", category: "Sonstiges", price: [7.99, 16.99], merchants: ["REWE", "EDEKA"] },
  { name: "Tierfutter", category: "Sonstiges", price: [8.99, 18.99], merchants: ["Fressnapf", "REWE"] }
];

/* Zusätzliche Keyword-Hinweise für die automatische Kategorisierung
   (deckt auch Begriffe ab, die nicht 1:1 im Produktkatalog stehen). */
const EXTRA_CATEGORY_KEYWORDS = {
  Lebensmittel: ["milch", "brot", "käse", "obst", "gemüse", "fleisch", "wurst", "getränk", "wasser", "saft", "kaffee", "tee", "bier", "wein", "ei", "joghurt", "nudel", "reis"],
  Haushalt: ["spülmittel", "waschmittel", "reiniger", "toilettenpapier", "küchenrolle", "müllbeutel", "batterie", "glühbirne", "putzmittel"],
  Kinder: ["windel", "baby", "kinder", "spielzeug", "lego"],
  Auto: ["diesel", "benzin", "super e10", "tanken", "autowäsche", "motoröl", "kfz"],
  Freizeit: ["kino", "buch", "fitness", "konzert", "ticket", "puzzle", "hobby"],
  Kleidung: ["shirt", "jeans", "schuh", "sneaker", "jacke", "socke", "hose", "pullover"],
  Technik: ["usb", "kabel", "kopfhörer", "hdmi", "powerbank", "handyhülle", "akku", "ladegerät", "elektronik"],
  Gesundheit: ["tablette", "schmerz", "vitamin", "nasenspray", "pflaster", "sonnencreme", "apotheke", "medizin"],
  Sonstiges: []
};

const MERCHANT_CATEGORY_AFFINITY = {
  "REWE": ["Lebensmittel", "Haushalt", "Sonstiges"], "EDEKA": ["Lebensmittel", "Haushalt"], "ALDI SÜD": ["Lebensmittel", "Haushalt"],
  "LIDL": ["Lebensmittel", "Haushalt"], "Netto": ["Lebensmittel", "Haushalt"], "Penny": ["Lebensmittel"],
  "dm": ["Haushalt", "Gesundheit", "Kinder"], "Rossmann": ["Haushalt", "Gesundheit", "Kinder"],
  "Media Markt": ["Technik"], "Saturn": ["Technik"], "IKEA": ["Haushalt"], "OBI": ["Haushalt", "Auto"],
  "Zalando": ["Kleidung"], "H&M": ["Kleidung"], "C&A": ["Kleidung"], "Decathlon": ["Kleidung", "Freizeit"],
  "Shell": ["Auto"], "Aral": ["Auto"], "Esso": ["Auto"],
  "Apotheke am Markt": ["Gesundheit"], "CineStar": ["Freizeit"], "Thalia": ["Freizeit", "Sonstiges"],
  "FitX": ["Freizeit"], "Eventim": ["Freizeit"], "Fressnapf": ["Sonstiges"], "Bäckerei Kamps": ["Lebensmittel"],
  "Getränke Hoffmann": ["Lebensmittel"]
};

const MERCHANTS = Object.keys(MERCHANT_CATEGORY_AFFINITY);
const PAYMENT_METHODS = ["EC-Karte", "Kreditkarte", "Bar", "Mobile Payment"];

/* KI/OCR-Konfiguration — zentral & austauschbar.
   AI_PROVIDER: "demo" (lokale Mock-Erkennung) oder "custom" (eigener Backend-Proxy).
   AI_API_ENDPOINT: URL eines EIGENEN Backend-Proxys, der die eigentliche
   Vision-/OCR-API aufruft. API-Schlüssel dürfen NIEMALS im Frontend liegen —
   siehe analyzeReceiptViaApi() weiter unten. */
const AI_DEFAULTS = { provider: "demo", endpoint: "" };

const STORAGE_KEYS = { receipts: "belegflow_receipts_v1", settings: "belegflow_settings_v1" };

/* ==========================================================================
   2. KI/OCR-Anbindung
   ========================================================================== */

/**
 * Zentrale Analysefunktion. Nimmt ein Bild (Data-URL oder File) entgegen und
 * liefert ein strukturiertes Beleg-Objekt zurück. Ist ein externer Anbieter
 * konfiguriert, wird dieser genutzt — sonst greift die lokale Demo-Erkennung.
 */
async function analyzeReceipt(imageDataUrl) {
  const settings = getSettings();
  if (settings.aiProvider === "custom" && settings.aiApiEndpoint) {
    try {
      return await analyzeReceiptViaApi(imageDataUrl, settings.aiApiEndpoint);
    } catch (err) {
      console.warn("KI-Analyse über API fehlgeschlagen, verwende Demo-Erkennung:", err);
    }
  }
  return analyzeReceiptMock();
}

/**
 * Beispiel-Implementierung für eine echte Anbindung.
 *
 * WICHTIG: Der Browser darf niemals einen API-Key eines KI-Anbieters
 * (OpenAI, Google Vision, Azure Document Intelligence, ...) direkt
 * enthalten. Stattdessen ruft diese Funktion einen EIGENEN Backend-Proxy
 * auf (AI_API_ENDPOINT), der serverseitig den echten Key hält, die Anfrage
 * an den KI-Anbieter weiterleitet und ein normalisiertes JSON zurückgibt.
 * Erwartetes Antwortformat entspricht dem Rückgabewert von analyzeReceiptMock().
 */
async function analyzeReceiptViaApi(imageDataUrl, endpoint) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl })
  });
  if (!res.ok) throw new Error("API antwortete mit Status " + res.status);
  const data = await res.json();
  return normalizeAnalysisResult(data);
}

function normalizeAnalysisResult(data) {
  return {
    merchant: data.merchant || "Unbekannt",
    merchantConfidence: data.merchantConfidence || "high",
    date: data.date || todayISO(),
    dateConfidence: data.dateConfidence || "high",
    time: data.time || null,
    total: Number(data.total) || 0,
    totalConfidence: data.totalConfidence || "high",
    currency: data.currency || "EUR",
    vat: data.vat != null ? Number(data.vat) : null,
    vatConfidence: data.vatConfidence || "medium",
    paymentMethod: data.paymentMethod || null,
    items: Array.isArray(data.items) ? data.items.map(normalizeItem) : []
  };
}
function normalizeItem(it) {
  return {
    name: it.name || "Artikel", quantity: Number(it.quantity) || 1,
    unitPrice: Number(it.unitPrice) || 0, totalPrice: Number(it.totalPrice) || 0,
    category: it.category || guessCategory(it.name || ""), confidence: it.confidence || "high"
  };
}

/** Lokale Demo-/Mock-Erkennung — simuliert eine realistische OCR-Analyse. */
function analyzeReceiptMock() {
  return new Promise((resolve) => {
    const delay = 1300 + Math.random() * 900;
    setTimeout(() => resolve(generateMockAnalysis()), delay);
  });
}

function generateMockAnalysis() {
  const merchant = pick(MERCHANTS);
  const pool = PRODUCT_CATALOG.filter((p) => p.merchants.includes(merchant));
  const itemCount = randInt(1, Math.min(6, Math.max(1, pool.length)));
  const chosen = shuffle(pool).slice(0, itemCount);
  const lowConfidenceIdx = Math.random() < 0.35 ? randInt(0, chosen.length - 1) : -1;

  const items = chosen.map((p, idx) => {
    const qty = Math.random() < 0.25 ? randInt(2, 3) : 1;
    const unitPrice = round2(randRange(p.price[0], p.price[1]));
    return {
      name: p.name, quantity: qty, unitPrice, totalPrice: round2(unitPrice * qty),
      category: p.category, confidence: idx === lowConfidenceIdx ? "low" : "high"
    };
  });
  const total = round2(items.reduce((s, i) => s + i.totalPrice, 0));
  const vat = round2((total / 1.19) * 0.19);
  const now = new Date();

  return {
    merchant, merchantConfidence: "high",
    date: todayISO(), dateConfidence: "high",
    time: `${pad2(randInt(8, 20))}:${pad2(randInt(0, 59))}`,
    total, totalConfidence: Math.random() < 0.12 ? "low" : "high",
    currency: "EUR",
    vat, vatConfidence: Math.random() < 0.2 ? "low" : "high",
    paymentMethod: pick(PAYMENT_METHODS),
    items
  };
}

function guessCategory(name) {
  const n = name.toLowerCase();
  for (const p of PRODUCT_CATALOG) {
    if (n.includes(p.name.toLowerCase().split(" ")[0])) return p.category;
  }
  for (const cat of Object.keys(EXTRA_CATEGORY_KEYWORDS)) {
    for (const kw of EXTRA_CATEGORY_KEYWORDS[cat]) {
      if (n.includes(kw)) return cat;
    }
  }
  return "Sonstiges";
}

/* ==========================================================================
   3. Datenhaltung
   ========================================================================== */

let receipts = [];

function loadReceipts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.receipts);
    receipts = raw ? JSON.parse(raw) : [];
  } catch { receipts = []; }
}
function saveReceipts() {
  localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(receipts));
}
function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return Object.assign({ theme: "system", aiProvider: AI_DEFAULTS.provider, aiApiEndpoint: AI_DEFAULTS.endpoint }, raw ? JSON.parse(raw) : {});
  } catch { return { theme: "system", aiProvider: AI_DEFAULTS.provider, aiApiEndpoint: AI_DEFAULTS.endpoint }; }
}
function saveSettings(patch) {
  const s = Object.assign(getSettings(), patch);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
  return s;
}

function addReceipt(receipt) {
  receipts.push(receipt);
  saveReceipts();
}
function updateReceipt(id, patch) {
  const idx = receipts.findIndex((r) => r.id === id);
  if (idx === -1) return;
  receipts[idx] = Object.assign({}, receipts[idx], patch);
  saveReceipts();
}
function deleteReceipt(id) {
  receipts = receipts.filter((r) => r.id !== id);
  saveReceipts();
}
function getReceipt(id) { return receipts.find((r) => r.id === id); }

/* ==========================================================================
   4. Utilities
   ========================================================================== */

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function uid() { return "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function pad2(n) { return String(n).padStart(2, "0"); }
function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function round2(n) { return Math.round(n * 100) / 100; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randRange(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = randInt(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; }
function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

const currencyFmt = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
function formatCurrency(n) { return currencyFmt.format(n || 0); }
function parseDate(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function formatDate(iso) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(parseDate(iso)); }
function formatDateLong(iso) { return new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(parseDate(iso)); }
function formatMonthYear(d) { return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(d); }
function monthNameOf(d) { return new Intl.DateTimeFormat("de-DE", { month: "long" }).format(d); }
function normalizeProductName(name) { return name.trim().toLowerCase().replace(/\s+/g, " "); }

function getRange(type, offset = 0) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  if (type === "week") {
    const dow = (now.getDay() + 6) % 7;
    const start = new Date(now); start.setDate(now.getDate() - dow - offset * 7);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    return { start, end, label: "Diese Woche", labelPrev: "Vorherige Woche" };
  }
  if (type === "month") {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    return { start, end, label: offset === 0 ? "Dieser Monat" : formatMonthYear(start), labelPrev: "Vormonat" };
  }
  if (type === "3months") {
    const end = new Date(now); end.setDate(end.getDate() - offset * 90);
    const start = new Date(end); start.setDate(end.getDate() - 90);
    return { start, end, label: "Letzte 3 Monate", labelPrev: "3 Monate davor" };
  }
  const end = new Date(now); end.setDate(end.getDate() - offset * 365);
  const start = new Date(end); start.setFullYear(end.getFullYear() - 1);
  return { start, end, label: "Letztes Jahr", labelPrev: "Jahr davor" };
}
function inRange(iso, start, end) { const d = parseDate(iso); return d >= start && d < end; }
function receiptsInRange(list, start, end) { return list.filter((r) => inRange(r.date, start, end)); }
function sumTotal(list) { return round2(list.reduce((s, r) => s + r.total, 0)); }

function receiptPrimaryCategory(r) {
  if (!r.items || !r.items.length) return r.category || "Sonstiges";
  const sums = {};
  r.items.forEach((i) => { sums[i.category] = (sums[i.category] || 0) + i.totalPrice; });
  return Object.entries(sums).sort((a, b) => b[1] - a[1])[0][0];
}

/* ---- Icons: kompaktes, handgezeichnetes Icon-Set (Feather-Stil) ---- */
const ICONS = {
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>',
  receipt: '<path d="M6 3h12a1 1 0 0 1 1 1v16.3a.6.6 0 0 1-.92.5l-1.83-1.2-1.83 1.2a.6.6 0 0 1-.66 0l-1.76-1.2-1.76 1.2a.6.6 0 0 1-.66 0l-1.83-1.2-1.83 1.2A.6.6 0 0 1 5 20.3V4a1 1 0 0 1 1-1z"/><path d="M8.5 8.5h7M8.5 11.5h7M8.5 14.5h4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  trend: '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.9l.06.06a2 2 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.55V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.34l-.06.06a2 2 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.9 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.9l-.06-.06a2 2 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.9.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.34l.06-.06a2 2 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.9V9c.14.42.5.76 1 .95H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  system: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8 20h8M12 16.5V20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><circle cx="12" cy="13" r="3.4"/>',
  file: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 9.5v4.2M12 17h.01"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 8l3 3"/>',
  trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-.8 12.1A2 2 0 0 1 15.2 21H8.8a2 2 0 0 1-2-1.9L6 7"/><path d="M10 11v6M14 11v6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.4-4.4"/>',
  filter: '<path d="M4 5h16M7 12h10M10.5 19h3"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
  arrowDownRight: '<path d="M7 7l10 10M17 9v8H9"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5"/><path d="M4 19h16"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 8h.01"/>',
  cart: '<circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16"/><path d="M12 10h7a1 1 0 0 1 1 1v10"/><path d="M7 8h1M7 11h1M7 14h1M15 13h1M15 16h1"/>'
};
function iconSvg(name, size = 18, stroke = true) {
  const inner = ICONS[name] || "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ${stroke ? 'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"' : ""}>${inner}</svg>`;
}
function hydrateIcons(root = document) {
  qsa("[data-icon]", root).forEach((el) => { if (!el.dataset.hydrated) { el.innerHTML = iconSvg(el.dataset.icon); el.dataset.hydrated = "1"; } });
}

/* ==========================================================================
   5. Demo-Datengenerator
   ========================================================================== */

function buildReceiptFromItems(dateObj, merchant, items, opts = {}) {
  const total = round2(items.reduce((s, i) => s + i.totalPrice, 0));
  return {
    id: uid(),
    merchant,
    date: `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`,
    time: `${pad2(randInt(8, 20))}:${pad2(randInt(0, 59))}`,
    total, currency: "EUR",
    vat: round2((total / 1.19) * 0.19),
    paymentMethod: pick(PAYMENT_METHODS),
    items,
    notes: opts.notes || "",
    image: null,
    isDemo: true,
    createdAt: dateObj.getTime()
  };
}
function makeItem(product, qty, unitPrice) {
  return { name: product.name, quantity: qty, unitPrice: round2(unitPrice), totalPrice: round2(unitPrice * qty), category: product.category, confidence: "high" };
}
function randomReceiptForDate(dateObj) {
  const merchant = pick(MERCHANTS);
  const pool = PRODUCT_CATALOG.filter((p) => p.merchants.includes(merchant));
  const isFuelStop = ["Shell", "Aral", "Esso"].includes(merchant) && Math.random() < 0.7;
  let items;
  if (isFuelStop) {
    const fuel = pool.find((p) => p.name === "Diesel" || p.name === "Super E10") || pool[0];
    items = [makeItem(fuel, 1, randRange(fuel.price[0], fuel.price[1]))];
  } else {
    const count = randInt(1, Math.min(8, pool.length));
    items = shuffle(pool).slice(0, count).map((p) => {
      const qty = Math.random() < 0.2 ? randInt(2, 3) : 1;
      return makeItem(p, qty, randRange(p.price[0], p.price[1]));
    });
  }
  return buildReceiptFromItems(dateObj, merchant, items);
}

function generateDemoData() {
  const out = [];
  const now = new Date();
  const daysBack = 165;

  // 1) Zufällige Basis-Einkäufe — pro Kalendermonat verteilt, damit jeder
  //    Monat eine plausible Mindestanzahl an Belegen hat (verhindert
  //    verzerrte Monatsvergleiche durch zufällig fast leere Monate).
  const monthsBack = 5;
  for (let m = 0; m <= monthsBack; m++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = m === 0 ? now : new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
    const spanDays = Math.max(1, Math.round((monthEnd - monthStart) / 86400000) + 1);
    const count = randInt(5, 8);
    for (let i = 0; i < count; i++) {
      const d = new Date(monthStart); d.setDate(monthStart.getDate() + randInt(0, spanDays - 1));
      out.push(randomReceiptForDate(d));
    }
  }

  // 2) Wiederkehrendes Produkt "Milch" — häufig, mit Preisanstieg über Zeit
  //    (liefert Material für Preisentwicklungs- & Händlervergleichs-Insights)
  const milk = PRODUCT_CATALOG.find((p) => p.name === "Milch 1,5%");
  const milkMerchants = ["REWE", "EDEKA", "ALDI SÜD"];
  for (let day = daysBack; day >= 0; day -= randInt(4, 6)) {
    const d = new Date(now); d.setDate(now.getDate() - day);
    const progress = 1 - day / daysBack; // 0 (alt) -> 1 (heute)
    const price = round2(1.09 + progress * 0.28);
    const merchant = milkMerchants[day % milkMerchants.length];
    const items = [makeItem(milk, randInt(1, 2), price)];
    const bonus = pick(PRODUCT_CATALOG.filter((p) => p.category === "Lebensmittel"));
    if (Math.random() < 0.6 && bonus) items.push(makeItem(bonus, 1, randRange(bonus.price[0], bonus.price[1])));
    out.push(buildReceiptFromItems(d, merchant, items));
  }

  // 3) Toilettenpapier — regelmäßig, stabiler Preis, unterschiedliche Händler
  const paper = PRODUCT_CATALOG.find((p) => p.name === "Toilettenpapier (8 Rollen)");
  for (let day = daysBack; day >= 0; day -= randInt(16, 22)) {
    const d = new Date(now); d.setDate(now.getDate() - day);
    const merchant = pick(["REWE", "EDEKA", "dm", "ALDI SÜD"]);
    out.push(buildReceiptFromItems(d, merchant, [makeItem(paper, 1, randRange(paper.price[0], paper.price[1]))]));
  }

  // 4) Kaffee — monatlich
  const coffee = PRODUCT_CATALOG.find((p) => p.name === "Kaffee gemahlen");
  for (let day = daysBack; day >= 0; day -= randInt(26, 34)) {
    const d = new Date(now); d.setDate(now.getDate() - day);
    const merchant = pick(["REWE", "EDEKA", "ALDI SÜD", "LIDL"]);
    out.push(buildReceiptFromItems(d, merchant, [makeItem(coffee, 1, randRange(coffee.price[0], coffee.price[1]))]));
  }

  // 5) Ein auffällig großer Einkauf (für "Impulskäufe"-Insight)
  const bigDate = new Date(now); bigDate.setDate(now.getDate() - randInt(3, 20));
  const bigProduct = PRODUCT_CATALOG.find((p) => p.name === "Sneaker");
  out.push(buildReceiptFromItems(bigDate, "Zalando", [makeItem(bigProduct, 1, 89.99)]));

  out.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  return out;
}

/* ==========================================================================
   6. Analyse-Engine
   ========================================================================== */

function categoryBreakdown(list) {
  const sums = {}; CATEGORIES.forEach((c) => (sums[c] = 0));
  list.forEach((r) => { (r.items && r.items.length ? r.items : [{ category: r.category || "Sonstiges", totalPrice: r.total }]).forEach((i) => { sums[i.category] = (sums[i.category] || 0) + i.totalPrice; }); });
  return sums;
}

function computeMonthStats(receiptsList, monthOffset = 0) {
  const { start, end } = getRange("month", monthOffset);
  const list = receiptsInRange(receiptsList, start, end);
  const total = sumTotal(list);
  const count = list.length;
  const avg = count ? round2(total / count) : 0;
  const max = list.reduce((m, r) => Math.max(m, r.total), 0);
  return { start, end, list, total, count, avg, max };
}

function productStats(list) {
  const map = {};
  list.forEach((r) => {
    (r.items || []).forEach((i) => {
      const key = normalizeProductName(i.name);
      if (!map[key]) map[key] = { name: i.name, category: i.category, purchases: [] };
      map[key].purchases.push({ date: r.date, unitPrice: i.unitPrice, quantity: i.quantity, merchant: r.merchant });
    });
  });
  return Object.values(map).map((p) => {
    p.purchases.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const count = p.purchases.length;
    const avgPrice = round2(p.purchases.reduce((s, x) => s + x.unitPrice, 0) / count);
    const first = p.purchases[0], last = p.purchases[count - 1];
    const priceChangePct = first.unitPrice > 0 ? ((last.unitPrice - first.unitPrice) / first.unitPrice) * 100 : 0;
    const byMerchant = {};
    p.purchases.forEach((x) => { (byMerchant[x.merchant] = byMerchant[x.merchant] || []).push(x.unitPrice); });
    const merchantAverages = Object.entries(byMerchant).map(([m, prices]) => ({ merchant: m, avg: round2(prices.reduce((a, b) => a + b, 0) / prices.length), count: prices.length }));
    return { name: p.name, category: p.category, count, avgPrice, first, last, priceChangePct, merchantAverages, distinctMonths: new Set(p.purchases.map((x) => x.date.slice(0, 7))).size };
  });
}

function productEmoji(name) {
  const n = name.toLowerCase();
  const map = [["milch", "🥛"], ["toilettenpapier", "🧻"], ["kaffee", "☕"], ["brot", "🍞"], ["ei", "🥚"], ["käse", "🧀"], ["bier", "🍺"], ["wein", "🍷"], ["diesel", "⛽"], ["super e10", "⛽"], ["windel", "👶"], ["apfel", "🍎"], ["banane", "🍌"], ["tomate", "🍅"], ["kartoffel", "🥔"], ["hähnchen", "🍗"], ["hack", "🥩"], ["schokolade", "🍫"], ["chips", "🍟"], ["wasser", "💧"], ["saft", "🧃"], ["jeans", "👖"], ["shirt", "👕"], ["sneaker", "👟"], ["kabel", "🔌"], ["kopfhörer", "🎧"], ["tablette", "💊"], ["sonnencreme", "🧴"]];
  for (const [k, e] of map) if (n.includes(k)) return e;
  return "🛒";
}

function generateSmartSummary(list) {
  const now = new Date();
  const monthName = monthNameOf(now);
  const cur = computeMonthStats(list, 0);
  if (cur.count === 0) return null;

  const breakdown = categoryBreakdown(cur.list);
  const topCat = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
  const topCatPct = cur.total > 0 && topCat ? Math.round((topCat[1] / cur.total) * 100) : 0;

  // Durchschnitt der letzten 3 vollen Vormonate
  const priorTotals = [1, 2, 3].map((off) => computeMonthStats(list, off).total).filter((_, idx, arr) => true);
  const priorMonthsWithData = [1, 2, 3].map((off) => computeMonthStats(list, off)).filter((m) => m.count > 0);

  let sentence3;
  if (priorMonthsWithData.length >= 1) {
    const avgPrior = round2(priorMonthsWithData.reduce((s, m) => s + m.total, 0) / priorMonthsWithData.length);
    if (avgPrior > 0) {
      const diffPct = Math.round(((cur.total - avgPrior) / avgPrior) * 100);
      sentence3 = diffPct >= 0
        ? `Deine Ausgaben liegen <b>${diffPct}% über</b> deinem Durchschnitt der letzten Monate.`
        : `Deine Ausgaben liegen <b>${Math.abs(diffPct)}% unter</b> deinem Durchschnitt der letzten Monate.`;
    } else {
      sentence3 = "Sammle weiter Belege, um Trends über mehrere Monate zu sehen.";
    }
  } else {
    sentence3 = "Sammle weiter Belege, um Trends über mehrere Monate zu sehen.";
  }

  const sentences = [
    `Du hast im ${monthName} bisher <b>${formatCurrency(cur.total)}</b> ausgegeben.`,
    topCat && topCat[1] > 0 ? `<b>${topCat[0]}</b> macht mit ${topCatPct}% den größten Anteil aus.` : `Deine Ausgaben verteilen sich bisher gleichmäßig auf mehrere Kategorien.`,
    sentence3
  ];
  return { monthName, sentences };
}

function generateInsights(list) {
  const insights = [];
  const cur = computeMonthStats(list, 0);
  const prev = computeMonthStats(list, 1);

  // 1) Kategorie-Auffälligkeiten
  const curBreak = categoryBreakdown(cur.list);
  const prevBreak = categoryBreakdown(prev.list);
  const catChanges = CATEGORIES.map((c) => {
    const a = curBreak[c] || 0, b = prevBreak[c] || 0;
    const pct = b > 0 ? ((a - b) / b) * 100 : (a > 0 ? 100 : 0);
    return { cat: c, cur: a, prev: b, pct };
  }).filter((c) => c.prev >= 5 && Math.abs(c.pct) >= 10)
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  catChanges.slice(0, 2).forEach((c) => {
    const dir = c.pct > 0 ? "höher" : "niedriger";
    insights.push({ type: c.pct > 0 ? "up" : "down", icon: c.pct > 0 ? "arrowUpRight" : "arrowDownRight", text: `Deine Ausgaben für <b>${c.cat}</b> sind diesen Monat <b>${Math.abs(Math.round(c.pct))}% ${dir}</b> als im letzten Monat.` });
  });

  // 2) Häufige Käufe (letzte 30 Tage)
  const last30Start = new Date(); last30Start.setDate(last30Start.getDate() - 30);
  const last30 = list.filter((r) => parseDate(r.date) >= last30Start);
  const freq = {};
  last30.forEach((r) => (r.items || []).forEach((i) => { const k = normalizeProductName(i.name); freq[k] = freq[k] || { name: i.name, count: 0 }; freq[k].count++; }));
  const frequent = Object.values(freq).filter((f) => f.count >= 4).sort((a, b) => b.count - a.count).slice(0, 2);
  frequent.forEach((f) => insights.push({ type: "info", icon: "cart", text: `Du hast in den letzten 30 Tagen <b>${f.count}-mal ${f.name}</b> gekauft.` }));

  // 3) Preisentwicklung & 4) Händlervergleich über Produktstatistik
  const stats = productStats(list).filter((p) => p.count >= 2);

  const priceMovers = stats.filter((p) => Math.abs(p.priceChangePct) >= 8 && p.first.unitPrice > 0.3)
    .sort((a, b) => Math.abs(b.priceChangePct) - Math.abs(a.priceChangePct)).slice(0, 2);
  priceMovers.forEach((p) => {
    const dir = p.priceChangePct > 0 ? "teurer geworden" : "günstiger geworden";
    insights.push({ type: p.priceChangePct > 0 ? "up" : "down", icon: "trend", text: `<b>${p.name}</b> ist ${dir}: aktuell durchschnittlich ${formatCurrency(p.last.unitPrice)}, vorher ${formatCurrency(p.first.unitPrice)}.` });
  });

  const merchantCompare = stats.filter((p) => p.merchantAverages.length >= 2)
    .map((p) => { const sorted = [...p.merchantAverages].sort((a, b) => a.avg - b.avg); return { p, cheapest: sorted[0], priciest: sorted[sorted.length - 1], diff: sorted[sorted.length - 1].avg - sorted[0].avg }; })
    .filter((x) => x.diff >= 0.1).sort((a, b) => b.diff - a.diff).slice(0, 2);
  merchantCompare.forEach((x) => insights.push({ type: "info", icon: "building", text: `<b>${x.p.name}</b> war bei <b>${x.cheapest.merchant}</b> im Schnitt ${formatCurrency(x.diff)} günstiger als bei ${x.priciest.merchant}.` }));

  // 5) Wiederkehrende Produkte
  const recurring = stats.filter((p) => p.distinctMonths >= 3).sort((a, b) => b.distinctMonths - a.distinctMonths).slice(0, 1);
  recurring.forEach((p) => insights.push({ type: "info", icon: "sparkles", text: `<b>${p.name}</b> kaufst du regelmäßig — in ${p.distinctMonths} der letzten Monate war es dabei.` }));

  // 6) Vorsichtig formulierte Impulskäufe: Einzelposten-Belege deutlich über Kategorie-Ø
  const catAverages = {};
  CATEGORIES.forEach((c) => { const totals = list.filter((r) => receiptPrimaryCategory(r) === c).map((r) => r.total); catAverages[c] = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0; });
  const outliers = list.filter((r) => {
    const cat = receiptPrimaryCategory(r); const avg = catAverages[cat];
    return avg > 0 && r.total > avg * 2.5 && r.total > 25;
  }).sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, 1);
  outliers.forEach((r) => insights.push({ type: "info", icon: "info", text: `Dein Einkauf bei <b>${r.merchant}</b> am ${formatDate(r.date)} über ${formatCurrency(r.total)} liegt deutlich über deinen sonstigen Ausgaben in dieser Kategorie — vielleicht ein größerer oder spontaner Einkauf.` }));

  return insights;
}

/* ==========================================================================
   7. UI-Rendering
   ========================================================================== */

let currentView = "overview";
const charts = {};
function destroyChart(key) { if (charts[key]) { charts[key].destroy(); delete charts[key]; } }

function switchView(view) {
  currentView = view;
  qsa(".view").forEach((v) => (v.hidden = v.id !== `view-${view}`));
  qsa(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  qsa(".bnav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  const titles = { overview: "Übersicht", receipts: "Belege", expenses: "Ausgaben", analysis: "Analyse", settings: "Einstellungen" };
  qs("#pageTitle").textContent = titles[view];
  renderTopbarActions(view);
  renderView(view);
  qs("#content").scrollTo?.({ top: 0 });
  window.scrollTo(0, 0);
}

function renderTopbarActions(view) {
  const el = qs("#topbarActions");
  if (view === "overview" || view === "receipts") {
    el.innerHTML = `<button class="btn btn-primary" data-action="open-upload">${iconSvg("plus", 16)}<span>Beleg hinzufügen</span></button>`;
  } else { el.innerHTML = ""; }
}

function renderView(view) {
  if (view === "overview") renderOverview();
  else if (view === "receipts") renderReceipts();
  else if (view === "expenses") renderExpenses();
  else if (view === "analysis") renderAnalysis();
  else if (view === "settings") renderSettings();
  hydrateIcons();
}

/* ---------- Übersicht ---------- */
function renderOverview() {
  const root = qs("#view-overview");
  if (receipts.length === 0) {
    root.innerHTML = emptyStateHtml();
    return;
  }
  const cur = computeMonthStats(receipts, 0);
  const prev = computeMonthStats(receipts, 1);
  const trendPct = prev.total > 0 ? Math.round(((cur.total - prev.total) / prev.total) * 100) : null;
  const trendDir = trendPct == null ? "flat" : trendPct > 0 ? "up" : trendPct < 0 ? "down" : "flat";
  const trendLabel = trendPct == null ? "Noch keine Vergleichsdaten" : `${trendPct > 0 ? "+" : ""}${trendPct}% gegenüber dem vorherigen Zeitraum`;

  const breakdown = categoryBreakdown(cur.list);
  const totalBreak = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const catEntries = Object.entries(breakdown).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

  const lastFive = [...receipts].sort((a, b) => parseDate(b.date) - parseDate(a.date) || b.createdAt - a.createdAt).slice(0, 5);

  root.innerHTML = `
    <div class="hero-card section-gap">
      <div class="hero-label">Gesamt-Ausgaben — ${formatMonthYear(new Date())}</div>
      <div class="hero-amount">${formatCurrency(cur.total)}</div>
      <span class="hero-trend ${trendDir}">${trendDir !== "flat" ? iconSvg(trendDir === "up" ? "arrowUpRight" : "arrowDownRight", 14) : ""}${trendLabel}</span>
    </div>

    <div class="grid grid-stats section-gap">
      ${statCard("Ausgaben", formatCurrency(cur.total), "Dieser Monat")}
      ${statCard("Anzahl Belege", String(cur.count), "Dieser Monat")}
      ${statCard("Ø Einkauf", formatCurrency(cur.avg), "Durchschnittlich")}
      ${statCard("Größter Einkauf", formatCurrency(cur.max), "Dieser Monat")}
    </div>

    <div class="grid grid-2 section-gap">
      <div class="card">
        <div class="card-header"><div><h3 class="card-title">Kategorien</h3><p class="card-subtitle">Ausgaben nach Kategorie · ${formatMonthYear(new Date())}</p></div></div>
        ${catEntries.length ? `<div class="chart-wrap"><canvas id="dashCatChart"></canvas></div>` : `<p class="card-subtitle">Noch keine Ausgaben in diesem Monat.</p>`}
      </div>
      <div class="card">
        <div class="card-header"><div><h3 class="card-title">Kategorien im Detail</h3></div></div>
        <div>${catEntries.map(([c, v]) => catRow(c, v, totalBreak)).join("") || `<p class="card-subtitle">Noch keine Daten.</p>`}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h3 class="card-title">Letzte Belege</h3></div><button class="btn btn-ghost btn-sm" data-action="goto-view" data-view="receipts">Alle anzeigen</button></div>
      ${lastFive.map(receiptRowHtml).join("")}
    </div>
  `;

  if (catEntries.length && typeof Chart !== "undefined") {
    destroyChart("dashCat");
    const ctx = qs("#dashCatChart");
    charts.dashCat = new Chart(ctx, {
      type: "doughnut",
      data: { labels: catEntries.map(([c]) => c), datasets: [{ data: catEntries.map(([, v]) => v), backgroundColor: catEntries.map(([c]) => CATEGORY_COLOR[c]), borderWidth: 0, hoverOffset: 4 }] },
      options: { cutout: "68%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}` } } } }
    });
  }
}

function statCard(label, value, sub) {
  return `<div class="stat-card"><div class="stat-card-label">${label}</div><div class="stat-card-value">${value}</div><div class="stat-card-sub">${sub}</div></div>`;
}
function catRow(cat, value, total) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return `<div class="cat-row"><span class="cat-dot" style="background:${CATEGORY_COLOR[cat]}"></span><span class="cat-row-name">${cat}</span><span class="cat-row-pct">${pct}%</span><span class="cat-row-amount">${formatCurrency(value)}</span></div>`;
}
function receiptRowHtml(r) {
  const cnt = (r.items || []).length;
  return `<div class="receipt-row" data-action="open-detail" data-id="${r.id}">
    <div class="receipt-thumb" style="background:${CATEGORY_COLOR[receiptPrimaryCategory(r)]}">${r.image ? `<img src="${r.image}" alt="">` : CATEGORY_EMOJI[receiptPrimaryCategory(r)]}</div>
    <div class="receipt-main"><div class="receipt-merchant">${escapeHtml(r.merchant)}</div><div class="receipt-meta">${formatDate(r.date)} · ${receiptPrimaryCategory(r)}</div></div>
    <div><div class="receipt-amount">${formatCurrency(r.total)}</div><div class="receipt-items-count">${cnt} Artikel</div></div>
  </div>`;
}
function emptyStateHtml(title = "Noch keine Belege", text = "Fotografiere deinen ersten Kassenbon und entdecke, wohin dein Geld fließt.", btnLabel = "Ersten Beleg hinzufügen", showDemo = true) {
  return `<div class="empty-state">
    <div class="empty-state-icon">${iconSvg("receipt", 30)}</div>
    <h3>${title}</h3><p>${text}</p>
    <div class="empty-state-actions">
      <button class="btn btn-primary" data-action="open-upload">${iconSvg("plus", 15)}<span>${btnLabel}</span></button>
      ${showDemo ? `<button class="btn btn-secondary" data-action="load-demo">${iconSvg("sparkles", 15)}<span>Demo-Daten laden</span></button>` : ""}
    </div>
  </div>`;
}

/* ---------- Belege ---------- */
let receiptsFilter = { search: "", category: "all" };
function renderReceipts() {
  const root = qs("#view-receipts");
  if (receipts.length === 0) { root.innerHTML = emptyStateHtml(); return; }

  let list = [...receipts].sort((a, b) => parseDate(b.date) - parseDate(a.date) || b.createdAt - a.createdAt);
  if (receiptsFilter.search) { const q = receiptsFilter.search.toLowerCase(); list = list.filter((r) => r.merchant.toLowerCase().includes(q) || (r.items || []).some((i) => i.name.toLowerCase().includes(q))); }
  if (receiptsFilter.category !== "all") list = list.filter((r) => receiptPrimaryCategory(r) === receiptsFilter.category);

  root.innerHTML = `
    <div class="filters-bar">
      <div class="search-box">${iconSvg("search", 15)}<input type="text" id="receiptsSearch" placeholder="Händler oder Artikel suchen…" value="${escapeHtml(receiptsFilter.search)}"></div>
      <div class="spacer"></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${["all", ...CATEGORIES].map((c) => `<span class="chip ${receiptsFilter.category === c ? "active" : ""}" data-action="filter-receipts-cat" data-cat="${c}">${c === "all" ? "Alle" : c}</span>`).join("")}
      </div>
    </div>
    ${list.length ? `<div class="receipts-grid">${list.map(receiptCardHtml).join("")}</div>` : `<div class="empty-state"><div class="empty-state-icon">${iconSvg("search", 26)}</div><h3>Keine Treffer</h3><p>Passe deine Suche oder den Filter an.</p></div>`}
  `;
  const searchInput = qs("#receiptsSearch");
  searchInput.focus(); searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
  searchInput.addEventListener("input", (e) => { receiptsFilter.search = e.target.value; renderReceipts(); });
}
function receiptCardHtml(r) {
  const cat = receiptPrimaryCategory(r);
  return `<div class="receipt-card" data-action="open-detail" data-id="${r.id}">
    <div class="receipt-card-image" style="background:${r.image ? "transparent" : CATEGORY_COLOR[cat]}">
      ${r.image ? `<img src="${r.image}" alt="">` : CATEGORY_EMOJI[cat]}
      <span class="receipt-card-cat">${badgeHtml(cat)}</span>
    </div>
    <div class="receipt-card-body">
      <div class="receipt-card-merchant">${escapeHtml(r.merchant)}</div>
      <div class="receipt-card-date">${formatDate(r.date)}</div>
      <div class="receipt-card-footer"><span class="receipt-card-amount">${formatCurrency(r.total)}</span><span class="receipt-card-items">${(r.items || []).length} Artikel</span></div>
    </div>
  </div>`;
}
function badgeHtml(cat) { return `<span class="badge" style="background:${CATEGORY_COLOR[cat]}22;color:${CATEGORY_COLOR[cat]}"><span class="badge-dot" style="background:${CATEGORY_COLOR[cat]}"></span>${cat}</span>`; }

/* ---------- Ausgaben ---------- */
let expenseFilters = { search: "", category: "all", merchant: "all", period: "all", sortKey: "date", sortDir: "desc" };
function renderExpenses() {
  const root = qs("#view-expenses");
  if (receipts.length === 0) { root.innerHTML = emptyStateHtml(); return; }

  let list = [...receipts];
  if (expenseFilters.period !== "all") { const { start, end } = getRange(expenseFilters.period, 0); list = receiptsInRange(list, start, end); }
  if (expenseFilters.category !== "all") list = list.filter((r) => receiptPrimaryCategory(r) === expenseFilters.category);
  if (expenseFilters.merchant !== "all") list = list.filter((r) => r.merchant === expenseFilters.merchant);
  if (expenseFilters.search) { const q = expenseFilters.search.toLowerCase(); list = list.filter((r) => r.merchant.toLowerCase().includes(q) || (r.items || []).some((i) => i.name.toLowerCase().includes(q))); }

  const dir = expenseFilters.sortDir === "asc" ? 1 : -1;
  list.sort((a, b) => {
    if (expenseFilters.sortKey === "date") return dir * (parseDate(a.date) - parseDate(b.date));
    if (expenseFilters.sortKey === "amount") return dir * (a.total - b.total);
    if (expenseFilters.sortKey === "merchant") return dir * a.merchant.localeCompare(b.merchant);
    if (expenseFilters.sortKey === "category") return dir * receiptPrimaryCategory(a).localeCompare(receiptPrimaryCategory(b));
    return 0;
  });

  const total = sumTotal(list);
  const merchantsUsed = [...new Set(receipts.map((r) => r.merchant))].sort();
  const periodOptions = [["all", "Gesamter Zeitraum"], ["week", "Diese Woche"], ["month", "Dieser Monat"], ["3months", "Letzte 3 Monate"], ["year", "Letztes Jahr"]];

  root.innerHTML = `
    <div class="card section-gap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <div><div class="card-subtitle" style="margin-bottom:4px;">Gesamtausgaben im ausgewählten Zeitraum</div><div class="hero-amount" style="font-size:28px;">${formatCurrency(total)}</div></div>
      <div class="card-subtitle">${list.length} Belege</div>
    </div>

    <div class="filters-bar">
      <div class="search-box">${iconSvg("search", 15)}<input type="text" id="expSearch" placeholder="Suchen…" value="${escapeHtml(expenseFilters.search)}"></div>
      <select class="select" id="expPeriod" style="width:auto;">${periodOptions.map(([v, l]) => `<option value="${v}" ${expenseFilters.period === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <select class="select" id="expCategory" style="width:auto;"><option value="all">Alle Kategorien</option>${CATEGORIES.map((c) => `<option value="${c}" ${expenseFilters.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      <select class="select" id="expMerchant" style="width:auto;"><option value="all">Alle Händler</option>${merchantsUsed.map((m) => `<option value="${escapeHtml(m)}" ${expenseFilters.merchant === m ? "selected" : ""}>${escapeHtml(m)}</option>`).join("")}</select>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>
          <th data-sort="date">Datum ${sortArrow("date")}</th>
          <th data-sort="merchant">Händler ${sortArrow("merchant")}</th>
          <th data-sort="category">Kategorie ${sortArrow("category")}</th>
          <th>Artikel</th>
          <th data-sort="amount" style="text-align:right;">Betrag ${sortArrow("amount")}</th>
        </tr></thead>
        <tbody>
          ${list.length ? list.map((r) => `<tr data-action="open-detail" data-id="${r.id}">
              <td>${formatDate(r.date)}</td><td>${escapeHtml(r.merchant)}</td><td>${badgeHtml(receiptPrimaryCategory(r))}</td>
              <td class="cell-items">${escapeHtml((r.items || []).slice(0, 2).map((i) => i.name).join(", "))}${(r.items || []).length > 2 ? ` +${r.items.length - 2}` : ""}</td>
              <td class="cell-amount">${formatCurrency(r.total)}</td></tr>`).join("")
      : `<tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:30px;">Keine Belege für diese Filter.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  const s = qs("#expSearch"); s.focus(); s.setSelectionRange(s.value.length, s.value.length);
  s.addEventListener("input", (e) => { expenseFilters.search = e.target.value; renderExpenses(); });
  qs("#expPeriod").addEventListener("change", (e) => { expenseFilters.period = e.target.value; renderExpenses(); });
  qs("#expCategory").addEventListener("change", (e) => { expenseFilters.category = e.target.value; renderExpenses(); });
  qs("#expMerchant").addEventListener("change", (e) => { expenseFilters.merchant = e.target.value; renderExpenses(); });
  qsa("th[data-sort]").forEach((th) => th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (expenseFilters.sortKey === key) expenseFilters.sortDir = expenseFilters.sortDir === "asc" ? "desc" : "asc";
    else { expenseFilters.sortKey = key; expenseFilters.sortDir = "desc"; }
    renderExpenses();
  }));
}
function sortArrow(key) { if (expenseFilters.sortKey !== key) return ""; return expenseFilters.sortDir === "asc" ? "↑" : "↓"; }

/* ---------- Analyse ---------- */
let analysisPeriodType = "month";
function renderAnalysis() {
  const root = qs("#view-analysis");
  if (receipts.length === 0) { root.innerHTML = emptyStateHtml("Noch keine Analyse möglich", "Sobald du Belege hinzufügst, zeigen wir dir hier, wohin dein Geld fließt.", "Ersten Beleg hinzufügen"); return; }

  const summary = generateSmartSummary(receipts);
  const insights = generateInsights(receipts);
  const stats = productStats(receipts);

  const cur = getRange(analysisPeriodType, 0), prev = getRange(analysisPeriodType, 1);
  const curTotal = sumTotal(receiptsInRange(receipts, cur.start, cur.end));
  const prevTotal = sumTotal(receiptsInRange(receipts, prev.start, prev.end));
  const diffPct = prevTotal > 0 ? Math.round(((curTotal - prevTotal) / prevTotal) * 100) : null;

  const curBreak = categoryBreakdown(receiptsInRange(receipts, cur.start, cur.end));
  const prevBreak = categoryBreakdown(receiptsInRange(receipts, prev.start, prev.end));
  const topCats = CATEGORIES.filter((c) => curBreak[c] > 0 || prevBreak[c] > 0).sort((a, b) => curBreak[b] - curBreak[a]).slice(0, 6);

  const mostFrequent = [...stats].sort((a, b) => b.count - a.count).slice(0, 4);
  const mostExpensive = [...stats].sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 4);
  const risers = [...stats].filter((p) => p.count >= 2).sort((a, b) => b.priceChangePct - a.priceChangePct).slice(0, 3).filter(p=>p.priceChangePct>0);
  const fallers = [...stats].filter((p) => p.count >= 2).sort((a, b) => a.priceChangePct - b.priceChangePct).slice(0, 3).filter(p=>p.priceChangePct<0);

  root.innerHTML = `
    <h2 style="font-family:var(--font-display);font-size:19px;font-weight:800;letter-spacing:-0.01em;margin:2px 0 16px;">Was passiert mit meinem Geld?</h2>

    ${summary ? `<div class="card summary-card section-gap">
      <div class="card-title">${iconSvg("sparkles", 17)} Dein ${summary.monthName} in 3 Sätzen</div>
      <div class="summary-text">${summary.sentences.map((s) => `<p style="margin:0 0 8px;">${s}</p>`).join("")}</div>
    </div>` : ""}

    <div class="grid grid-2 section-gap">
      <div class="card">
        <div class="card-header">
          <div><h3 class="card-title">Zeitvergleich</h3><p class="card-subtitle">Aktueller vs. vorheriger Zeitraum</p></div>
        </div>
        <div class="segmented" style="margin-bottom:14px;">
          ${[["week", "Woche"], ["month", "Monat"], ["3months", "3 Monate"], ["year", "Jahr"]].map(([v, l]) => `<button data-action="set-analysis-period" data-period="${v}" class="${analysisPeriodType === v ? "active" : ""}">${l}</button>`).join("")}
        </div>
        <div class="chart-wrap"><canvas id="compareChart"></canvas></div>
        <div class="compare-row"><span class="compare-period">${cur.label}</span><span class="compare-value">${formatCurrency(curTotal)}</span></div>
        <div class="compare-row"><span class="compare-period">${prev.labelPrev}</span><span class="compare-value">${formatCurrency(prevTotal)}</span></div>
        ${diffPct != null ? `<div class="hero-trend ${diffPct > 0 ? "up" : diffPct < 0 ? "down" : "flat"}" style="margin-top:8px;">${diffPct > 0 ? "+" : ""}${diffPct}% gegenüber ${prev.labelPrev.toLowerCase()}</div>` : ""}
      </div>

      <div class="card">
        <div class="card-header"><div><h3 class="card-title">Kategorien-Trend</h3><p class="card-subtitle">Dieser Monat vs. Vormonat</p></div></div>
        ${topCats.length ? `<div class="chart-wrap tall"><canvas id="catTrendChart"></canvas></div>` : `<p class="card-subtitle">Noch nicht genug Daten.</p>`}
      </div>
    </div>

    <div class="card section-gap">
      <div class="card-header"><div><h3 class="card-title">Erkenntnisse</h3><p class="card-subtitle">Automatisch aus deinen Belegen abgeleitet</p></div></div>
      ${insights.length ? `<div class="insight-list">${insights.map((i) => `<div class="insight-item"><div class="insight-icon ${i.type}">${iconSvg(i.icon, 16)}</div><div class="insight-text">${i.text}</div></div>`).join("")}</div>` : `<p class="card-subtitle">Noch keine besonderen Auffälligkeiten — sammle weiter Belege.</p>`}
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h3 class="card-title">Am häufigsten gekauft</h3>
        <div class="product-list">${mostFrequent.length ? mostFrequent.map((p) => productRow(p, `${p.count}× gekauft`, `Ø ${formatCurrency(p.avgPrice)}`)).join("") : emptyProductHint()}</div>
      </div>
      <div class="card">
        <h3 class="card-title">Am teuersten</h3>
        <div class="product-list">${mostExpensive.length ? mostExpensive.map((p) => productRow(p, `${p.count}× gekauft`, `Ø ${formatCurrency(p.avgPrice)}`)).join("") : emptyProductHint()}</div>
      </div>
      <div class="card">
        <h3 class="card-title">Stärkster Preisanstieg</h3>
        <div class="product-list">${risers.length ? risers.map((p) => productRow(p, `${formatCurrency(p.first.unitPrice)} → ${formatCurrency(p.last.unitPrice)}`, `+${Math.round(p.priceChangePct)}%`, "up")).join("") : emptyProductHint("Keine Preisanstiege erkannt.")}</div>
      </div>
      <div class="card">
        <h3 class="card-title">Stärkster Preisrückgang</h3>
        <div class="product-list">${fallers.length ? fallers.map((p) => productRow(p, `${formatCurrency(p.first.unitPrice)} → ${formatCurrency(p.last.unitPrice)}`, `${Math.round(p.priceChangePct)}%`, "down")).join("") : emptyProductHint("Keine Preisrückgänge erkannt.")}</div>
      </div>
    </div>
  `;

  destroyChart("compare"); destroyChart("catTrend");
  if (typeof Chart === "undefined") { hydrateIcons(); return; }
  charts.compare = new Chart(qs("#compareChart"), {
    type: "bar",
    data: { labels: [prev.labelPrev, cur.label], datasets: [{ data: [prevTotal, curTotal], backgroundColor: [CATEGORY_COLOR.Sonstiges + "55", CATEGORY_COLOR.Technik], borderRadius: 8, maxBarThickness: 60 }] },
    options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatCurrency(c.parsed.y)}` } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) }, grid: { color: "rgba(128,128,128,0.12)" } }, x: { grid: { display: false } } } }
  });

  if (topCats.length) {
    charts.catTrend = new Chart(qs("#catTrendChart"), {
      type: "bar",
      data: { labels: topCats, datasets: [
        { label: "Vormonat", data: topCats.map((c) => prevBreak[c] || 0), backgroundColor: "rgba(142,142,147,0.35)", borderRadius: 6, maxBarThickness: 20 },
        { label: "Dieser Monat", data: topCats.map((c) => curBreak[c] || 0), backgroundColor: topCats.map((c) => CATEGORY_COLOR[c]), borderRadius: 6, maxBarThickness: 20 }
      ] },
      options: { indexAxis: "y", plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${formatCurrency(c.parsed.x)}` } } }, scales: { x: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v) }, grid: { color: "rgba(128,128,128,0.12)" } }, y: { grid: { display: false } } } }
    });
  }
}
function productRow(p, subtext, valueText, trend) {
  return `<div class="product-row"><div class="product-emoji">${productEmoji(p.name)}</div><div><div class="product-name">${escapeHtml(p.name)}</div><div class="product-sub">${subtext}</div></div><div class="product-value ${trend ? "product-trend " + trend : ""}">${valueText}</div></div>`;
}
function emptyProductHint(text = "Noch nicht genug Daten.") { return `<p class="card-subtitle">${text}</p>`; }

/* ---------- Einstellungen ---------- */
function renderSettings() {
  const root = qs("#view-settings");
  const s = getSettings();
  const demoCount = receipts.filter((r) => r.isDemo).length;
  root.innerHTML = `
    <div class="privacy-banner">${iconSvg("lock", 18)}<span>Deine Daten bleiben auf diesem Gerät. Nichts wird ohne deine ausdrückliche Aktion an einen Server gesendet.</span></div>

    <div class="card settings-section">
      <h3 class="card-title">Darstellung</h3>
      <div class="settings-row">
        <div><div class="settings-row-label">Design</div><div class="settings-row-desc">Hell, Dunkel oder passend zum System.</div></div>
        <div class="segmented">
          <button data-action="set-theme" data-theme="light" class="${s.theme === "light" ? "active" : ""}">Hell</button>
          <button data-action="set-theme" data-theme="dark" class="${s.theme === "dark" ? "active" : ""}">Dunkel</button>
          <button data-action="set-theme" data-theme="system" class="${s.theme === "system" ? "active" : ""}">System</button>
        </div>
      </div>
    </div>

    <div class="card settings-section">
      <h3 class="card-title">KI-Konfiguration</h3>
      <p class="card-subtitle">Die Beleganalyse funktioniert standardmäßig im Demo-Modus mit realistischen Beispieldaten. Für echte Texterkennung kann später ein eigener Backend-Proxy angebunden werden.</p>
      <div class="field">
        <label>AI_PROVIDER</label>
        <select class="select" id="settingsAiProvider">
          <option value="demo" ${s.aiProvider === "demo" ? "selected" : ""}>Demo-Modus (lokal, ohne KI)</option>
          <option value="custom" ${s.aiProvider === "custom" ? "selected" : ""}>Eigener API-Proxy</option>
        </select>
      </div>
      <div class="field" id="endpointField" style="${s.aiProvider === "custom" ? "" : "display:none;"}">
        <label>AI_API_ENDPOINT</label>
        <input class="input" id="settingsAiEndpoint" type="url" placeholder="https://dein-backend.example.com/api/analyze-receipt" value="${escapeHtml(s.aiApiEndpoint || "")}">
        <div class="field-hint">Wichtig: API-Zugangsdaten dürfen niemals im Frontend gespeichert werden. Dieser Endpunkt sollte ein eigener Server sein, der den echten KI-/OCR-Anbieter mit serverseitig verwahrtem Schlüssel aufruft und ein normalisiertes Ergebnis zurückgibt.</div>
      </div>
      <button class="btn btn-secondary btn-sm" data-action="save-ai-settings">Speichern</button>
    </div>

    <div class="card settings-section">
      <h3 class="card-title">Demo-Modus</h3>
      <p class="card-subtitle">Lade realistische Beispiel-Belege, um die App direkt vollständig gefüllt zu sehen.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-secondary" data-action="load-demo">${iconSvg("sparkles", 15)}<span>Demo-Daten laden</span></button>
        ${demoCount ? `<button class="btn btn-ghost" data-action="remove-demo">${iconSvg("trash", 15)}<span>Demo-Daten entfernen (${demoCount})</span></button>` : ""}
      </div>
    </div>

    <div class="card settings-section">
      <h3 class="card-title">Daten verwalten</h3>
      <div class="settings-row">
        <div><div class="settings-row-label">Daten exportieren</div><div class="settings-row-desc">Alle Belege als JSON oder CSV sichern.</div></div>
        <div style="display:flex;gap:8px;"><button class="btn btn-secondary btn-sm" data-action="export-json">JSON</button><button class="btn btn-secondary btn-sm" data-action="export-csv">CSV</button></div>
      </div>
      <div class="settings-row">
        <div><div class="settings-row-label">Daten importieren</div><div class="settings-row-desc">Zuvor exportierte JSON-Datei wieder einlesen.</div></div>
        <button class="btn btn-secondary btn-sm" data-action="trigger-import">Datei wählen</button>
      </div>
    </div>

    <div class="danger-zone">
      <h3 class="card-title" style="color:var(--danger);">Alle Daten löschen</h3>
      <p class="card-subtitle">Entfernt unwiderruflich alle gespeicherten Belege von diesem Gerät.</p>
      <button class="btn btn-danger btn-sm" data-action="delete-all">${iconSvg("trash", 15)}<span>Alle Daten löschen</span></button>
    </div>

    <input type="file" id="importFileInput" accept="application/json" class="hidden-input">
    <p style="text-align:center;color:var(--text-tertiary);font-size:11.5px;margin-top:24px;">BelegFlow · Version 1.0 · Läuft vollständig lokal in deinem Browser</p>
  `;

  qs("#settingsAiProvider").addEventListener("change", (e) => { qs("#endpointField").style.display = e.target.value === "custom" ? "" : "none"; });
}

/* ==========================================================================
   8. Modals
   ========================================================================== */

const modalRoot = () => qs("#modalRoot");
function closeModal() { modalRoot().innerHTML = ""; }
function openModalHtml(html, opts = {}) {
  modalRoot().innerHTML = `<div class="modal-overlay" id="activeOverlay"><div class="modal ${opts.large ? "modal-lg" : ""}">${html}</div></div>`;
  hydrateIcons(modalRoot());
  qs("#activeOverlay").addEventListener("mousedown", (e) => { if (e.target.id === "activeOverlay") closeModal(); });
}

/* ---- Upload / Analyse / Review Flow ---- */
let uploadState = null;
function openUploadModal() {
  uploadState = { step: "select", file: null, imageDataUrl: null, isPdf: false, draft: null };
  renderUploadModal();
}
function renderUploadModal() {
  const st = uploadState;
  let body = "";
  if (st.step === "select") {
    body = `
      <div class="modal-header"><h2>Beleg hinzufügen</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
      <div class="modal-body">
        <div class="dropzone" id="dropzone">
          <div class="dropzone-icon">${iconSvg("upload", 22)}</div>
          <h3>Datei hierher ziehen</h3>
          <p>oder wähle eine Option — JPG, PNG, WEBP oder PDF</p>
          <div class="dropzone-actions">
            <button class="btn btn-primary" data-action="pick-file">${iconSvg("file", 15)}<span>Datei auswählen</span></button>
            <button class="btn btn-secondary" data-action="pick-camera">${iconSvg("camera", 15)}<span>Kamera</span></button>
          </div>
          <div class="dropzone-hint">Deine Daten bleiben auf diesem Gerät.</div>
        </div>
        <input type="file" id="fileInput" class="hidden-input" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf">
        <input type="file" id="cameraInput" class="hidden-input" accept="image/*" capture="environment">
      </div>`;
  } else if (st.step === "preview") {
    body = `
      <div class="modal-header"><h2>Beleg-Vorschau</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
      <div class="modal-body">
        <div class="preview-wrap">
          ${st.isPdf ? `<div class="preview-pdf">${iconSvg("file", 30)}<p style="margin-top:10px;">${escapeHtml(st.file?.name || "Dokument.pdf")}</p></div>` : `<img class="preview-image" src="${st.imageDataUrl}" alt="Beleg-Vorschau">`}
        </div>
      </div>
      <div class="modal-footer split">
        <button class="btn btn-ghost" data-action="reset-upload">Anderes Bild wählen</button>
        <button class="btn btn-primary" data-action="analyze-receipt">${iconSvg("sparkles", 15)}<span>Beleg analysieren</span></button>
      </div>`;
  } else if (st.step === "analyzing") {
    body = `
      <div class="modal-header"><h2>Beleg wird analysiert</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
      <div class="modal-body">
        <div class="analyzing-wrap">
          <div class="spinner"></div>
          <h3>Belegdaten werden erkannt…</h3>
          <p>Händler, Artikel und Beträge werden extrahiert.</p>
        </div>
      </div>`;
  } else if (st.step === "review") {
    body = reviewStepHtml(st.draft, { showConfidence: true, title: "Beleg überprüfen" });
  }
  openModalHtml(body, { large: st.step === "review" });
  if (st.step === "select") bindDropzoneEvents();
  if (st.step === "review") bindReviewFormEvents(st.draft, { onSave: saveDraftAsNewReceipt, onReanalyze: reanalyzeInModal });
}

function bindDropzoneEvents() {
  const dz = qs("#dropzone"), fileInput = qs("#fileInput"), cameraInput = qs("#cameraInput");
  qs('[data-action="pick-file"]').addEventListener("click", () => fileInput.click());
  qs('[data-action="pick-camera"]').addEventListener("click", () => cameraInput.click());
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFileSelected(fileInput.files[0]); });
  cameraInput.addEventListener("change", () => { if (cameraInput.files[0]) handleFileSelected(cameraInput.files[0]); });
  dz.addEventListener("click", (e) => { if (e.target === dz || e.target.closest("h3, p")) fileInput.click(); });
  ["dragenter", "dragover"].forEach((evt) => dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((evt) => dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.remove("dragover"); }));
  dz.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) handleFileSelected(f); });
}
function handleFileSelected(file) {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type) && !/\.(jpe?g|png|webp|pdf)$/i.test(file.name)) { showToast("Dateiformat wird nicht unterstützt.", "alert"); return; }
  uploadState.file = file; uploadState.isPdf = file.type === "application/pdf";
  const reader = new FileReader();
  reader.onload = () => { uploadState.imageDataUrl = uploadState.isPdf ? null : reader.result; uploadState.step = "preview"; renderUploadModal(); };
  reader.readAsDataURL(file);
}
function resetUpload() { uploadState.step = "select"; uploadState.file = null; uploadState.imageDataUrl = null; renderUploadModal(); }

async function runAnalysis() {
  uploadState.step = "analyzing"; renderUploadModal();
  const result = await analyzeReceipt(uploadState.imageDataUrl);
  uploadState.draft = draftFromAnalysis(result, uploadState.imageDataUrl);
  uploadState.step = "review"; renderUploadModal();
}
async function reanalyzeInModal() {
  uploadState.step = "analyzing"; renderUploadModal();
  const result = await analyzeReceipt(uploadState.imageDataUrl);
  uploadState.draft = draftFromAnalysis(result, uploadState.imageDataUrl);
  uploadState.step = "review"; renderUploadModal();
  showToast("Beleg erneut analysiert", "sparkles");
}
function draftFromAnalysis(result, imageDataUrl) {
  return {
    id: null, merchant: result.merchant, date: result.date, time: result.time,
    total: result.total, currency: result.currency || "EUR", vat: result.vat,
    paymentMethod: result.paymentMethod, items: result.items.map((i) => ({ ...i })),
    notes: "", image: imageDataUrl, isDemo: false,
    confidence: { merchant: result.merchantConfidence, date: result.dateConfidence, total: result.totalConfidence, vat: result.vatConfidence }
  };
}
function saveDraftAsNewReceipt(draft) {
  draft.id = uid(); draft.createdAt = Date.now(); delete draft.confidence;
  addReceipt(draft);
  closeModal();
  showToast("Beleg gespeichert", "check");
  switchView(currentView === "settings" ? "overview" : currentView);
  if (currentView === "overview" || currentView === "receipts" || currentView === "expenses" || currentView === "analysis") renderView(currentView);
}

/* ---- Gemeinsame Review-/Edit-Form ---- */
function reviewStepHtml(draft, { showConfidence, title }) {
  const warn = (field) => showConfidence && draft.confidence && draft.confidence[field] === "low";
  return `
    <div class="modal-header"><h2>${title}</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
    <div class="modal-body">
      <div class="review-grid">
        <div class="field ${warn("merchant") ? "warn" : ""}" data-fieldwrap="merchant">
          <label>Händler</label><input class="input" data-field="merchant" value="${escapeHtml(draft.merchant)}">
          ${warn("merchant") ? confidenceWarnHtml() : ""}
        </div>
        <div class="field ${warn("date") ? "warn" : ""}" data-fieldwrap="date">
          <label>Datum</label><input class="input" type="date" data-field="date" value="${draft.date}">
          ${warn("date") ? confidenceWarnHtml() : ""}
        </div>
        <div class="field">
          <label>Uhrzeit</label><input class="input" type="time" data-field="time" value="${draft.time || ""}">
        </div>
        <div class="field">
          <label>Zahlungsart</label>
          <select class="select" data-field="paymentMethod">
            <option value="">Unbekannt</option>
            ${PAYMENT_METHODS.map((p) => `<option value="${p}" ${draft.paymentMethod === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
        <div class="field ${warn("total") ? "warn" : ""}" data-fieldwrap="total">
          <label>Gesamt (€)</label><input class="input" type="number" step="0.01" data-field="total" value="${draft.total}">
          ${warn("total") ? confidenceWarnHtml() : ""}
        </div>
        <div class="field ${warn("vat") ? "warn" : ""}" data-fieldwrap="vat">
          <label>MwSt. (€)</label><input class="input" type="number" step="0.01" data-field="vat" value="${draft.vat != null ? draft.vat : ""}">
          ${warn("vat") ? confidenceWarnHtml() : ""}
        </div>
      </div>

      <label style="font-size:12.5px;font-weight:600;color:var(--text-secondary);">Artikel</label>
      <div class="items-editor" id="itemsEditor">${itemsEditorHtml(draft.items)}</div>
      <div class="items-total-row"><span>Summe Artikel</span><span id="itemsSum">${formatCurrency(itemsSum(draft.items))}</span></div>

      <div class="field full" style="margin-top:14px;">
        <label>Notizen</label><textarea class="textarea" data-field="notes" placeholder="Optionale Notiz…">${escapeHtml(draft.notes || "")}</textarea>
      </div>
    </div>
    <div class="modal-footer split">
      ${showConfidence ? `<button class="btn btn-ghost" data-action="reanalyze">${iconSvg("sparkles", 15)}<span>Erneut analysieren</span></button>` : `<span></span>`}
      <button class="btn btn-primary" data-action="save-review">${iconSvg("check", 15)}<span>Speichern</span></button>
    </div>
  `;
}
function confidenceWarnHtml() { return `<span class="confidence-warn">${iconSvg("alert", 12)} Unsichere Erkennung</span>`; }
function itemsSum(items) { return round2(items.reduce((s, i) => s + i.totalPrice, 0)); }
function itemsEditorHtml(items) {
  return `<div class="item-row item-row-header"><span>Artikel</span><span>Menge</span><span>Einzelpreis</span><span>Gesamt</span><span></span></div>
    ${items.map((it, idx) => `
    <div class="item-row" data-item-idx="${idx}">
      <input value="${escapeHtml(it.name)}" data-item-field="name">
      <input type="number" min="0" step="1" value="${it.quantity}" data-item-field="quantity">
      <input type="number" min="0" step="0.01" value="${it.unitPrice}" data-item-field="unitPrice">
      <input type="number" min="0" step="0.01" value="${it.totalPrice}" data-item-field="totalPrice" data-manual="0">
      <button class="item-remove" data-action="remove-item" data-idx="${idx}">${iconSvg("trash", 14)}</button>
    </div>`).join("")}
    <div class="add-item-btn" data-action="add-item">${iconSvg("plus", 13)} Artikel hinzufügen</div>`;
}

function bindReviewFormEvents(draft, { onSave, onReanalyze }) {
  const body = qs(".modal");
  qsa("[data-field]", body).forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.dataset.field;
      let val = input.value;
      if (["total", "vat"].includes(field)) val = val === "" ? null : Number(val);
      draft[field] = val;
      if (draft.confidence && draft.confidence[field]) { delete draft.confidence[field]; qs(`[data-fieldwrap="${field}"]`)?.classList.remove("warn"); qs(`[data-fieldwrap="${field}"] .confidence-warn`)?.remove(); }
    });
  });

  function refreshItemsEditor() { qs("#itemsEditor").innerHTML = itemsEditorHtml(draft.items); qs("#itemsSum").textContent = formatCurrency(itemsSum(draft.items)); bindItemRowEvents(); }
  function bindItemRowEvents() {
    qsa("#itemsEditor [data-item-field]").forEach((input) => {
      input.addEventListener("input", () => {
        const row = input.closest(".item-row"); const idx = Number(row.dataset.itemIdx); const field = input.dataset.itemField;
        const item = draft.items[idx];
        if (field === "quantity" || field === "unitPrice") {
          item[field] = Number(input.value) || 0;
          item.totalPrice = round2(item.quantity * item.unitPrice);
          row.querySelector('[data-item-field="totalPrice"]').value = item.totalPrice;
        } else if (field === "totalPrice") {
          item.totalPrice = Number(input.value) || 0;
        } else { item[field] = input.value; if (field === "name") item.category = guessCategory(input.value); }
        qs("#itemsSum").textContent = formatCurrency(itemsSum(draft.items));
      });
    });
    qsa('[data-action="remove-item"]', qs("#itemsEditor")).forEach((btn) => btn.addEventListener("click", () => { draft.items.splice(Number(btn.dataset.idx), 1); refreshItemsEditor(); }));
    qs('[data-action="add-item"]').addEventListener("click", () => { draft.items.push({ name: "Neuer Artikel", quantity: 1, unitPrice: 0, totalPrice: 0, category: "Sonstiges", confidence: "high" }); refreshItemsEditor(); });
  }
  bindItemRowEvents();

  qs('[data-action="save-review"]').addEventListener("click", () => onSave(draft));
  const reBtn = qs('[data-action="reanalyze"]'); if (reBtn && onReanalyze) reBtn.addEventListener("click", onReanalyze);
}

/* ---- Beleg-Details ---- */
function openDetailModal(id) {
  const r = getReceipt(id);
  if (!r) return;
  renderDetailModal(r);
}
function renderDetailModal(r) {
  const cat = receiptPrimaryCategory(r);
  const body = `
    <div class="modal-header"><h2>Belegdetails</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
    <div class="modal-body">
      <div class="detail-header">
        <div class="detail-image">${r.image ? `<img src="${r.image}" alt="Beleg">` : iconSvg("receipt", 40)}</div>
        <div class="detail-main">
          <div class="detail-merchant">${escapeHtml(r.merchant)}</div>
          ${badgeHtml(cat)}
          <div class="detail-meta-row">
            <div class="detail-meta-item"><div class="label">Datum</div><div class="value">${formatDateLong(r.date)}${r.time ? " · " + r.time : ""}</div></div>
            <div class="detail-meta-item"><div class="label">Gesamtbetrag</div><div class="value">${formatCurrency(r.total)}</div></div>
            <div class="detail-meta-item"><div class="label">MwSt.</div><div class="value">${r.vat != null ? formatCurrency(r.vat) : "—"}</div></div>
            <div class="detail-meta-item"><div class="label">Zahlungsart</div><div class="value">${r.paymentMethod || "—"}</div></div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-secondary btn-sm" data-action="edit-receipt" data-id="${r.id}">${iconSvg("edit", 14)}<span>Bearbeiten</span></button>
            <button class="btn btn-danger btn-sm" data-action="delete-receipt" data-id="${r.id}">${iconSvg("trash", 14)}<span>Löschen</span></button>
          </div>
        </div>
      </div>
      <table class="detail-items-table">
        <thead><tr><th>Artikel</th><th>Menge</th><th>Einzelpreis</th><th>Kategorie</th><th style="text-align:right;">Gesamt</th></tr></thead>
        <tbody>${(r.items || []).map((i) => `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td><td>${badgeHtml(i.category)}</td><td style="text-align:right;font-weight:600;">${formatCurrency(i.totalPrice)}</td></tr>`).join("") || `<tr><td colspan="5" style="color:var(--text-tertiary);">Keine Artikel erfasst.</td></tr>`}</tbody>
      </table>
      ${r.notes ? `<div style="margin-top:16px;"><div class="label" style="font-size:11px;color:var(--text-tertiary);text-transform:uppercase;font-weight:700;margin-bottom:6px;">Notizen</div><div class="detail-notes">${escapeHtml(r.notes)}</div></div>` : ""}
    </div>
  `;
  openModalHtml(body, { large: true });
}
function openEditModal(id) {
  const r = getReceipt(id);
  if (!r) return;
  const draft = JSON.parse(JSON.stringify(r));
  draft.confidence = {};
  const html = reviewStepHtml(draft, { showConfidence: false, title: "Beleg bearbeiten" });
  openModalHtml(html, { large: true });
  bindReviewFormEvents(draft, { onSave: (d) => { updateReceipt(id, d); closeModal(); showToast("Änderungen gespeichert", "check"); renderView(currentView); } });
}
function confirmDeleteReceipt(id) {
  const r = getReceipt(id);
  openModalHtml(`
    <div class="modal-header"><h2>Beleg löschen</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
    <div class="modal-body"><p style="font-size:14px;">Möchtest du den Beleg von <b>${escapeHtml(r.merchant)}</b> vom ${formatDate(r.date)} über ${formatCurrency(r.total)} wirklich unwiderruflich löschen?</p></div>
    <div class="modal-footer"><button class="btn btn-secondary" data-action="close-modal">Abbrechen</button><button class="btn btn-danger" data-action="confirm-delete-receipt" data-id="${id}">Löschen</button></div>
  `);
}

/* ---- Sonstige Bestätigungsdialoge ---- */
function confirmDialog({ title, text, confirmLabel, danger, onConfirm }) {
  openModalHtml(`
    <div class="modal-header"><h2>${title}</h2><button class="icon-btn-close" data-action="close-modal">${iconSvg("x", 16)}</button></div>
    <div class="modal-body"><p style="font-size:14px;">${text}</p></div>
    <div class="modal-footer"><button class="btn btn-secondary" data-action="close-modal">Abbrechen</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirmDialogBtn">${confirmLabel}</button></div>
  `);
  qs("#confirmDialogBtn").addEventListener("click", () => { closeModal(); onConfirm(); });
}

/* ==========================================================================
   Toasts
   ========================================================================== */
function showToast(message, icon = "check") {
  const root = qs("#toastRoot");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${iconSvg(icon, 15)}<span>${escapeHtml(message)}</span>`;
  root.appendChild(t);
  setTimeout(() => { t.classList.add("leaving"); setTimeout(() => t.remove(), 220); }, 2400);
}

/* ==========================================================================
   Export / Import
   ========================================================================== */
function exportJson() {
  const blob = new Blob([JSON.stringify(receipts, null, 2)], { type: "application/json" });
  downloadBlob(blob, `belegflow-export-${todayISO()}.json`);
  showToast("JSON-Export erstellt", "download");
}
function exportCsv() {
  const header = ["Datum", "Händler", "Kategorie", "Artikelanzahl", "Betrag", "Zahlungsart", "Notizen"];
  const rows = receipts.map((r) => [r.date, r.merchant, receiptPrimaryCategory(r), (r.items || []).length, r.total.toFixed(2).replace(".", ","), r.paymentMethod || "", (r.notes || "").replace(/[\r\n]+/g, " ")]);
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `belegflow-export-${todayISO()}.csv`);
  showToast("CSV-Export erstellt", "download");
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("Ungültiges Format");
      const imported = data.map((r) => ({ ...r, id: uid() }));
      receipts = receipts.concat(imported);
      saveReceipts();
      showToast(`${imported.length} Belege importiert`, "check");
      renderView(currentView);
    } catch (err) {
      showToast("Import fehlgeschlagen: Ungültige Datei", "alert");
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   9. Theme
   ========================================================================== */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
  qs("#themeToggle")?.setAttribute("data-mode", theme);
}

/* ==========================================================================
   9. Event-Wiring & Init
   ========================================================================== */
function wireGlobalActions() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) return;
    const action = t.dataset.action;
    switch (action) {
      case "open-upload": openUploadModal(); break;
      case "close-modal": closeModal(); break;
      case "reset-upload": resetUpload(); break;
      case "analyze-receipt": runAnalysis(); break;
      case "reanalyze": reanalyzeInModal(); break;
      case "save-review": break; // handled inline in bindReviewFormEvents
      case "goto-view": switchView(t.dataset.view); break;
      case "load-demo": handleLoadDemo(); break;
      case "remove-demo": handleRemoveDemo(); break;
      case "open-detail": openDetailModal(t.dataset.id); break;
      case "edit-receipt": openEditModal(t.dataset.id); break;
      case "delete-receipt": confirmDeleteReceipt(t.dataset.id); break;
      case "confirm-delete-receipt":
        deleteReceipt(t.dataset.id); closeModal(); showToast("Beleg gelöscht", "trash"); renderView(currentView); break;
      case "filter-receipts-cat": receiptsFilter.category = t.dataset.cat; renderReceipts(); break;
      case "set-analysis-period": analysisPeriodType = t.dataset.period; renderAnalysis(); break;
      case "set-theme": saveSettings({ theme: t.dataset.theme }); applyTheme(t.dataset.theme); renderSettings(); break;
      case "export-json": exportJson(); break;
      case "export-csv": exportCsv(); break;
      case "trigger-import": qs("#importFileInput").click(); break;
      case "save-ai-settings": {
        const provider = qs("#settingsAiProvider").value;
        const endpoint = qs("#settingsAiEndpoint")?.value || "";
        saveSettings({ aiProvider: provider, aiApiEndpoint: endpoint });
        showToast("KI-Einstellungen gespeichert", "check");
        break;
      }
      case "delete-all":
        confirmDialog({ title: "Alle Daten löschen", text: "Dies entfernt <b>alle</b> gespeicherten Belege unwiderruflich von diesem Gerät. Diese Aktion kann nicht rückgängig gemacht werden.", confirmLabel: "Endgültig löschen", danger: true, onConfirm: () => { receipts = []; saveReceipts(); showToast("Alle Daten gelöscht", "trash"); switchView("overview"); } });
        break;
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "importFileInput" && e.target.files[0]) {
      const file = e.target.files[0];
      confirmDialog({ title: "Daten importieren", text: `Möchtest du die Datei <b>${escapeHtml(file.name)}</b> importieren? Die enthaltenen Belege werden zu deinen bestehenden Daten hinzugefügt.`, confirmLabel: "Importieren", onConfirm: () => importJsonFile(file) });
      e.target.value = "";
    }
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalRoot().innerHTML) closeModal(); });

  qsa(".nav-item, .bnav-item").forEach((btn) => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  qs("#btnAddReceiptSidebar").addEventListener("click", openUploadModal);
  qs("#fabAdd").addEventListener("click", openUploadModal);
  qs("#themeToggle").addEventListener("click", () => {
    const order = ["system", "light", "dark"];
    const cur = getSettings().theme;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    saveSettings({ theme: next }); applyTheme(next);
    if (currentView === "settings") renderSettings();
  });
}

function handleLoadDemo() {
  confirmDialog({
    title: "Demo-Daten laden", text: "Es werden realistische Beispiel-Belege der letzten Monate hinzugefügt. Deine eigenen Belege bleiben davon unberührt.", confirmLabel: "Demo-Daten laden",
    onConfirm: () => { receipts = receipts.concat(generateDemoData()); saveReceipts(); showToast("Demo-Daten geladen", "sparkles"); switchView("overview"); }
  });
}
function handleRemoveDemo() {
  confirmDialog({
    title: "Demo-Daten entfernen", text: "Alle als Demo gekennzeichneten Belege werden entfernt. Deine echten Belege bleiben erhalten.", confirmLabel: "Entfernen", danger: true,
    onConfirm: () => { receipts = receipts.filter((r) => !r.isDemo); saveReceipts(); showToast("Demo-Daten entfernt", "trash"); renderView(currentView); }
  });
}

function init() {
  hydrateIcons();
  loadReceipts();
  const settings = getSettings();
  applyTheme(settings.theme);
  wireGlobalActions();
  switchView("overview");
}

document.addEventListener("DOMContentLoaded", init);
