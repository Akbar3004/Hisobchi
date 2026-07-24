/* ================= HISOB — shaxsiy moliya dasturi (v2) ================= */
"use strict";

/* ================= SVG IKONKALAR ================= */
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  swap: '<path d="M7 9h13l-3.5-3.5M17 15H4l3.5 3.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  coins: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v6.3c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V5.5"/><path d="M5 11.8v6.3c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6.3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14.5 7H21v6.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17" cy="9" r="2.7"/><path d="M16.5 15.3c2.4.4 4.2 1.9 4.9 4.7"/>',
  utensils: '<path d="M6.5 3v5.5a2 2 0 0 0 4 0V3M8.5 3v18M8.5 10.5V21"/><path d="M17.5 3c-1.9 1.3-3 3.7-3 6.5V12h3.5v9M18 3v18"/>',
  chart: '<path d="M4.5 20v-8M10 20V5M15.5 20v-6M21 20H3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7"/>',
  check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.2 12h.01M17.8 12h.01"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1"/><path d="M16.5 13h.01"/>',
  doc: '<path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v5h5M8 13h8M8 17h5"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l2.5-2.5a5 5 0 0 0-7-7L11 6"/><path d="M14 10a5 5 0 0 0-7 0l-2.5 2.5a5 5 0 0 0 7 7L13 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  arrowR: '<path d="M5 12h14m0 0-5-5m5 5-5 5"/>'
};
function ico(name, cls = "") {
  return `<svg class="svgi ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* ================= FOYDALANUVCHILAR VA SESSIYA ================= */
const USERS_KEY = "hisob_users";
const SESSION_KEY = "hisob_session";
const LEGACY_KEY = "hisob_data_v1";

function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

async function hashPass(p) {
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hisob:" + p));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  let h = 5381; for (const c of p) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return "x" + h.toString(16);
}

let currentUser = null;
let S = null;
const dataKey = uid => "hisob_data_u_" + uid;

const DEFAULT_STATE = { debts: [], monthly: [], incomes: [], goals: [], investments: [], collections: [], gatherings: [], updatedAt: 0 };

/* eski (v1) ma'lumotlarni yangi tuzilmaga o'tkazish */
function migrateData(d) {
  d.investments = d.investments || [];
  (d.monthly || []).forEach(m => {
    m.paid = (m.paid || []).map(p => typeof p === "string" ? { ym: p, by: "" } : p);
  });
  (d.incomes || []).forEach(inc => {
    if (inc.expected == null) {
      inc.expected = inc.amount || 0;
      inc.receipts = [{ id: uid(), amount: inc.amount || 0, date: inc.date, note: "" }];
      delete inc.amount;
    }
    inc.receipts = inc.receipts || [];
  });
  (d.collections || []).forEach(c => {
    c.spender = c.spender || "";
    c.people.forEach(p => { p.givenTo = p.givenTo || ""; p.self = p.self || false; });
  });
  return d;
}

function loadUserData(uidv) {
  let raw = localStorage.getItem(dataKey(uidv));
  if (!raw) {
    /* birinchi kirishda eski umumiy ma'lumotlarni shu foydalanuvchiga o'tkazamiz */
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      raw = legacy;
      localStorage.setItem(LEGACY_KEY + "_backup", legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  }
  let d;
  try { d = raw ? JSON.parse(raw) : structuredClone(DEFAULT_STATE); }
  catch { d = structuredClone(DEFAULT_STATE); }
  return migrateData(Object.assign(structuredClone(DEFAULT_STATE), d));
}
/* touch=false — faqat lokalga yozadi (masalan, bulutdan kelgan nusxani saqlashda);
   touch=true — o'zgarish vaqtini yangilab, bulutga ham jo'natadi */
function save(touch = true) {
  if (!currentUser) return;
  if (touch) S.updatedAt = Date.now();
  localStorage.setItem(dataKey(currentUser.id), JSON.stringify(S));
  if (touch) cloudPushSoon();
}

/* ================= BULUT SINXRONLASH (Upstash Redis, /api orqali) =================
   Ma'lumot foydalanuvchi parol xeshi (SHA-256, 64 hex belgi) bo'yicha serverdagi
   `hisobchi:user:<hash>` kalitida saqlanadi. Qurilmalar orasida yangiroq
   (updatedAt kattaroq) nusxa ustunlik qiladi. Server yo'q bo'lsa (masalan,
   faylni to'g'ridan-to'g'ri ochganda) dastur avvalgidek faqat lokal ishlaydi. */
const CLOUD_BASE = "/api/bins";
let cloudPushTimer = null;
let cloudState = "off"; // off | sync | ok | err

function cloudId() {
  const h = currentUser?.pass;
  return h && /^[a-f0-9]{64}$/.test(h) ? h : null;
}

function setCloudState(st, title) {
  cloudState = st;
  const el = document.getElementById("cloudDot");
  if (!el) return;
  el.className = "cloud-dot cloud-" + st;
  el.title = title || {
    off: "Bulut sinxronlash o'chiq",
    sync: "Sinxronlanmoqda...",
    ok: "Bulut bilan sinxron",
    err: "Bulutga ulanib bo'lmadi — ma'lumot faqat shu qurilmada"
  }[st] || "";
}

function cloudPushSoon() {
  if (!cloudId()) return;
  clearTimeout(cloudPushTimer);
  cloudPushTimer = setTimeout(cloudPushNow, 1500);
}

async function cloudPushNow() {
  const id = cloudId();
  if (!id || !S) return;
  clearTimeout(cloudPushTimer); cloudPushTimer = null;
  setCloudState("sync");
  try {
    const res = await fetch(`${CLOUD_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(S)
    });
    if (!res.ok) return setCloudState("err");
    const body = await res.json().catch(() => null);
    // Javob kelguncha foydalanuvchi chiqib ketgan bo'lishi mumkin
    if (currentUser && S && typeof body?.updatedAt === "number") {
      S.updatedAt = body.updatedAt;
      localStorage.setItem(dataKey(currentUser.id), JSON.stringify(S));
    }
    setCloudState("ok");
  } catch {
    setCloudState("err");
  }
}

/* Kirishda: bulutdagi nusxani olib, yangirog'ini tanlaymiz */
async function syncFromCloud() {
  const id = cloudId();
  if (!id) return;
  setCloudState("sync");
  try {
    const res = await fetch(`${CLOUD_BASE}/${id}`, { cache: "no-store" });
    if (res.status === 404) {
      // Birinchi qurilma — hozirgi ma'lumot bilan ro'yxatga olamiz
      const reg = await fetch(CLOUD_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data: S })
      });
      return setCloudState(reg.ok ? "ok" : "err");
    }
    if (!res.ok) return setCloudState("err");
    const cloud = await res.json();
    if ((cloud?.updatedAt || 0) > (S.updatedAt || 0)) {
      S = migrateData(Object.assign(structuredClone(DEFAULT_STATE), cloud));
      save(false);
      renderTab(activeTab);
    } else if ((S.updatedAt || 0) > (cloud?.updatedAt || 0)) {
      return cloudPushNow();
    }
    setCloudState("ok");
  } catch {
    setCloudState("err");
  }
}

/* ================= YORDAMCHI FUNKSIYALAR ================= */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowYM = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; };
const MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const MONTHS_SHORT = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

function fmt(n) {
  if (n == null || isNaN(n)) return "0";
  const r = Math.round(n * 100) / 100;
  return r.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
const money = (n, cls = "") => `<span class="money ${cls}">${fmt(n)}<span class="cur">so'm</span></span>`;
const parseMoney = v => { const n = parseFloat(String(v ?? "").replace(/,/g, "")); return isNaN(n) ? 0 : n; };
const mval = id => parseMoney(document.getElementById(id)?.value);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return `${d.getDate()}-${MONTHS[d.getMonth()].toLowerCase()}, ${d.getFullYear()}`;
}
function fmtYM(ym) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]}, ${y}`;
}
function roundUp1000(x) { return Math.ceil((x - 1e-9) / 1000) * 1000; }

const AV_COLORS = [["#5b8cff","#7c5cff"],["#2fd48a","#0e9f6e"],["#ffc14d","#f97316"],["#3fd4e0","#0891b2"],["#f472b6","#db2777"],["#a78bfa","#7c3aed"]];
function avatarStyle(name) {
  let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = AV_COLORS[h % AV_COLORS.length];
  return `style="--av1:${a};--av2:${b}"`;
}
const initials = name => esc(String(name).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase());

/* ---- summa maydonlarini yozish paytida avtomatik ajratish (1,000,000) ---- */
function formatMoneyInput(el) {
  const raw = el.value;
  const caret = el.selectionStart ?? raw.length;
  const digitsBefore = raw.slice(0, caret).replace(/[^0-9.]/g, "").length;
  let v = raw.replace(/[^0-9.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot >= 0) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  let [int, dec] = v.split(".");
  int = (int || "").replace(/^0+(?=\d)/, "");
  let out = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (dec !== undefined) out += "." + dec.slice(0, 2);
  el.value = out;
  let pos = 0, cnt = 0;
  while (pos < out.length && cnt < digitsBefore) { if (/[0-9.]/.test(out[pos])) cnt++; pos++; }
  try { el.setSelectionRange(pos, pos); } catch {}
}
document.addEventListener("input", e => {
  if (e.target?.classList?.contains("money-inp")) formatMoneyInput(e.target);
});
const moneyInput = (id, ph = "0", extra = "") =>
  `<input id="${id}" class="inp money-inp" type="text" inputmode="decimal" autocomplete="off" placeholder="${ph}" ${extra}>`;

/* ---------- Hisob-kitob yordamchilari ---------- */
const debtPaid = d => d.payments.reduce((s, p) => s + p.amount, 0);
const debtLeft = d => Math.max(0, d.amount - debtPaid(d));

const invProfit = inv => inv.profits.reduce((s, p) => s + p.amount, 0);

/* Maqsad manbalari: qo'lda qo'shilgan + bog'langan investitsiyalar */
function goalSources(g) {
  const manual = g.deposits.reduce((s, p) => s + p.amount, 0);
  const invs = S.investments.filter(i => i.goalId === g.id)
    .map(i => ({ id: i.id, name: i.name, principal: i.amount, profit: invProfit(i) }));
  const invTotal = invs.reduce((s, i) => s + i.principal + i.profit, 0);
  return { manual, invs, invTotal, total: manual + invTotal };
}
const goalSaved = g => goalSources(g).total;

function collectionPerPerson(c) {
  const n = c.people.length || 1;
  const exact = c.total / n;
  return { exact, rounded: roundUp1000(exact) };
}
function collectionCollected(c) {
  const { rounded } = collectionPerPerson(c);
  return c.people.filter(p => p.paid).length * rounded;
}

function settleGathering(g) {
  const n = g.people.length || 1;
  const total = g.people.reduce((s, p) => s + p.spent, 0);
  const share = total / n;
  const balances = g.people.map(p => ({ name: p.name, spent: p.spent, balance: p.spent - share }));
  const creditors = balances.filter(b => b.balance > 0.01).map(b => ({ ...b })).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < -0.01).map(b => ({ ...b, balance: -b.balance })).sort((a, b) => b.balance - a.balance);
  const transfers = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].balance, creditors[j].balance);
    if (amt > 0.01) transfers.push({ from: debtors[i].name, to: creditors[j].name, amount: amt });
    debtors[i].balance -= amt; creditors[j].balance -= amt;
    if (debtors[i].balance < 0.01) i++;
    if (creditors[j].balance < 0.01) j++;
  }
  // roundedShare — "kishi boshiga" ni ko'rsatishda ishlatiladigan yaxlitlangan
  // (1000gacha) qiymat. Hisob-kitob (balances/transfers) esa aniq `share` bo'yicha
  // qoladi — chunki bu yerda kim kimga qancha berishi aniq bo'lishi kerak.
  return { total, share, roundedShare: roundUp1000(share), balances, transfers };
}

/* "kishi boshiga" ni bir xil ko'rinishda chiqaradi: yaxlitlangan + (aslida) */
function perPersonLabel(exact, opts = {}) {
  const rounded = roundUp1000(exact);
  const diff = Math.abs(rounded - exact) > 0.001;
  const aslida = diff ? ` <span class="orig-sum"${opts.inline ? ' style="display:inline"' : ""}>aslida ${fmt(exact)}</span>` : "";
  return `${fmt(rounded)} so'm${aslida}`;
}

/* ---------- Statistika: barcha shaxsiy harakatlar ---------- */
function personalTransactions() {
  const tx = [];
  for (const inc of S.incomes)
    for (const r of inc.receipts)
      tx.push({ date: r.date, type: "kirim", cat: "Daromad", label: inc.name + (r.note ? ` (${r.note})` : ""), amount: r.amount });
  for (const d of S.debts) {
    if (d.dir === "oldim") {
      tx.push({ date: d.date, type: "kirim", cat: "Qarz olindi", label: d.person, amount: d.amount });
      for (const p of d.payments) tx.push({ date: p.date, type: "chiqim", cat: "Qarz qaytarildi", label: d.person, amount: p.amount });
    } else {
      tx.push({ date: d.date, type: "chiqim", cat: "Qarz berildi", label: d.person, amount: d.amount });
      for (const p of d.payments) tx.push({ date: p.date, type: "kirim", cat: "Qarz qaytib keldi", label: d.person, amount: p.amount });
    }
  }
  for (const g of S.goals)
    for (const p of g.deposits) tx.push({ date: p.date, type: "chiqim", cat: "Maqsad jamg'armasi", label: g.name, amount: p.amount });
  for (const inv of S.investments) {
    tx.push({ date: inv.date, type: "chiqim", cat: "Investitsiya qo'yildi", label: inv.name, amount: inv.amount });
    for (const p of inv.profits) tx.push({ date: p.ym + "-01", type: "kirim", cat: "Investitsiya foydasi", label: inv.name, amount: p.amount });
  }
  for (const m of S.monthly)
    for (const e of (m.paid || [])) {
      const day = String(Math.min(m.day, 28)).padStart(2, "0");
      tx.push({ date: `${e.ym}-${day}`, type: "chiqim", cat: "Oylik to'lov", label: m.name + (e.by ? ` (${e.by} to'lagan)` : ""), amount: m.amount });
    }
  return tx.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ================= MODAL TIZIMI ================= */
const modalRoot = document.getElementById("modalRoot");
const modalBox = document.getElementById("modalBox");
function openModal(html) { modalBox.innerHTML = html; modalRoot.classList.remove("hidden"); }
function closeModal() { modalRoot.classList.add("hidden"); modalBox.innerHTML = ""; }
modalRoot.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function confirmDo(text, onYes) {
  openModal(`
    <h3>Tasdiqlash</h3>
    <p style="color:var(--text-2);line-height:1.55">${text}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Bekor qilish</button>
      <button class="btn btn-danger-ghost" id="confirmYes">${ico("trash")} Ha, o'chirilsin</button>
    </div>`);
  document.getElementById("confirmYes").onclick = () => { onYes(); closeModal(); };
}

/* ================= KIRISH / RO'YXATDAN O'TISH ================= */
const authCard = document.getElementById("authCard");

function renderAuth(mode = "login") {
  const users = getUsers();
  if (!users.length) mode = "register";
  if (mode === "login") {
    authCard.innerHTML = `
      <div class="auth-logo">
        <div class="logo-icon">₴</div>
        <div><div class="auth-title">Xush kelibsiz!</div><div class="auth-sub">Hisobingizga kiring</div></div>
      </div>
      <div class="form-row"><label>${ico("user")} Foydalanuvchi</label>
        <select id="a_user" class="inp">
          ${users.map(u => `<option value="${u.id}">${esc(u.first)} ${esc(u.last)}</option>`).join("")}
        </select></div>
      <div class="form-row"><label>${ico("lock")} Parol</label>
        <input id="a_pass" class="inp" type="password" placeholder="Parolingiz" onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div id="authMsg"></div>
      <div class="modal-actions" style="justify-content:stretch">
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="doLogin()">Kirish</button>
      </div>
      <div class="auth-switch">Hisobingiz yo'qmi? <a onclick="renderAuth('register')">Ro'yxatdan o'tish</a></div>`;
    document.getElementById("a_pass").focus();
  } else {
    authCard.innerHTML = `
      <div class="auth-logo">
        <div class="logo-icon">₴</div>
        <div><div class="auth-title">Ro'yxatdan o'tish</div><div class="auth-sub">Ma'lumotlaringiz faqat shu qurilmada saqlanadi</div></div>
      </div>
      <div class="form-2">
        <div class="form-row"><label>Ism</label><input id="a_first" class="inp" placeholder="Akbarbek"></div>
        <div class="form-row"><label>Familiya</label><input id="a_last" class="inp" placeholder="Nazirov"></div>
      </div>
      <div class="form-row"><label>${ico("lock")} Parol</label>
        <input id="a_pass1" class="inp" type="password" placeholder="Kamida 4 ta belgi"></div>
      <div class="form-row"><label>${ico("lock")} Parolni takrorlang</label>
        <input id="a_pass2" class="inp" type="password" placeholder="Qayta yozing" onkeydown="if(event.key==='Enter')doRegister()"></div>
      <div id="authMsg"></div>
      <div class="modal-actions" style="justify-content:stretch">
        <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="doRegister()">Ro'yxatdan o'tish</button>
      </div>
      ${users.length ? `<div class="auth-switch">Hisobingiz bormi? <a onclick="renderAuth('login')">Kirish</a></div>` : ""}`;
    document.getElementById("a_first").focus();
  }
}
function authMsg(html) { document.getElementById("authMsg").innerHTML = html; }

async function doRegister() {
  const first = document.getElementById("a_first").value.trim();
  const last = document.getElementById("a_last").value.trim();
  const p1 = document.getElementById("a_pass1").value;
  const p2 = document.getElementById("a_pass2").value;
  if (!first || !last) return authMsg(`<div class="warn-text">Ism va familiyani kiriting</div>`);
  if (p1.length < 4) return authMsg(`<div class="warn-text">Parol kamida 4 ta belgidan iborat bo'lsin</div>`);
  if (p1 !== p2) return authMsg(`<div class="warn-text">Parollar bir xil emas — qayta tekshiring</div>`);
  const users = getUsers();
  if (users.some(u => u.first.toLowerCase() === first.toLowerCase() && u.last.toLowerCase() === last.toLowerCase()))
    return authMsg(`<div class="warn-text">Bu ism-familiya bilan hisob allaqachon mavjud — "Kirish" orqali kiring</div>`);
  const hash = await hashPass(p1);
  if (users.some(u => u.pass === hash))
    return authMsg(`<div class="warn-text">⚠ Diqqat: bu parol boshqa foydalanuvchi tomonidan ishlatilgan!<br>Xavfsizlik uchun boshqa parol tanlang.</div>`);
  const user = { id: uid(), first, last, pass: hash };
  users.push(user); saveUsers(users);
  localStorage.setItem(SESSION_KEY, user.id);
  enterApp(user);
}
async function doLogin() {
  const uidv = document.getElementById("a_user").value;
  const pass = document.getElementById("a_pass").value;
  const user = getUsers().find(u => u.id === uidv);
  if (!user) return authMsg(`<div class="warn-text">Foydalanuvchi topilmadi</div>`);
  const hash = await hashPass(pass);
  if (hash !== user.pass) return authMsg(`<div class="warn-text">Parol noto'g'ri — qayta urinib ko'ring</div>`);
  localStorage.setItem(SESSION_KEY, user.id);
  enterApp(user);
}
function enterApp(user) {
  currentUser = user;
  S = loadUserData(user.id);
  save(false);
  document.body.classList.remove("locked");
  renderUserBox();
  switchTab("dashboard");
  // Avval bulut bilan sinxronlaymiz, so'ng ulangan InvestHub investitsiyalarini yangilaymiz
  syncFromCloud().finally(refreshLinkedInvestments);
}
function doLogout() {
  // Jo'natilmagan o'zgarishlar bo'lsa, chiqishdan oldin bulutga yuboramiz
  if (cloudPushTimer) cloudPushNow();
  localStorage.removeItem(SESSION_KEY);
  currentUser = null; S = null;
  document.body.classList.add("locked");
  renderAuth("login");
}
function renderUserBox() {
  document.getElementById("userBox").innerHTML = currentUser ? `
    <div class="avatar" ${avatarStyle(currentUser.first + currentUser.last)}>${initials(currentUser.first + " " + currentUser.last)}</div>
    <div class="u-name">${esc(currentUser.first)} ${esc(currentUser.last)}</div>
    <span id="cloudDot" class="cloud-dot cloud-off"></span>
    <button class="u-out" onclick="doLogout()" title="Chiqish">${ico("logout")}</button>` : "";
  if (currentUser) setCloudState(cloudState);
}

/* ================= NAVIGATSIYA ================= */
const tabs = document.querySelectorAll(".tab");
const navBtns = document.querySelectorAll(".nav-btn");
let activeTab = "dashboard";
navBtns.forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
function switchTab(name) {
  activeTab = name;
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  tabs.forEach(t => t.classList.toggle("active", t.id === "tab-" + name));
  document.querySelector(".sidebar").classList.remove("open");
  renderTab(name);
}
document.getElementById("menuToggle").addEventListener("click", () =>
  document.querySelector(".sidebar").classList.toggle("open"));

function renderAll() { save(); renderTab(activeTab); }
function renderTab(name) {
  if (!S) return;
  ({ dashboard: renderDashboard, debts: renderDebts, monthly: renderMonthly, income: renderIncome,
     goals: renderGoals, invest: renderInvest, collections: renderCollections,
     gatherings: renderGatherings, stats: renderStats }[name])();
}

/* ================= PDF (chop etish orqali) ================= */
function sectionPDF(title, bodyHTML) {
  document.getElementById("printReport").innerHTML = `
    <h1>${title}</h1>
    <div class="rep-sub">Tayyorlandi: ${fmtDate(todayISO())} · ${currentUser ? esc(currentUser.first) + " " + esc(currentUser.last) : ""} · «Hisobchi» dasturi</div>
    ${bodyHTML}
    <div class="rep-note">Ushbu hisobot «Hisobchi» shaxsiy moliya dasturida avtomatik shakllantirildi. Chop etish oynasida "PDF sifatida saqlash"ni tanlang.</div>`;
  window.print();
}
const pdfBtn = fn => `<button class="btn btn-ghost" onclick="${fn}()">${ico("download")} PDF</button>`;

/* ================= 1. JAMLANMA ================= */
function renderDashboard() {
  const el = document.getElementById("tab-dashboard");
  const myDebt = S.debts.filter(d => d.dir === "oldim").reduce((s, d) => s + debtLeft(d), 0);
  const toMe = S.debts.filter(d => d.dir === "berdim").reduce((s, d) => s + debtLeft(d), 0);
  const monthlyTotal = S.monthly.reduce((s, m) => s + m.amount, 0);
  const goalsSaved = S.goals.reduce((s, g) => s + goalSaved(g), 0);
  const invTotal = S.investments.reduce((s, i) => s + i.amount, 0);
  const invProfitTotal = S.investments.reduce((s, i) => s + invProfit(i), 0);

  const now = new Date();
  const ym = nowYM();
  const upcoming = [...S.monthly].sort((a, b) => a.day - b.day);
  const lastIncome = [...S.incomes].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const activeCollections = S.collections.filter(c => c.people.some(p => !p.paid));
  const lastGatherings = [...S.gatherings].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 2);

  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Jamlanma</div>
      <div class="page-sub">Bugun: ${fmtDate(todayISO())} — barcha moliyaviy holat bir qarashda</div>
    </div>
  </div>

  <div class="grid grid-4">
    <div class="card stat-tile lift" style="--tile-glow:rgba(255,107,107,.3)">
      <div class="stat-label">${ico("swap")} Mening qarzim</div>
      <div class="stat-value ${myDebt ? "neg" : ""}">${money(myDebt)}</div>
      <div class="stat-note">${S.debts.filter(d => d.dir === "oldim" && debtLeft(d) > 0).length} ta faol qarz</div>
    </div>
    <div class="card stat-tile lift" style="--tile-glow:rgba(47,212,138,.3)">
      <div class="stat-label">${ico("wallet")} Menga qarzdorlar</div>
      <div class="stat-value ${toMe ? "pos" : ""}">${money(toMe)}</div>
      <div class="stat-note">${S.debts.filter(d => d.dir === "berdim" && debtLeft(d) > 0).length} ta kutilmoqda</div>
    </div>
    <div class="card stat-tile lift" style="--tile-glow:rgba(255,193,77,.3)">
      <div class="stat-label">${ico("calendar")} Oylik to'lovlar</div>
      <div class="stat-value">${money(monthlyTotal)}</div>
      <div class="stat-note">har oy, ${S.monthly.length} ta to'lov</div>
    </div>
    <div class="card stat-tile lift" style="--tile-glow:rgba(91,140,255,.35)">
      <div class="stat-label">${ico("trend")} Investitsiya</div>
      <div class="stat-value">${money(invTotal)}</div>
      <div class="stat-note">foyda: ${fmt(invProfitTotal)} so'm · maqsadlarda: ${fmt(goalsSaved)} so'm</div>
    </div>
  </div>

  <div class="section-title"><span class="dot"></span> Shaxsiy moliyam</div>
  <div class="grid grid-2">
    <div class="card">
      <div class="stat-label">Shu oy to'lovlari — ${MONTHS[now.getMonth()]}</div>
      ${upcoming.length ? upcoming.map(m => {
        const entry = (m.paid || []).find(e => e.ym === ym);
        const overdue = !entry && m.day < now.getDate();
        return `<div class="month-row">
          <div class="day-badge ${entry ? "" : overdue ? "overdue" : m.day <= now.getDate() + 3 ? "due" : ""}">
            <span class="d">${m.day}</span><span class="m">sana</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600">${esc(m.name)}</div>
            <div style="font-size:.78rem;color:var(--text-3)">${entry ? (entry.by ? `✓ to'landi <span class="paid-by">(${esc(entry.by)} to'lagan)</span>` : "✓ to'landi") : overdue ? "muddati o'tdi!" : "kutilmoqda"}</div>
          </div>
          <div style="font-weight:700">${money(m.amount)}</div>
          <button class="check ${entry ? "on" : ""}" onclick="toggleMonthPaid('${m.id}')" title="To'landi deb belgilash">✓</button>
        </div>`;
      }).join("") : `<div class="empty" style="padding:26px"><div>Oylik to'lovlar hali kiritilmagan</div></div>`}
    </div>

    <div style="display:flex;flex-direction:column;gap:18px">
      <div class="card">
        <div class="stat-label">${ico("coins")} Oxirgi daromad</div>
        ${lastIncome ? (() => {
          const received = lastIncome.receipts.reduce((s, r) => s + r.amount, 0);
          const used = lastIncome.allocs.reduce((s, a) => s + a.amount, 0);
          const left = received - used;
          return `<div style="margin-top:10px;font-weight:700;font-size:1.1rem">${esc(lastIncome.name)}</div>
            <div style="font-size:.8rem;color:var(--text-3);margin-top:3px">Kutilgan: ${fmt(lastIncome.expected)} · Keldi: ${fmt(received)}</div>
            <div class="progress"><div class="progress-fill" style="width:${Math.min(100, received / (lastIncome.expected || 1) * 100)}%"></div></div>
            <div style="display:flex;justify-content:space-between;margin-top:9px;font-size:.85rem">
              <span style="color:var(--text-2)">Taqsimlandi: ${fmt(used)}</span>
              <span class="${left >= 0 ? "pos" : "neg"}" style="font-weight:700">Real qoldiq: ${fmt(left)}</span>
            </div>`;
        })() : `<div class="empty" style="padding:22px;margin-top:10px">Hali daromad kiritilmagan</div>`}
      </div>
      <div class="card">
        <div class="stat-label">${ico("target")} Maqsadlar jarayoni</div>
        ${S.goals.length ? S.goals.slice(0, 3).map(g => {
          const sv = goalSaved(g), pct = Math.min(100, sv / g.target * 100);
          return `<div style="margin-top:13px">
            <div style="display:flex;justify-content:space-between;font-size:.87rem">
              <span style="font-weight:600">${esc(g.name)}</span>
              <span style="color:var(--text-2)">${pct.toFixed(0)}%</span>
            </div>
            <div class="progress"><div class="progress-fill green" style="width:${pct}%"></div></div>
          </div>`;
        }).join("") : `<div class="empty" style="padding:22px;margin-top:10px">Maqsadlar hali yo'q</div>`}
      </div>
    </div>
  </div>

  <div class="section-title"><span class="dot" style="background:linear-gradient(135deg,#2fd48a,#0e9f6e)"></span> Jamoaviy hisoblar</div>
  <div class="grid grid-2">
    <div class="card">
      <div class="stat-label">${ico("users")} Faol pul yig'ishlar</div>
      ${activeCollections.length ? activeCollections.slice(0, 3).map(c => {
        const col = collectionCollected(c);
        const pct = Math.min(100, col / c.total * 100);
        return `<div style="margin-top:13px">
          <div style="display:flex;justify-content:space-between;font-size:.87rem">
            <span style="font-weight:600">${esc(c.title)}</span>
            <span style="color:var(--text-2)">${fmt(col)} / ${fmt(c.total)}</span>
          </div>
          <div class="progress"><div class="progress-fill yellow" style="width:${pct}%"></div></div>
        </div>`;
      }).join("") : `<div class="empty" style="padding:22px;margin-top:10px">Faol yig'ishlar yo'q</div>`}
    </div>
    <div class="card">
      <div class="stat-label">${ico("utensils")} Oxirgi o'tirishlar</div>
      ${lastGatherings.length ? lastGatherings.map(g => {
        const st = settleGathering(g);
        return `<div style="margin-top:13px;padding-bottom:11px;border-bottom:1px solid var(--border-soft)">
          <div style="display:flex;justify-content:space-between;font-size:.87rem">
            <span style="font-weight:600">${esc(g.title)}</span>
            <span style="font-weight:700">${money(st.total)}</span>
          </div>
          <div style="font-size:.76rem;color:var(--text-3);margin-top:3px">${g.people.length} kishi · kishi boshiga ${perPersonLabel(st.share, { inline: true })}</div>
        </div>`;
      }).join("") : `<div class="empty" style="padding:22px;margin-top:10px">O'tirishlar hali yo'q</div>`}
    </div>
  </div>`;
}

/* ================= 2. QARZLAR ================= */
function renderDebts() {
  const el = document.getElementById("tab-debts");
  const mine = S.debts.filter(d => d.dir === "oldim");
  const given = S.debts.filter(d => d.dir === "berdim");

  const debtCard = d => {
    const paid = debtPaid(d), left = debtLeft(d);
    const pct = Math.min(100, paid / d.amount * 100);
    const done = left <= 0;
    return `<div class="card lift">
      <div class="debt-head">
        <div style="display:flex;gap:13px;align-items:center;min-width:0">
          <div class="avatar" ${avatarStyle(d.person)}>${initials(d.person)}</div>
          <div style="min-width:0">
            <div class="debt-person">${esc(d.person)}</div>
            <div class="debt-meta">${fmtDate(d.date)}${d.note ? " · " + esc(d.note) : ""}</div>
          </div>
        </div>
        ${done ? `<span class="chip chip-green">${ico("check")} Yopildi</span>`
               : `<span class="chip ${d.dir === "oldim" ? "chip-red" : "chip-blue"}">${d.dir === "oldim" ? "Qarzdorman" : "Qarz berdim"}</span>`}
      </div>
      <div class="debt-nums">
        <div class="debt-num"><div class="l">Jami</div><div class="v">${money(d.amount)}</div></div>
        <div class="debt-num"><div class="l">Qaytarildi</div><div class="v pos">${money(paid)}</div></div>
        <div class="debt-num"><div class="l">Qoldi</div><div class="v ${left > 0 ? "neg" : "pos"}">${money(left)}</div></div>
      </div>
      <div class="progress"><div class="progress-fill ${done ? "green" : ""}" style="width:${pct}%"></div></div>
      <div class="card-actions">
        ${!done ? `<button class="btn btn-sm btn-green" onclick="openPayDebt('${d.id}')">${ico("plus")} To'lov kiritish</button>` : ""}
        ${d.payments.length ? `<button class="btn btn-sm btn-ghost" onclick="this.closest('.card').querySelector('.pay-history').classList.toggle('open')">${ico("clock")} Tarix (${d.payments.length})</button>` : ""}
        <button class="btn btn-sm btn-danger-ghost" onclick="delDebt('${d.id}')">${ico("trash")} O'chirish</button>
      </div>
      <div class="pay-history">
        ${d.payments.map(p => `<div class="pay-item"><span>${fmtDate(p.date)}</span><span style="font-weight:600">${money(p.amount)}</span></div>`).join("")}
      </div>
    </div>`;
  };

  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Qarzlar</div>
      <div class="page-sub">Kimdan qancha oldingiz, kimga berdingiz — hammasi nazoratda</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfDebts")}
      <button class="btn btn-primary" onclick="openAddDebt()">${ico("plus")} Yangi qarz</button>
    </div>
  </div>
  <div class="section-title"><span class="dot" style="background:var(--red)"></span> Men qarzdorman
    <span class="chip chip-red">${fmt(mine.reduce((s, d) => s + debtLeft(d), 0))} so'm</span></div>
  ${mine.length ? `<div class="grid grid-2">${mine.map(debtCard).join("")}</div>`
    : `<div class="empty"><div class="empty-ico">${ico("check")}</div>Sizda hozircha qarz yo'q — barakalla!</div>`}
  <div class="section-title"><span class="dot" style="background:var(--green)"></span> Menga qarzdorlar
    <span class="chip chip-green">${fmt(given.reduce((s, d) => s + debtLeft(d), 0))} so'm</span></div>
  ${given.length ? `<div class="grid grid-2">${given.map(debtCard).join("")}</div>`
    : `<div class="empty"><div class="empty-ico">${ico("wallet")}</div>Hech kim sizdan qarz olmagan</div>`}`;
}
function pdfDebts() {
  const tbl = list => `<table>
    <tr><th>Kim</th><th>Sana</th><th>Izoh</th><th class="num">Jami</th><th class="num">Qaytarildi</th><th class="num">Qoldi</th></tr>
    ${list.map(d => `<tr><td>${esc(d.person)}</td><td>${d.date}</td><td>${esc(d.note || "-")}</td>
      <td class="num">${fmt(d.amount)}</td><td class="num">${fmt(debtPaid(d))}</td><td class="num">${fmt(debtLeft(d))}</td></tr>`).join("")
      || `<tr><td colspan="6">Yozuvlar yo'q</td></tr>`}
  </table>`;
  const mine = S.debts.filter(d => d.dir === "oldim");
  const given = S.debts.filter(d => d.dir === "berdim");
  sectionPDF("Qarzlar hisoboti", `
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Mening qarzim (qolgan)</div><div class="v">${fmt(mine.reduce((s, d) => s + debtLeft(d), 0))} so'm</div></div>
      <div class="rep-tile"><div class="l">Menga qarzdorlar (qolgan)</div><div class="v">${fmt(given.reduce((s, d) => s + debtLeft(d), 0))} so'm</div></div>
    </div>
    <h2>Men qarzdorman (${mine.length} ta)</h2>${tbl(mine)}
    <h2>Menga qarzdorlar (${given.length} ta)</h2>${tbl(given)}`);
}
function openAddDebt() {
  openModal(`
  <h3>Yangi qarz</h3>
  <div class="form-row"><label>Qarz turi</label>
    <select id="f_dir" class="inp">
      <option value="oldim">Men qarz oldim (qarzdorman)</option>
      <option value="berdim">Men qarz berdim (menga qaytaradi)</option>
    </select></div>
  <div class="form-row"><label>Kimdan / kimga (ism)</label><input id="f_person" class="inp" placeholder="Masalan: Alisher aka"></div>
  <div class="form-2">
    <div class="form-row"><label>Summa (so'm)</label>${moneyInput("f_amount", "1,000,000")}</div>
    <div class="form-row"><label>Sana</label><input id="f_date" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Izoh (ixtiyoriy)</label><input id="f_note" class="inp" placeholder="Nima uchun..."></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveDebt()">Saqlash</button>
  </div>`);
  document.getElementById("f_person").focus();
}
function saveDebt() {
  const person = document.getElementById("f_person").value.trim();
  const amount = mval("f_amount");
  if (!person || !(amount > 0)) return alert("Ism va summani to'g'ri kiriting");
  S.debts.push({
    id: uid(), dir: document.getElementById("f_dir").value, person, amount,
    date: document.getElementById("f_date").value || todayISO(),
    note: document.getElementById("f_note").value.trim(), payments: []
  });
  closeModal(); renderAll();
}
function openPayDebt(id) {
  const d = S.debts.find(x => x.id === id); if (!d) return;
  openModal(`
  <h3>To'lov kiritish — ${esc(d.person)}</h3>
  <p style="color:var(--text-2);font-size:.9rem;margin-bottom:16px">Qolgan qarz: <b>${money(debtLeft(d))}</b></p>
  <div class="form-2">
    <div class="form-row"><label>To'lov summasi</label>${moneyInput("f_pay", "500,000")}</div>
    <div class="form-row"><label>Sana</label><input id="f_paydate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="savePayDebt('${id}')">Saqlash</button>
  </div>`);
  document.getElementById("f_pay").focus();
}
function savePayDebt(id) {
  const d = S.debts.find(x => x.id === id); if (!d) return;
  const amount = mval("f_pay");
  if (!(amount > 0)) return alert("Summani kiriting");
  d.payments.push({ id: uid(), amount, date: document.getElementById("f_paydate").value || todayISO() });
  closeModal(); renderAll();
}
function delDebt(id) {
  const d = S.debts.find(x => x.id === id); if (!d) return;
  confirmDo(`<b>${esc(d.person)}</b> bilan bog'liq qarz yozuvi o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`, () => {
    S.debts = S.debts.filter(x => x.id !== id); renderAll();
  });
}

/* ================= 3. OYLIK TO'LOVLAR ================= */
function renderMonthly() {
  const el = document.getElementById("tab-monthly");
  const now = new Date();
  const ym = nowYM();
  const total = S.monthly.reduce((s, m) => s + m.amount, 0);
  const paidThis = S.monthly.filter(m => (m.paid || []).some(e => e.ym === ym)).reduce((s, m) => s + m.amount, 0);
  const sorted = [...S.monthly].sort((a, b) => a.day - b.day);

  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Oylik to'lovlar</div>
      <div class="page-sub">Har oy qaysi sanada nimaga to'lash kerak</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfMonthly")}
      <button class="btn btn-primary" onclick="openAddMonthly()">${ico("plus")} Yangi to'lov</button>
    </div>
  </div>
  <div class="grid grid-3" style="margin-bottom:24px">
    <div class="card stat-tile"><div class="stat-label">Oylik majburiyat</div><div class="stat-value">${money(total)}</div></div>
    <div class="card stat-tile" style="--tile-glow:rgba(47,212,138,.3)"><div class="stat-label">Shu oy to'landi</div><div class="stat-value pos">${money(paidThis)}</div></div>
    <div class="card stat-tile" style="--tile-glow:rgba(255,193,77,.3)"><div class="stat-label">Shu oy qoldi</div><div class="stat-value ${total - paidThis > 0 ? "neg" : "pos"}">${money(total - paidThis)}</div></div>
  </div>
  <div class="card">
    ${sorted.length ? sorted.map(m => {
      const entry = (m.paid || []).find(e => e.ym === ym);
      const overdue = !entry && m.day < now.getDate();
      return `<div class="month-row">
        <div class="day-badge ${entry ? "" : overdue ? "overdue" : ""}"><span class="d">${m.day}</span><span class="m">-sana</span></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600">${esc(m.name)}</div>
          <div style="font-size:.78rem;color:${overdue ? "var(--red)" : "var(--text-3)"}">
            har oyning ${m.day}-sanasi
            ${entry ? (entry.by ? ` · ✓ to'landi <span class="paid-by">(${esc(entry.by)} to'lagan)</span>` : " · ✓ bu oy to'langan") : overdue ? " · muddati o'tdi!" : ""}
          </div>
        </div>
        <div style="font-weight:700">${money(m.amount)}</div>
        <button class="check ${entry ? "on" : ""}" onclick="toggleMonthPaid('${m.id}')" title="Bu oy to'landi">✓</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="delMonthly('${m.id}')">✕</button>
      </div>`;
    }).join("") : `<div class="empty"><div class="empty-ico">${ico("calendar")}</div>Oylik to'lovlar hali kiritilmagan.<br>Masalan: internet, kredit, ijara haqi...</div>`}
  </div>`;
}
function pdfMonthly() {
  const ym = nowYM();
  sectionPDF(`Oylik to'lovlar — ${fmtYM(ym)}`, `
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Oylik majburiyat</div><div class="v">${fmt(S.monthly.reduce((s, m) => s + m.amount, 0))} so'm</div></div>
    </div>
    <table>
      <tr><th>To'lov</th><th>Sana</th><th class="num">Summa</th><th>Shu oy holati</th></tr>
      ${[...S.monthly].sort((a, b) => a.day - b.day).map(m => {
        const e = (m.paid || []).find(x => x.ym === ym);
        return `<tr><td>${esc(m.name)}</td><td>har oyning ${m.day}-sanasi</td><td class="num">${fmt(m.amount)}</td>
          <td>${e ? (e.by ? `To'landi (${esc(e.by)} to'lagan)` : "To'landi") : "To'lanmagan"}</td></tr>`;
      }).join("") || `<tr><td colspan="4">Yozuvlar yo'q</td></tr>`}
    </table>
    <h2>To'lovlar tarixi</h2>
    <table>
      <tr><th>Oy</th><th>To'lov</th><th class="num">Summa</th><th>Kim to'lagan</th></tr>
      ${S.monthly.flatMap(m => (m.paid || []).map(e => ({ m, e }))).sort((a, b) => (a.e.ym < b.e.ym ? 1 : -1))
        .map(({ m, e }) => `<tr><td>${fmtYM(e.ym)}</td><td>${esc(m.name)}</td><td class="num">${fmt(m.amount)}</td><td>${e.by ? esc(e.by) : "O'zim"}</td></tr>`).join("")
        || `<tr><td colspan="4">Tarix bo'sh</td></tr>`}
    </table>`);
}
function openAddMonthly() {
  openModal(`
  <h3>Yangi oylik to'lov</h3>
  <div class="form-row"><label>Nomi</label><input id="f_mname" class="inp" placeholder="Masalan: Internet, Kredit, Ijara..."></div>
  <div class="form-2">
    <div class="form-row"><label>Summa (so'm)</label>${moneyInput("f_mamount", "200,000")}</div>
    <div class="form-row"><label>Oyning qaysi sanasi</label><input id="f_mday" class="inp" type="number" min="1" max="31" placeholder="15"></div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveMonthly()">Saqlash</button>
  </div>`);
  document.getElementById("f_mname").focus();
}
function saveMonthly() {
  const name = document.getElementById("f_mname").value.trim();
  const amount = mval("f_mamount");
  const day = parseInt(document.getElementById("f_mday").value);
  if (!name || !(amount > 0) || !(day >= 1 && day <= 31)) return alert("Barcha maydonlarni to'g'ri to'ldiring");
  S.monthly.push({ id: uid(), name, amount, day, paid: [] });
  closeModal(); renderAll();
}
function toggleMonthPaid(id) {
  const m = S.monthly.find(x => x.id === id); if (!m) return;
  const ym = nowYM();
  m.paid = m.paid || [];
  const i = m.paid.findIndex(e => e.ym === ym);
  if (i >= 0) { m.paid.splice(i, 1); renderAll(); return; }
  /* kim to'laganini so'raymiz */
  openModal(`
  <h3>${esc(m.name)} — kim to'ladi?</h3>
  <p style="color:var(--text-2);font-size:.88rem;margin-bottom:14px">Agar sizning o'rningizga boshqa inson to'lagan bo'lsa, ismini yozing.</p>
  <div class="form-row"><label>To'lagan inson</label>
    <input id="f_paidby" class="inp" placeholder="O'zim" value=""></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-green" onclick="saveMonthPaid('${id}','self')">${ico("check")} O'zim to'ladim</button>
    <button class="btn btn-primary" onclick="saveMonthPaid('${id}','other')">Saqlash</button>
  </div>`);
  document.getElementById("f_paidby").focus();
}
function saveMonthPaid(id, mode) {
  const m = S.monthly.find(x => x.id === id); if (!m) return;
  let by = "";
  if (mode === "other") {
    by = document.getElementById("f_paidby").value.trim();
    if (by.toLowerCase() === "o'zim" || by.toLowerCase() === "ozim") by = "";
  }
  m.paid.push({ ym: nowYM(), by });
  closeModal(); renderAll();
}
function delMonthly(id) {
  const m = S.monthly.find(x => x.id === id); if (!m) return;
  confirmDo(`<b>${esc(m.name)}</b> oylik to'lovi ro'yxatdan o'chirilsinmi?`, () => {
    S.monthly = S.monthly.filter(x => x.id !== id); renderAll();
  });
}

/* ================= 4. DAROMAD TAQSIMOTI ================= */
const incReceived = inc => inc.receipts.reduce((s, r) => s + r.amount, 0);
const incAllocated = inc => inc.allocs.reduce((s, a) => s + a.amount, 0);

function renderIncome() {
  const el = document.getElementById("tab-income");
  const list = [...S.incomes].sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Daromad taqsimoti</div>
      <div class="page-sub">Qog'ozdagi kutilayotgan summa bo'yicha reja tuzing — pul qismlarga bo'lib kelsa ham holat aniq</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfIncome")}
      <button class="btn btn-primary" onclick="openAddIncome()">${ico("plus")} Daromad kiritish</button>
    </div>
  </div>
  ${list.length ? `<div class="grid grid-2">${list.map(inc => {
    const received = incReceived(inc);
    const used = incAllocated(inc);
    const planLeft = inc.expected - used;
    const realLeft = received - used;
    const toCome = Math.max(0, inc.expected - received);
    return `<div class="card lift">
      <div class="debt-head">
        <div>
          <div class="debt-person">${esc(inc.name)}</div>
          <div class="debt-meta">${fmtDate(inc.date)}</div>
        </div>
        <span class="chip ${toCome > 0 ? "chip-yellow" : "chip-green"}">${toCome > 0 ? `Kelishi qoldi: ${fmt(toCome)}` : "✓ To'liq keldi"}</span>
      </div>
      <div class="debt-nums">
        <div class="debt-num"><div class="l">Kutilgan (qog'oz)</div><div class="v">${money(inc.expected)}</div></div>
        <div class="debt-num"><div class="l">Keldi</div><div class="v pos">${money(received)}</div></div>
      </div>
      <div class="progress"><div class="progress-fill green" style="width:${Math.min(100, received / (inc.expected || 1) * 100)}%"></div></div>
      <div style="margin-top:12px">
        ${inc.receipts.map(r => `<div class="pay-item">
          <span>${fmtDate(r.date)}${r.note ? ` — ${esc(r.note)}` : ""}</span>
          <span style="display:flex;gap:9px;align-items:center"><b>+${fmt(r.amount)}</b>
          <button class="dyn-del" style="width:24px;height:24px;font-size:.7rem" onclick="delReceipt('${inc.id}','${r.id}')">✕</button></span>
        </div>`).join("")}
      </div>
      <table class="tbl" style="margin-top:10px">
        ${inc.allocs.map(a => `<tr><td>${esc(a.name)}</td><td class="num" style="font-weight:600">${fmt(a.amount)}</td></tr>`).join("")}
        <tr><td style="color:var(--text-3)">Jami taqsimlandi (reja)</td><td class="num" style="font-weight:700">${fmt(used)}</td></tr>
        <tr><td style="color:var(--text-3)">Reja qoldig'i (kutilgan − reja)</td><td class="num" style="font-weight:700;color:${planLeft >= 0 ? "var(--green)" : "var(--red)"}">${fmt(planLeft)}</td></tr>
        <tr><td style="font-weight:700;color:${realLeft >= 0 ? "var(--green)" : "var(--red)"}">Hozirgi real qoldiq (kelgan − reja)</td>
            <td class="num" style="font-weight:800;color:${realLeft >= 0 ? "var(--green)" : "var(--red)"}">${fmt(realLeft)}</td></tr>
      </table>
      <div class="card-actions">
        <button class="btn btn-sm btn-green" onclick="openAddReceipt('${inc.id}')">${ico("plus")} Qism keldi</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="delIncome('${inc.id}')">${ico("trash")} O'chirish</button>
      </div>
    </div>`;
  }).join("")}</div>` : `<div class="empty"><div class="empty-ico">${ico("coins")}</div>Hali daromad kiritilmagan.<br>Qog'ozdagi kutilayotgan summani kiriting va rejani tuzing — pul kelgan sari "Qism keldi" deb qo'shib borasiz.</div>`}`;
}
function pdfIncome() {
  sectionPDF("Daromad taqsimoti hisoboti", S.incomes.map(inc => {
    const received = incReceived(inc), used = incAllocated(inc);
    return `<h2>${esc(inc.name)} — ${fmtDate(inc.date)}</h2>
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Kutilgan</div><div class="v">${fmt(inc.expected)} so'm</div></div>
      <div class="rep-tile"><div class="l">Keldi</div><div class="v">${fmt(received)} so'm</div></div>
      <div class="rep-tile"><div class="l">Taqsimlandi</div><div class="v">${fmt(used)} so'm</div></div>
      <div class="rep-tile"><div class="l">Real qoldiq</div><div class="v">${fmt(received - used)} so'm</div></div>
    </div>
    <table>
      <tr><th>Kelgan qismlar</th><th class="num">Summa</th></tr>
      ${inc.receipts.map(r => `<tr><td>${r.date}${r.note ? " — " + esc(r.note) : ""}</td><td class="num">${fmt(r.amount)}</td></tr>`).join("") || `<tr><td colspan="2">Hali kelmagan</td></tr>`}
    </table>
    <table style="margin-top:8px">
      <tr><th>Taqsimot (reja)</th><th class="num">Summa</th></tr>
      ${inc.allocs.map(a => `<tr><td>${esc(a.name)}</td><td class="num">${fmt(a.amount)}</td></tr>`).join("") || `<tr><td colspan="2">Reja yo'q</td></tr>`}
    </table>`;
  }).join("") || "<p>Daromadlar yo'q</p>");
}
function openAddIncome() {
  openModal(`
  <h3>Daromad kiritish va taqsimlash</h3>
  <div class="form-2">
    <div class="form-row"><label>Nomi</label><input id="f_iname" class="inp" placeholder="Iyul oyligi"></div>
    <div class="form-row"><label>Sana</label><input id="f_idate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Kutilayotgan summa — qog'ozdagi (so'm)</label>
    ${moneyInput("f_iexp", "5,000,000", 'oninput="incomeLive()"')}
    <div class="hint">Oylik hali kelmagan bo'lsa ham, ma'lumot qog'ozidagi summani yozing — reja shunga qarab tuziladi</div></div>
  <div class="form-row"><label>Agar pulning bir qismi allaqachon kelgan bo'lsa (ixtiyoriy)</label>
    ${moneyInput("f_ifirst", "0", 'oninput="incomeLive()"')}</div>
  <div class="form-row"><label>Taqsimot rejasi (qayerga qancha)</label>
    <div id="allocRows"></div>
    <button class="btn btn-sm btn-ghost" onclick="addAllocRow()">${ico("plus")} Qator qo'shish</button>
  </div>
  <div class="live-calc" id="incomeCalc">Summani kiriting...</div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveIncome()">Saqlash</button>
  </div>`);
  addAllocRow(); addAllocRow();
  document.getElementById("f_iname").focus();
}
function addAllocRow() {
  const div = document.createElement("div");
  div.className = "dyn-row";
  div.innerHTML = `
    <input class="inp alloc-name" placeholder="Masalan: Oziq-ovqat">
    <input class="inp alloc-amount money-inp" type="text" inputmode="decimal" placeholder="Summa" style="max-width:150px" oninput="incomeLive()">
    <button class="dyn-del" onclick="this.parentElement.remove();incomeLive()">✕</button>`;
  document.getElementById("allocRows").appendChild(div);
}
function incomeLive() {
  const expected = mval("f_iexp");
  let used = 0;
  document.querySelectorAll(".alloc-amount").forEach(i => used += parseMoney(i.value));
  const left = expected - used;
  document.getElementById("incomeCalc").innerHTML =
    `Reja bo'yicha taqsimlandi: <b>${fmt(used)} so'm</b> &nbsp;·&nbsp; Qoladi: <b style="color:${left >= 0 ? "var(--green)" : "var(--red)"}">${fmt(left)} so'm</b>` +
    (left < 0 ? `<br><span style="color:var(--red);font-size:.8rem">Diqqat: reja kutilayotgan summadan oshib ketdi!</span>` : "");
}
function saveIncome() {
  const name = document.getElementById("f_iname").value.trim();
  const expected = mval("f_iexp");
  if (!name || !(expected > 0)) return alert("Nomi va kutilayotgan summani kiriting");
  const date = document.getElementById("f_idate").value || todayISO();
  const allocs = [];
  document.querySelectorAll("#allocRows .dyn-row").forEach(r => {
    const n = r.querySelector(".alloc-name").value.trim();
    const a = parseMoney(r.querySelector(".alloc-amount").value);
    if (n && a > 0) allocs.push({ name: n, amount: a });
  });
  const receipts = [];
  const first = mval("f_ifirst");
  if (first > 0) receipts.push({ id: uid(), amount: first, date, note: "1-qism" });
  S.incomes.push({ id: uid(), name, expected, date, receipts, allocs });
  closeModal(); renderAll();
}
function openAddReceipt(id) {
  const inc = S.incomes.find(x => x.id === id); if (!inc) return;
  const toCome = Math.max(0, inc.expected - incReceived(inc));
  openModal(`
  <h3>${esc(inc.name)} — qism keldi</h3>
  <p style="color:var(--text-2);font-size:.9rem;margin-bottom:14px">Kelishi kutilayotgan: <b>${money(toCome)}</b></p>
  <div class="form-2">
    <div class="form-row"><label>Kelgan summa</label>${moneyInput("f_ramount", fmt(toCome))}</div>
    <div class="form-row"><label>Sana</label><input id="f_rdate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Izoh (ixtiyoriy)</label><input id="f_rnote" class="inp" placeholder="Masalan: 2-qism, avans..."></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveReceipt('${id}')">Saqlash</button>
  </div>`);
  document.getElementById("f_ramount").focus();
}
function saveReceipt(id) {
  const inc = S.incomes.find(x => x.id === id); if (!inc) return;
  const amount = mval("f_ramount");
  if (!(amount > 0)) return alert("Summani kiriting");
  inc.receipts.push({ id: uid(), amount, date: document.getElementById("f_rdate").value || todayISO(), note: document.getElementById("f_rnote").value.trim() });
  closeModal(); renderAll();
}
function delReceipt(incId, rId) {
  const inc = S.incomes.find(x => x.id === incId); if (!inc) return;
  inc.receipts = inc.receipts.filter(r => r.id !== rId);
  renderAll();
}
function delIncome(id) {
  const inc = S.incomes.find(x => x.id === id); if (!inc) return;
  confirmDo(`<b>${esc(inc.name)}</b> daromad yozuvi o'chirilsinmi?`, () => {
    S.incomes = S.incomes.filter(x => x.id !== id); renderAll();
  });
}

/* ================= 5. MAQSADLAR ================= */
function renderGoals() {
  const el = document.getElementById("tab-goals");
  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Maqsadlar</div>
      <div class="page-sub">Mashina, to'y, uy... — har biriga qancha yig'dingiz, qayerdan keldi va qancha qoldi</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfGoals")}
      <button class="btn btn-primary" onclick="openAddGoal()">${ico("plus")} Yangi maqsad</button>
    </div>
  </div>
  ${S.goals.length ? `<div class="grid grid-2">${S.goals.map(g => {
    const src = goalSources(g);
    const sv = src.total, left = Math.max(0, g.target - sv);
    const pct = Math.min(100, sv / g.target * 100);
    const done = sv >= g.target;
    return `<div class="card lift">
      <div class="debt-head">
        <div style="display:flex;gap:13px;align-items:center">
          <div class="avatar" ${avatarStyle(g.name)}>${ico("target")}</div>
          <div>
            <div class="debt-person">${esc(g.name)}</div>
            <div class="debt-meta">Maqsad: ${fmt(g.target)} so'm</div>
          </div>
        </div>
        ${done ? `<span class="chip chip-green">${ico("check")} Erishildi!</span>` : `<span class="chip chip-blue">${pct.toFixed(1)}%</span>`}
      </div>
      <div class="progress" style="height:11px"><div class="progress-fill ${done ? "green" : ""}" style="width:${pct}%"></div></div>
      <div class="debt-nums">
        <div class="debt-num"><div class="l">Yig'ildi</div><div class="v pos">${money(sv)}</div></div>
        <div class="debt-num"><div class="l">Qoldi</div><div class="v ${left > 0 ? "" : "pos"}">${money(left)}</div></div>
      </div>
      <div style="margin-top:13px;border-top:1px dashed var(--border-soft);padding-top:9px">
        <div style="font-size:.72rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px">Qayerdan keldi</div>
        <div class="src-line"><span>${ico("coins")} Qo'lda qo'shilgan (${g.deposits.length} ta)</span><b>${fmt(src.manual)} so'm</b></div>
        ${src.invs.map(i => `<div class="src-line"><span>${ico("trend")} ${esc(i.name)} — qo'yilgan ${fmt(i.principal)} + foyda ${fmt(i.profit)}</span><b>${fmt(i.principal + i.profit)} so'm</b></div>`).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-green" onclick="openGoalDeposit('${g.id}')">${ico("plus")} Pul qo'shish</button>
        <button class="btn btn-sm btn-ghost" onclick="pdfGoalOne('${g.id}')">${ico("download")} PDF</button>
        ${g.deposits.length ? `<button class="btn btn-sm btn-ghost" onclick="this.closest('.card').querySelector('.pay-history').classList.toggle('open')">${ico("clock")} Tarix</button>` : ""}
        <button class="btn btn-sm btn-danger-ghost" onclick="delGoal('${g.id}')">${ico("trash")}</button>
      </div>
      <div class="pay-history">
        ${g.deposits.map(p => `<div class="pay-item"><span>${fmtDate(p.date)}</span><span style="font-weight:600">+${money(p.amount)}</span></div>`).join("")}
      </div>
    </div>`;
  }).join("")}</div>` : `<div class="empty"><div class="empty-ico">${ico("target")}</div>Maqsadlar hali yo'q.<br>Birinchi maqsadingizni qo'shing: mashina, to'y, uy...</div>`}`;
}
function goalReportHTML(g) {
  const src = goalSources(g);
  return `<h2>${esc(g.name)}</h2>
  <div class="rep-tiles">
    <div class="rep-tile"><div class="l">Maqsad</div><div class="v">${fmt(g.target)} so'm</div></div>
    <div class="rep-tile"><div class="l">Yig'ildi</div><div class="v">${fmt(src.total)} so'm</div></div>
    <div class="rep-tile"><div class="l">Qoldi</div><div class="v">${fmt(Math.max(0, g.target - src.total))} so'm</div></div>
    <div class="rep-tile"><div class="l">Bajarildi</div><div class="v">${Math.min(100, src.total / g.target * 100).toFixed(1)}%</div></div>
  </div>
  <table>
    <tr><th>Manba</th><th class="num">Summa (so'm)</th></tr>
    <tr><td>Qo'lda qo'shilgan (${g.deposits.length} ta)</td><td class="num">${fmt(src.manual)}</td></tr>
    ${src.invs.map(i => `<tr><td>Investitsiya: ${esc(i.name)} (qo'yilgan ${fmt(i.principal)} + foyda ${fmt(i.profit)})</td><td class="num">${fmt(i.principal + i.profit)}</td></tr>`).join("")}
  </table>
  ${g.deposits.length ? `<table style="margin-top:8px">
    <tr><th>Qo'lda qo'shilganlar tarixi</th><th class="num">Summa</th></tr>
    ${g.deposits.map(p => `<tr><td>${p.date}</td><td class="num">${fmt(p.amount)}</td></tr>`).join("")}
  </table>` : ""}`;
}
function pdfGoals() { sectionPDF("Maqsadlar hisoboti", S.goals.map(goalReportHTML).join("") || "<p>Maqsadlar yo'q</p>"); }
function pdfGoalOne(id) {
  const g = S.goals.find(x => x.id === id); if (!g) return;
  sectionPDF(`Maqsad hisoboti — ${esc(g.name)}`, goalReportHTML(g));
}
function openAddGoal() {
  openModal(`
  <h3>Yangi maqsad</h3>
  <div class="form-row"><label>Maqsad nomi</label><input id="f_gname" class="inp" placeholder="Masalan: Mashina, To'y, Uy..."></div>
  <div class="form-row"><label>Kerakli summa (so'm)</label>${moneyInput("f_gtarget", "150,000,000")}</div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveGoal()">Saqlash</button>
  </div>`);
  document.getElementById("f_gname").focus();
}
function saveGoal() {
  const name = document.getElementById("f_gname").value.trim();
  const target = mval("f_gtarget");
  if (!name || !(target > 0)) return alert("Nomi va summani kiriting");
  S.goals.push({ id: uid(), name, target, deposits: [] });
  closeModal(); renderAll();
}
function openGoalDeposit(id) {
  const g = S.goals.find(x => x.id === id); if (!g) return;
  openModal(`
  <h3>${esc(g.name)} — pul qo'shish</h3>
  <p style="color:var(--text-2);font-size:.9rem;margin-bottom:16px">Qolgan: <b>${money(Math.max(0, g.target - goalSaved(g)))}</b></p>
  <div class="form-2">
    <div class="form-row"><label>Summa</label>${moneyInput("f_gdep", "1,000,000")}</div>
    <div class="form-row"><label>Sana</label><input id="f_gdate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveGoalDeposit('${id}')">Saqlash</button>
  </div>`);
  document.getElementById("f_gdep").focus();
}
function saveGoalDeposit(id) {
  const g = S.goals.find(x => x.id === id); if (!g) return;
  const amount = mval("f_gdep");
  if (!(amount > 0)) return alert("Summani kiriting");
  g.deposits.push({ id: uid(), amount, date: document.getElementById("f_gdate").value || todayISO() });
  closeModal(); renderAll();
}
function delGoal(id) {
  const g = S.goals.find(x => x.id === id); if (!g) return;
  confirmDo(`<b>${esc(g.name)}</b> maqsadi va uning tarixi o'chirilsinmi?`, () => {
    S.goals = S.goals.filter(x => x.id !== id);
    S.investments.forEach(i => { if (i.goalId === id) i.goalId = null; });
    renderAll();
  });
}

/* ================= 6. INVESTITSIYA ================= */
function renderInvest() {
  const el = document.getElementById("tab-invest");
  const totalIn = S.investments.reduce((s, i) => s + i.amount, 0);
  const totalProfit = S.investments.reduce((s, i) => s + invProfit(i), 0);
  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Investitsiya</div>
      <div class="page-sub">Qayerga qancha qo'ydingiz, har oy qancha foyda kelyapti</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${pdfBtn("pdfInvest")}
      <button class="btn btn-ghost" onclick="openLinkInvestHub()">${ico("link")} InvestHub'dan ulash</button>
      <button class="btn btn-primary" onclick="openAddInvest()">${ico("plus")} Yangi investitsiya</button>
    </div>
  </div>
  <div class="grid grid-3" style="margin-bottom:24px">
    <div class="card stat-tile"><div class="stat-label">Jami qo'yilgan</div><div class="stat-value">${money(totalIn)}</div></div>
    <div class="card stat-tile" style="--tile-glow:rgba(47,212,138,.3)"><div class="stat-label">Jami foyda</div><div class="stat-value pos">${money(totalProfit)}</div></div>
    <div class="card stat-tile" style="--tile-glow:rgba(91,140,255,.35)"><div class="stat-label">Umumiy qiymat</div><div class="stat-value">${money(totalIn + totalProfit)}</div></div>
  </div>
  ${S.investments.length ? `<div class="grid grid-2">${S.investments.map(inv => {
    const profit = invProfit(inv);
    const goal = inv.goalId ? S.goals.find(g => g.id === inv.goalId) : null;
    const profitsSorted = [...inv.profits].sort((a, b) => (a.ym < b.ym ? 1 : -1));
    return `<div class="card lift">
      <div class="debt-head">
        <div style="display:flex;gap:13px;align-items:center;min-width:0">
          <div class="avatar" ${avatarStyle(inv.name)}>${ico("trend")}</div>
          <div style="min-width:0">
            <div class="debt-person">${esc(inv.name)}${inv.linked ? ` <span class="chip chip-blue" style="font-size:.6rem">${ico("link")} InvestHub</span>` : ""}</div>
            <div class="debt-meta">${fmtDate(inv.date)}${inv.linked ? " · avtomatik yangilanadi" : inv.note ? " · " + esc(inv.note) : ""}</div>
          </div>
        </div>
        ${goal ? `<span class="chip chip-blue">${ico("link")} ${esc(goal.name)}</span>` : `<span class="chip chip-gray">Maqsadga bog'lanmagan</span>`}
      </div>
      <div class="debt-nums">
        <div class="debt-num"><div class="l">Qo'yilgan</div><div class="v">${money(inv.amount)}</div></div>
        <div class="debt-num"><div class="l">Foyda</div><div class="v pos">${money(profit)}</div></div>
        <div class="debt-num"><div class="l">Jami</div><div class="v">${money(inv.amount + profit)}</div></div>
      </div>
      ${profitsSorted.length ? `<div style="margin-top:12px;border-top:1px dashed var(--border-soft);padding-top:8px">
        ${profitsSorted.slice(0, 5).map(p => `<div class="pay-item"><span>${fmtYM(p.ym)}</span><span style="font-weight:600;color:var(--green)">+${fmt(p.amount)} so'm</span></div>`).join("")}
        ${profitsSorted.length > 5 ? `<div class="hint">yana ${profitsSorted.length - 5} ta yozuv...</div>` : ""}
      </div>` : ""}
      <div class="card-actions">
        ${inv.linked ? `
        <button class="btn btn-sm btn-green" onclick="refreshOneLinked('${inv.id}')">${ico("swap")} Yangilash</button>
        <button class="btn btn-sm btn-ghost" onclick="openLinkGoal('${inv.id}')">${ico("link")} Maqsadga bog'lash</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="unlinkInvest('${inv.id}')">Uzish</button>
        ` : `
        <button class="btn btn-sm btn-green" onclick="openAddProfit('${inv.id}')">${ico("plus")} Foyda kiritish</button>
        <button class="btn btn-sm btn-ghost" onclick="openLinkGoal('${inv.id}')">${ico("link")} Maqsadga bog'lash</button>
        <button class="btn btn-sm btn-danger-ghost" onclick="delInvest('${inv.id}')">${ico("trash")}</button>
        `}
      </div>
    </div>`;
  }).join("")}</div>` : `<div class="empty"><div class="empty-ico">${ico("trend")}</div>Investitsiyalar hali yo'q.<br>Daromadingizdan biror joyga pul qo'ygan bo'lsangiz, shu yerga kiriting va har oy foydasini yozib boring.</div>`}`;
}
function pdfInvest() {
  sectionPDF("Investitsiya hisoboti", `
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Jami qo'yilgan</div><div class="v">${fmt(S.investments.reduce((s, i) => s + i.amount, 0))} so'm</div></div>
      <div class="rep-tile"><div class="l">Jami foyda</div><div class="v">${fmt(S.investments.reduce((s, i) => s + invProfit(i), 0))} so'm</div></div>
    </div>
    ${S.investments.map(inv => {
      const goal = inv.goalId ? S.goals.find(g => g.id === inv.goalId) : null;
      return `<h2>${esc(inv.name)} — ${fmtDate(inv.date)}${goal ? ` (maqsad: ${esc(goal.name)})` : ""}</h2>
      <table>
        <tr><th>Oy</th><th class="num">Foyda (so'm)</th></tr>
        ${[...inv.profits].sort((a, b) => (a.ym < b.ym ? 1 : -1)).map(p => `<tr><td>${fmtYM(p.ym)}</td><td class="num">${fmt(p.amount)}</td></tr>`).join("") || `<tr><td colspan="2">Foyda hali kiritilmagan</td></tr>`}
        <tr><td><b>Qo'yilgan summa</b></td><td class="num"><b>${fmt(inv.amount)}</b></td></tr>
        <tr><td><b>Jami (qo'yilgan + foyda)</b></td><td class="num"><b>${fmt(inv.amount + invProfit(inv))}</b></td></tr>
      </table>`;
    }).join("") || "<p>Investitsiyalar yo'q</p>"}`);
}
function openAddInvest() {
  openModal(`
  <h3>Yangi investitsiya</h3>
  <div class="form-row"><label>Nomi / qayerga</label><input id="f_vname" class="inp" placeholder="Masalan: Do'kon biznesi, Aksiya..."></div>
  <div class="form-2">
    <div class="form-row"><label>Qo'yilgan summa (so'm)</label>${moneyInput("f_vamount", "10,000,000")}</div>
    <div class="form-row"><label>Sana</label><input id="f_vdate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Maqsadga bog'lash (ixtiyoriy)</label>
    <select id="f_vgoal" class="inp">
      <option value="">— Bog'lanmasin —</option>
      ${S.goals.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}
    </select>
    <div class="hint">Bog'lansa: qo'yilgan summa va foydalar avtomatik maqsad jamg'armasida ko'rinadi</div></div>
  <div class="form-row"><label>Izoh (ixtiyoriy)</label><input id="f_vnote" class="inp" placeholder="..."></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveInvest()">Saqlash</button>
  </div>`);
  document.getElementById("f_vname").focus();
}
function saveInvest() {
  const name = document.getElementById("f_vname").value.trim();
  const amount = mval("f_vamount");
  if (!name || !(amount > 0)) return alert("Nomi va summani kiriting");
  S.investments.push({
    id: uid(), name, amount,
    date: document.getElementById("f_vdate").value || todayISO(),
    goalId: document.getElementById("f_vgoal").value || null,
    note: document.getElementById("f_vnote").value.trim(),
    profits: []
  });
  closeModal(); renderAll();
}
function openAddProfit(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  openModal(`
  <h3>${esc(inv.name)} — oylik foyda</h3>
  <div class="form-2">
    <div class="form-row"><label>Qaysi oy</label><input id="f_pym" class="inp" type="month" value="${nowYM()}"></div>
    <div class="form-row"><label>Foyda summasi</label>${moneyInput("f_pamount", "500,000")}</div>
  </div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveProfit('${id}')">Saqlash</button>
  </div>`);
  document.getElementById("f_pamount").focus();
}
function saveProfit(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  const amount = mval("f_pamount");
  const ym = document.getElementById("f_pym").value;
  if (!(amount > 0) || !ym) return alert("Oy va summani kiriting");
  inv.profits.push({ id: uid(), ym, amount });
  closeModal(); renderAll();
}
function openLinkGoal(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  openModal(`
  <h3>${esc(inv.name)} — maqsadga bog'lash</h3>
  <div class="form-row"><label>Maqsad</label>
    <select id="f_lgoal" class="inp">
      <option value="">— Bog'lanmasin —</option>
      ${S.goals.map(g => `<option value="${g.id}" ${inv.goalId === g.id ? "selected" : ""}>${esc(g.name)}</option>`).join("")}
    </select></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveLinkGoal('${id}')">Saqlash</button>
  </div>`);
}
function saveLinkGoal(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  inv.goalId = document.getElementById("f_lgoal").value || null;
  closeModal(); renderAll();
}
function delInvest(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  confirmDo(`<b>${esc(inv.name)}</b> investitsiyasi va foyda tarixi o'chirilsinmi?`, () => {
    S.investments = S.investments.filter(x => x.id !== id); renderAll();
  });
}

/* ===== InvestHub bilan ulash =====
   InvestHub'da investorga berilgan "ulanish kodi" orqali o'sha investorning
   kapitali va oylik foydalarini shu yerga tortadi va avtomatik yangilab boradi. */
const SHARE_CODE_RE = /^[a-f0-9]{16,64}$/;

async function fetchSharedSnapshot(code) {
  try {
    const r = await fetch(`/api/shared/${code}`, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/* Snapshot ma'lumotini investitsiya yozuviga ko'chiradi (id/goalId/sana saqlanadi) */
function applySnapshotToInvestment(inv, snap) {
  inv.name = snap.investor ? `${snap.fund} — ${snap.investor}` : (snap.fund || "InvestHub");
  inv.amount = Number(snap.amount) || 0;
  inv.profits = (Array.isArray(snap.profits) ? snap.profits : [])
    .map(p => ({ id: uid(), ym: p.ym, amount: Number(p.amount) || 0 }));
  inv.linkedFund = snap.fund || "";
  inv.linkedInvestor = snap.investor || "";
  inv.linkedAt = snap.updatedAt || Date.now();
}

function linkMsg(html) {
  const el = document.getElementById("linkMsg");
  if (el) el.innerHTML = html;
}

function openLinkInvestHub() {
  openModal(`
  <h3>InvestHub'dan ulash</h3>
  <div class="form-row"><label>Ulanish kodi</label>
    <input id="f_linkcode" class="inp" placeholder="InvestHub'dagi investordan olingan kod" autocomplete="off">
    <div class="hint">InvestHub ilovasida o'z investoringizni oching → <b>Hisobchiga ulash</b> → kodni nusxalab, shu yerga joylashtiring. Kapital va oylik foydalar avtomatik tortiladi va yangilanib boradi.</div>
  </div>
  <div id="linkMsg"></div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="doLinkInvestHub()">Ulash</button>
  </div>`);
  document.getElementById("f_linkcode").focus();
}

async function doLinkInvestHub() {
  const code = (document.getElementById("f_linkcode").value || "").trim().toLowerCase();
  if (!SHARE_CODE_RE.test(code)) return linkMsg(`<div class="warn-text">Kod formati noto'g'ri — InvestHub'dan olingan to'liq kodni joylashtiring</div>`);
  if (S.investments.some(i => i.linkCode === code)) return linkMsg(`<div class="warn-text">Bu investor allaqachon ulangan</div>`);
  linkMsg(`<div class="hint">Yuklanmoqda...</div>`);
  const snap = await fetchSharedSnapshot(code);
  if (!snap) return linkMsg(`<div class="warn-text">Kod bo'yicha ma'lumot topilmadi. Kodni va internet aloqasini tekshiring.</div>`);
  const inv = { id: uid(), date: todayISO(), goalId: null, note: "InvestHub", linkCode: code, linked: true, profits: [] };
  applySnapshotToInvestment(inv, snap);
  S.investments.push(inv);
  closeModal(); renderAll();
}

/* Bitta ulangan investitsiyani darhol yangilash */
async function refreshOneLinked(id) {
  const inv = S.investments.find(x => x.id === id);
  if (!inv || !inv.linkCode) return;
  const snap = await fetchSharedSnapshot(inv.linkCode);
  if (!snap) return alert("Yangilab bo'lmadi — server javob bermadi yoki internet yo'q");
  applySnapshotToInvestment(inv, snap);
  renderAll();
}

/* Ulangan barcha investitsiyalarni yangilash (kirishda chaqiriladi) */
async function refreshLinkedInvestments() {
  if (!S) return;
  const linked = S.investments.filter(i => i.linked && i.linkCode);
  if (!linked.length) return;
  let changed = false;
  for (const inv of linked) {
    const snap = await fetchSharedSnapshot(inv.linkCode);
    if (snap && (snap.updatedAt || 0) > (inv.linkedAt || 0)) {
      applySnapshotToInvestment(inv, snap);
      changed = true;
    }
  }
  if (changed && currentUser) {
    save();
    if (activeTab === "invest") renderTab("invest");
  }
}

function unlinkInvest(id) {
  const inv = S.investments.find(x => x.id === id); if (!inv) return;
  confirmDo(`<b>${esc(inv.name)}</b> — InvestHub ulanishini uzasizmi? Ma'lumot qoladi, lekin bundan keyin avtomatik yangilanmaydi (oddiy investitsiyaga aylanadi).`, () => {
    delete inv.linkCode; delete inv.linked; delete inv.linkedAt;
    renderAll();
  });
}

/* ================= 7. PUL YIG'ISH (jamoa) ================= */
function renderCollections() {
  const el = document.getElementById("tab-collections");
  const list = [...S.collections].sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Pul yig'ish</div>
      <div class="page-sub">Jamoa uchun pul yig'ish — kim berdi, kimga berdi, qancha yig'ildi</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfCollections")}
      <button class="btn btn-primary" onclick="openAddCollection()">${ico("plus")} Yangi yig'ish</button>
    </div>
  </div>
  ${list.length ? list.map(c => {
    const { exact, rounded } = collectionPerPerson(c);
    const collected = collectionCollected(c);
    const paidCount = c.people.filter(p => p.paid).length;
    const pct = Math.min(100, collected / c.total * 100);
    const diff = Math.abs(rounded - exact) > 0.001;
    // Sarflaganga qaytaradigan odamlar (o'zi sarflaganlar bundan mustasno)
    const payersBack = c.people.filter(p => !p.self).length;
    // Yaxlitlangan (32,000 dan) va aslidagi (yaxlitlashsiz) qaytish summalari —
    // ikkalasi ham ko'rsatiladi, chalkashmaslik uchun.
    const backRounded = c.spender ? payersBack * rounded : 0;
    const backExact = c.spender ? payersBack * exact : 0;
    return `<div class="card" style="margin-bottom:18px">
      <div class="debt-head">
        <div>
          <div class="debt-person" style="font-size:1.15rem">${esc(c.title)}</div>
          <div class="debt-meta">${fmtDate(c.date)} · ${c.people.length} kishi · kishi boshiga
            <b style="color:var(--text)">${fmt(rounded)} so'm</b>
            ${diff ? `<span class="orig-sum" style="display:inline;margin-left:4px">(aslida: ${fmt(exact)})</span>` : ""}
          </div>
          ${c.spender ? `<div style="margin-top:7px"><span class="spender-chip">${ico("wallet")} Sarflagan: ${esc(c.spender)} — unga <b>${fmt(backRounded)} so'm</b> qaytadi${payersBack ? ` <span style="opacity:.75;font-weight:500">(${payersBack} kishi × ${fmt(rounded)} so'm)</span>` : ""}${diff ? ` <span class="orig-sum" style="display:inline;margin-left:2px">· aslida ${fmt(backExact)} so'm</span>` : ""}</span></div>` : ""}
        </div>
        ${paidCount === c.people.length
          ? `<span class="chip chip-green">${ico("check")} To'liq yig'ildi</span>`
          : `<span class="chip chip-yellow">${paidCount}/${c.people.length} kishi berdi</span>`}
      </div>
      <div class="collect-summary">
        <div class="debt-num"><div class="l">Yig'ilishi kerak</div><div class="v">${money(c.total)}</div></div>
        <div class="debt-num"><div class="l">Yig'ildi</div><div class="v pos">${money(collected)}</div></div>
        <div class="debt-num"><div class="l">Qoldi</div><div class="v ${c.total - collected > 0 ? "neg" : "pos"}">${money(Math.max(0, c.total - collected))}</div></div>
      </div>
      <div class="progress"><div class="progress-fill ${pct >= 100 ? "green" : "yellow"}" style="width:${pct}%"></div></div>
      <div style="margin-top:14px">
        ${c.people.map(p => {
          const isSelf = p.self;
          return `
        <div class="person-row">
          <button class="check ${p.paid ? "on" : ""}" onclick="togglePersonPaid('${c.id}','${p.id}')" title="Berdi deb belgilash">✓</button>
          <div class="p-name ${p.paid ? "paid-name" : ""}" style="flex:1">
            ${esc(p.name)}
            ${p.paid && !isSelf && p.givenTo ? `<div class="given-note">${ico("arrowR")} ${esc(p.givenTo)}ga berdi</div>` : ""}
          </div>
          ${isSelf
            ? `<span class="chip self-chip">${ico("wallet")} O'zi sarflagan</span>`
            : `${p.paid ? `<select class="given-sel" onchange="setGivenTo('${c.id}','${p.id}',this.value)">
                <option value="">kimga berdi?</option>
                ${c.spender ? `<option value="${esc(c.spender)}" ${p.givenTo === c.spender ? "selected" : ""}>${esc(c.spender)} (sarflagan)</option>` : ""}
                ${c.people.filter(x => x.id !== p.id && x.name.toLowerCase() !== (c.spender || "").toLowerCase()).map(x =>
                  `<option value="${esc(x.name)}" ${p.givenTo === x.name ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
                ${p.givenTo && p.givenTo !== c.spender && !c.people.some(x => x.name === p.givenTo) ? `<option value="${esc(p.givenTo)}" selected>${esc(p.givenTo)}</option>` : ""}
                <option value="__other">Boshqa odam...</option>
              </select>` : ""}
            <div class="method-chips">
              <button class="m-chip ${p.method === "naqd" ? "on-naqd" : ""}" onclick="setPayMethod('${c.id}','${p.id}','naqd')">${ico("cash")} Naqd</button>
              <button class="m-chip ${p.method === "plastik" ? "on-plastik" : ""}" onclick="setPayMethod('${c.id}','${p.id}','plastik')">${ico("card")} Plastik</button>
            </div>`}
          <div class="p-due">
            <div class="rounded-sum">${fmt(rounded)} <span style="font-size:.7em;color:var(--text-3)">so'm</span></div>
            ${diff ? `<span class="orig-sum">aslida: ${fmt(exact)}</span>` : ""}
          </div>
        </div>`;
        }).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-danger-ghost" onclick="delCollection('${c.id}')">${ico("trash")} O'chirish</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty"><div class="empty-ico">${ico("users")}</div>Hali pul yig'ishlar yo'q.<br>Jamoa uchun biror narsa olinganda yoki pul yig'ish kerak bo'lganda shu yerga kiriting.</div>`}`;
}
function pdfCollections() {
  sectionPDF("Pul yig'ish hisoboti", S.collections.map(c => {
    const { exact, rounded } = collectionPerPerson(c);
    return `<h2>${esc(c.title)} — ${fmtDate(c.date)}</h2>
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Yig'ilishi kerak</div><div class="v">${fmt(c.total)} so'm</div></div>
      <div class="rep-tile"><div class="l">Yig'ildi</div><div class="v">${fmt(collectionCollected(c))} so'm</div></div>
      <div class="rep-tile"><div class="l">Kishi boshiga</div><div class="v">${fmt(rounded)} so'm (aslida ${fmt(exact)})</div></div>
      ${c.spender ? `<div class="rep-tile"><div class="l">Sarflagan</div><div class="v">${esc(c.spender)}</div></div>` : ""}
    </div>
    <table>
      <tr><th>Ism</th><th>Berdimi</th><th>Usul</th><th>Kimga berdi</th><th class="num">Summa</th></tr>
      ${c.people.map(p => `<tr>
        <td>${esc(p.name)}</td>
        <td>${p.self ? "O'zi sarflagan" : p.paid ? "Berdi" : "Bermagan"}</td>
        <td>${p.self ? "-" : p.method === "naqd" ? "Naqd" : p.method === "plastik" ? "Plastik" : "-"}</td>
        <td>${p.self ? "-" : esc(p.givenTo || "-")}</td>
        <td class="num">${fmt(rounded)}</td></tr>`).join("")}
    </table>`;
  }).join("") || "<p>Yig'ishlar yo'q</p>");
}
function openAddCollection() {
  openModal(`
  <h3>Yangi pul yig'ish</h3>
  <div class="form-row"><label>Nima uchun</label><input id="f_ctitle" class="inp" placeholder="Masalan: Jamoa uchun to'p olindi"></div>
  <div class="form-2">
    <div class="form-row"><label>Umumiy summa (so'm)</label>${moneyInput("f_ctotal", "500,000", 'oninput="collectionLive()"')}</div>
    <div class="form-row"><label>Sana</label><input id="f_cdate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Pulni kim sarflagan (unga qaytariladi)</label>
    <input id="f_cspender" class="inp" placeholder="Masalan: Izzatilla" oninput="collectionLive()">
    <div class="hint">Agar bu ism quyidagi ro'yxatda ham bo'lsa, uning ulushi avtomatik "o'zi sarflagan" deb belgilanadi</div></div>
  <div class="form-row"><label>Ishtirokchilar ismlari</label>
    <div id="peopleRows"></div>
    <button class="btn btn-sm btn-ghost" onclick="addPersonRow()">${ico("plus")} Odam qo'shish</button>
  </div>
  <div class="live-calc" id="collectCalc">Summa va ismlarni kiriting...</div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveCollection()">Tasdiqlash</button>
  </div>`);
  addPersonRow(); addPersonRow(); addPersonRow();
  document.getElementById("f_ctitle").focus();
}
function addPersonRow() {
  const div = document.createElement("div");
  div.className = "dyn-row";
  div.innerHTML = `
    <input class="inp person-name" placeholder="Ism familiya" oninput="collectionLive()">
    <button class="dyn-del" onclick="this.parentElement.remove();collectionLive()">✕</button>`;
  document.getElementById("peopleRows").appendChild(div);
}
function collectionLive() {
  const total = mval("f_ctotal");
  const names = [...document.querySelectorAll(".person-name")].map(i => i.value.trim()).filter(Boolean);
  const spender = document.getElementById("f_cspender").value.trim();
  const box = document.getElementById("collectCalc");
  if (!total || !names.length) { box.innerHTML = "Summa va ismlarni kiriting..."; return; }
  const exact = total / names.length;
  const rounded = roundUp1000(exact);
  const diff = Math.abs(rounded - exact) > 0.001;
  const inList = spender && names.some(n => n.toLowerCase() === spender.toLowerCase());
  box.innerHTML = `${names.length} kishi · kishi boshiga: <b>${fmt(rounded)} so'm</b>` +
    (diff ? ` <span style="color:var(--red);font-size:.8rem">(aslida: ${fmt(exact)}, yaxlitlandi)</span>` : "") +
    (spender ? `<br><span style="font-size:.82rem">Sarflagan: <b>${esc(spender)}</b>${inList ? " — ro'yxatda bor, ulushi avtomatik hisoblanadi ✓" : ""}</span>` : "");
}
function saveCollection() {
  const title = document.getElementById("f_ctitle").value.trim();
  const total = mval("f_ctotal");
  const spender = document.getElementById("f_cspender").value.trim();
  const names = [...document.querySelectorAll(".person-name")].map(i => i.value.trim()).filter(Boolean);
  if (!title || !(total > 0) || !names.length) return alert("Nomi, summa va kamida bitta ism kiriting");
  const people = names.map(n => {
    const isSelf = spender && n.toLowerCase() === spender.toLowerCase();
    return { id: uid(), name: n, paid: !!isSelf, method: null, givenTo: "", self: !!isSelf };
  });
  S.collections.push({
    id: uid(), title, total, spender,
    date: document.getElementById("f_cdate").value || todayISO(), people
  });
  closeModal(); renderAll();
}
function togglePersonPaid(cid, pid) {
  const c = S.collections.find(x => x.id === cid); if (!c) return;
  const p = c.people.find(x => x.id === pid); if (!p) return;
  if (p.self) return; /* o'zi sarflagan — belgini o'zgartirish shart emas */
  p.paid = !p.paid;
  if (!p.paid) { p.method = null; p.givenTo = ""; }
  else if (!p.givenTo && c.spender) p.givenTo = c.spender;
  renderAll();
}
function setPayMethod(cid, pid, method) {
  const c = S.collections.find(x => x.id === cid); if (!c) return;
  const p = c.people.find(x => x.id === pid); if (!p) return;
  p.method = p.method === method ? null : method;
  if (p.method && !p.paid) { p.paid = true; if (!p.givenTo && c.spender) p.givenTo = c.spender; }
  renderAll();
}
function setGivenTo(cid, pid, value) {
  const c = S.collections.find(x => x.id === cid); if (!c) return;
  const p = c.people.find(x => x.id === pid); if (!p) return;
  if (value === "__other") {
    openModal(`
    <h3>${esc(p.name)} pulni kimga berdi?</h3>
    <div class="form-row"><label>Ism</label><input id="f_givento" class="inp" placeholder="Ism familiya"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal();renderAll()">Bekor</button>
      <button class="btn btn-primary" onclick="saveGivenTo('${cid}','${pid}')">Saqlash</button>
    </div>`);
    document.getElementById("f_givento").focus();
    return;
  }
  p.givenTo = value;
  renderAll();
}
function saveGivenTo(cid, pid) {
  const c = S.collections.find(x => x.id === cid); if (!c) return;
  const p = c.people.find(x => x.id === pid); if (!p) return;
  const name = document.getElementById("f_givento").value.trim();
  if (name) p.givenTo = name;
  closeModal(); renderAll();
}
function delCollection(id) {
  const c = S.collections.find(x => x.id === id); if (!c) return;
  confirmDo(`<b>${esc(c.title)}</b> yig'ish yozuvi o'chirilsinmi?`, () => {
    S.collections = S.collections.filter(x => x.id !== id); renderAll();
  });
}

/* ================= 8. O'TIRISH HISOBI ================= */
function renderGatherings() {
  const el = document.getElementById("tab-gatherings");
  const list = [...S.gatherings].sort((a, b) => (a.date < b.date ? 1 : -1));
  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">O'tirish hisobi</div>
      <div class="page-sub">Har kim har xil sarflagan — kim kimga qancha berishi kerakligini dastur hisoblaydi</div>
    </div>
    <div style="display:flex;gap:10px">
      ${pdfBtn("pdfGatherings")}
      <button class="btn btn-primary" onclick="openAddGathering()">${ico("plus")} Yangi o'tirish</button>
    </div>
  </div>
  ${list.length ? list.map(g => {
    const st = settleGathering(g);
    return `<div class="card" style="margin-bottom:18px">
      <div class="debt-head">
        <div>
          <div class="debt-person" style="font-size:1.15rem">${esc(g.title)}</div>
          <div class="debt-meta">${fmtDate(g.date)} · ${g.people.length} kishi</div>
        </div>
        <span class="chip chip-blue">Kishi boshiga: ${perPersonLabel(st.share, { inline: true })}</span>
      </div>
      <div class="collect-summary">
        <div class="debt-num"><div class="l">Jami sarflandi</div><div class="v">${money(st.total)}</div></div>
      </div>
      <div class="tbl-scroll"><table class="tbl" style="margin-top:14px">
        <tr><th>Ishtirokchi</th><th class="num">Sarfladi</th><th class="num">Ulushi</th><th class="num">Hisob</th></tr>
        ${st.balances.map(b => `<tr>
          <td style="font-weight:600">${esc(b.name)}</td>
          <td class="num">${fmt(b.spent)}</td>
          <td class="num" style="color:var(--text-3)">${fmt(Math.round(st.share))}</td>
          <td class="num ${b.balance > 0.01 ? "balance-pos" : b.balance < -0.01 ? "balance-neg" : ""}">
            ${b.balance > 0.01 ? "oladi " + fmt(Math.round(b.balance)) : b.balance < -0.01 ? "beradi " + fmt(Math.round(-b.balance)) : "teng ✓"}
          </td>
        </tr>`).join("")}
      </table></div>
      ${st.transfers.length ? `
      <div style="margin-top:16px">
        <div style="font-size:.8rem;color:var(--text-2);font-weight:700;margin-bottom:9px;text-transform:uppercase;letter-spacing:.7px">Kim kimga beradi:</div>
        ${st.transfers.map(t => `<div class="settle-line">
          <b>${esc(t.from)}</b> <span class="settle-arrow">→</span> <b>${esc(t.to)}</b>
          <span style="margin-left:auto;font-weight:800">${fmt(Math.round(t.amount))} so'm</span>
        </div>`).join("")}
      </div>` : `<div class="hint" style="margin-top:12px">Hamma teng sarflagan — hech kim hech kimga qarz emas ✓</div>`}
      <div class="card-actions">
        <button class="btn btn-sm btn-danger-ghost" onclick="delGathering('${g.id}')">${ico("trash")} O'chirish</button>
      </div>
    </div>`;
  }).join("") : `<div class="empty"><div class="empty-ico">${ico("utensils")}</div>O'tirishlar hali yo'q.<br>Jamoa bilan o'tirishda kim qancha sarflaganini kiriting — dastur o'zi taqsimlab beradi.</div>`}`;
}
function pdfGatherings() {
  sectionPDF("O'tirish hisobotlari", S.gatherings.map(g => {
    const st = settleGathering(g);
    return `<h2>${esc(g.title)} — ${fmtDate(g.date)}</h2>
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Jami sarflandi</div><div class="v">${fmt(st.total)} so'm</div></div>
      <div class="rep-tile"><div class="l">Kishi boshiga</div><div class="v">${fmt(st.roundedShare)} so'm${Math.abs(st.roundedShare - st.share) > 0.001 ? ` <span style="font-size:.72em;color:#888">(aslida ${fmt(st.share)})</span>` : ""}</div></div>
    </div>
    <table>
      <tr><th>Ishtirokchi</th><th class="num">Sarfladi</th><th class="num">Ulushi</th><th>Hisob</th></tr>
      ${st.balances.map(b => `<tr><td>${esc(b.name)}</td><td class="num">${fmt(b.spent)}</td><td class="num">${fmt(Math.round(st.share))}</td>
        <td>${b.balance > 0.01 ? "oladi " + fmt(Math.round(b.balance)) : b.balance < -0.01 ? "beradi " + fmt(Math.round(-b.balance)) : "teng"}</td></tr>`).join("")}
    </table>
    ${st.transfers.length ? `<table style="margin-top:8px">
      <tr><th>Kim</th><th>Kimga</th><th class="num">Summa</th></tr>
      ${st.transfers.map(t => `<tr><td>${esc(t.from)}</td><td>${esc(t.to)}</td><td class="num">${fmt(Math.round(t.amount))}</td></tr>`).join("")}
    </table>` : ""}`;
  }).join("") || "<p>O'tirishlar yo'q</p>");
}
function openAddGathering() {
  openModal(`
  <h3>Yangi o'tirish</h3>
  <div class="form-2">
    <div class="form-row"><label>Nomi</label><input id="f_gtitle" class="inp" placeholder="Masalan: Shanba osh"></div>
    <div class="form-row"><label>Sana</label><input id="f_ggdate" class="inp" type="date" value="${todayISO()}"></div>
  </div>
  <div class="form-row"><label>Ishtirokchilar va kim qancha sarflagani (sarflamagan bo'lsa 0 qoldiring)</label>
    <div id="spendRows"></div>
    <button class="btn btn-sm btn-ghost" onclick="addSpendRow()">${ico("plus")} Odam qo'shish</button>
  </div>
  <div class="live-calc" id="gatherCalc">Ismlar va summalarni kiriting...</div>
  <div class="modal-actions">
    <button class="btn btn-ghost" onclick="closeModal()">Bekor</button>
    <button class="btn btn-primary" onclick="saveGathering()">Hisoblash va saqlash</button>
  </div>`);
  addSpendRow(); addSpendRow(); addSpendRow();
  document.getElementById("f_gtitle").focus();
}
function addSpendRow() {
  const div = document.createElement("div");
  div.className = "dyn-row";
  div.innerHTML = `
    <input class="inp spend-name" placeholder="Ism" oninput="gatherLive()">
    <input class="inp spend-amount money-inp" type="text" inputmode="decimal" placeholder="0" style="max-width:140px" oninput="gatherLive()">
    <button class="dyn-del" onclick="this.parentElement.remove();gatherLive()">✕</button>`;
  document.getElementById("spendRows").appendChild(div);
}
function gatherLive() {
  const rows = [...document.querySelectorAll("#spendRows .dyn-row")]
    .map(r => ({ name: r.querySelector(".spend-name").value.trim(), spent: parseMoney(r.querySelector(".spend-amount").value) }))
    .filter(r => r.name);
  const box = document.getElementById("gatherCalc");
  if (rows.length < 2) { box.innerHTML = "Kamida 2 ta ishtirokchi kiriting..."; return; }
  const total = rows.reduce((s, r) => s + r.spent, 0);
  const gExact = total / rows.length;
  const gRounded = roundUp1000(gExact);
  const gDiff = Math.abs(gRounded - gExact) > 0.001;
  box.innerHTML = `Jami: <b>${fmt(total)} so'm</b> · ${rows.length} kishi · kishi boshiga: <b>${fmt(gRounded)} so'm</b>`
    + (gDiff ? ` <span style="color:var(--red);font-size:.8rem">(aslida: ${fmt(gExact)})</span>` : "");
}
function saveGathering() {
  const title = document.getElementById("f_gtitle").value.trim();
  const rows = [...document.querySelectorAll("#spendRows .dyn-row")]
    .map(r => ({ id: uid(), name: r.querySelector(".spend-name").value.trim(), spent: parseMoney(r.querySelector(".spend-amount").value) }))
    .filter(r => r.name);
  if (!title || rows.length < 2) return alert("Nomi va kamida 2 ta ishtirokchi kiriting");
  S.gatherings.push({ id: uid(), title, date: document.getElementById("f_ggdate").value || todayISO(), people: rows });
  closeModal(); renderAll();
}
function delGathering(id) {
  const g = S.gatherings.find(x => x.id === id); if (!g) return;
  confirmDo(`<b>${esc(g.title)}</b> o'tirish hisobi o'chirilsinmi?`, () => {
    S.gatherings = S.gatherings.filter(x => x.id !== id); renderAll();
  });
}

/* ================= 9. STATISTIKA ================= */
let statsYear = new Date().getFullYear();
let statsMonth = 0; /* 0 = butun yil */

function renderStats() {
  const el = document.getElementById("tab-stats");
  const tx = personalTransactions();
  const years = [...new Set(tx.map(t => +t.date.slice(0, 4)).concat(new Date().getFullYear()))].sort((a, b) => b - a);
  if (!years.includes(statsYear)) statsYear = years[0];

  const inPeriod = t => {
    const y = +t.date.slice(0, 4), m = +t.date.slice(5, 7);
    return y === statsYear && (statsMonth === 0 || m === statsMonth);
  };
  const period = tx.filter(inPeriod);
  const kirim = period.filter(t => t.type === "kirim").reduce((s, t) => s + t.amount, 0);
  const chiqim = period.filter(t => t.type === "chiqim").reduce((s, t) => s + t.amount, 0);

  const byMonth = Array.from({ length: 12 }, () => ({ kirim: 0, chiqim: 0 }));
  for (const t of tx) {
    if (+t.date.slice(0, 4) !== statsYear) continue;
    byMonth[+t.date.slice(5, 7) - 1][t.type] += t.amount;
  }

  const cats = {};
  for (const t of period) {
    cats[t.cat] = cats[t.cat] || { type: t.type, sum: 0, count: 0 };
    cats[t.cat].sum += t.amount; cats[t.cat].count++;
  }

  const inPeriodDate = d => {
    const y = +d.slice(0, 4), m = +d.slice(5, 7);
    return y === statsYear && (statsMonth === 0 || m === statsMonth);
  };
  const teamCollections = S.collections.filter(c => inPeriodDate(c.date));
  const teamGatherings = S.gatherings.filter(g => inPeriodDate(g.date));

  const periodLabel = statsMonth === 0 ? `${statsYear}-yil` : `${MONTHS[statsMonth - 1]}, ${statsYear}`;

  el.innerHTML = `
  <div class="page-head">
    <div>
      <div class="page-title">Statistika</div>
      <div class="page-sub">Oylik va yillik moliyaviy tahlil</div>
    </div>
    <div class="stats-controls">
      <select id="statsYearSel" class="inp" onchange="statsYear=+this.value;renderStats()">
        ${years.map(y => `<option value="${y}" ${y === statsYear ? "selected" : ""}>${y}-yil</option>`).join("")}
      </select>
      <select id="statsMonthSel" class="inp" onchange="statsMonth=+this.value;renderStats()">
        <option value="0" ${statsMonth === 0 ? "selected" : ""}>Butun yil</option>
        ${MONTHS.map((m, i) => `<option value="${i + 1}" ${statsMonth === i + 1 ? "selected" : ""}>${m}</option>`).join("")}
      </select>
      <button class="btn btn-primary" onclick="downloadPDF()">${ico("download")} PDF yuklab olish</button>
    </div>
  </div>

  <div class="grid grid-3" style="margin-bottom:22px">
    <div class="card stat-tile" style="--tile-glow:rgba(57,135,229,.35)">
      <div class="stat-label">Kirim — ${periodLabel}</div>
      <div class="stat-value" style="color:var(--chart-in)">${money(kirim)}</div>
    </div>
    <div class="card stat-tile" style="--tile-glow:rgba(230,103,103,.35)">
      <div class="stat-label">Chiqim — ${periodLabel}</div>
      <div class="stat-value" style="color:var(--chart-out)">${money(chiqim)}</div>
    </div>
    <div class="card stat-tile" style="--tile-glow:rgba(47,212,138,.3)">
      <div class="stat-label">Saldo (farq)</div>
      <div class="stat-value ${kirim - chiqim >= 0 ? "pos" : "neg"}">${money(kirim - chiqim)}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:22px">
    <div class="stat-label" style="margin-bottom:4px">${ico("chart")} ${statsYear}-yil, oylar kesimida</div>
    <div class="legend">
      <span class="li"><span class="sw" style="background:var(--chart-in)"></span> Kirim</span>
      <span class="li"><span class="sw" style="background:var(--chart-out)"></span> Chiqim</span>
    </div>
    <div class="chart-wrap">${barChartSVG(byMonth)}</div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <div class="stat-label" style="margin-bottom:10px">Shaxsiy — kategoriyalar bo'yicha (${periodLabel})</div>
      ${Object.keys(cats).length ? `<div class="tbl-scroll"><table class="tbl">
        <tr><th>Kategoriya</th><th>Turi</th><th class="num">Summa</th></tr>
        ${Object.entries(cats).sort((a, b) => b[1].sum - a[1].sum).map(([name, c]) => `<tr>
          <td>${esc(name)} <span style="color:var(--text-3);font-size:.78rem">(${c.count} ta)</span></td>
          <td><span class="chip ${c.type === "kirim" ? "chip-blue" : "chip-red"}" style="font-size:.66rem">${c.type}</span></td>
          <td class="num" style="font-weight:700">${fmt(c.sum)}</td>
        </tr>`).join("")}
      </table></div>` : `<div class="empty" style="padding:24px">Bu davrda harakatlar yo'q</div>`}
    </div>
    <div class="card">
      <div class="stat-label" style="margin-bottom:10px">Jamoaviy — ${periodLabel}</div>
      ${teamCollections.length || teamGatherings.length ? `<div class="tbl-scroll"><table class="tbl">
        <tr><th>Nomi</th><th>Turi</th><th class="num">Summa</th></tr>
        ${teamCollections.map(c => `<tr>
          <td>${esc(c.title)}</td><td><span class="chip chip-yellow" style="font-size:.66rem">yig'ish</span></td>
          <td class="num" style="font-weight:700">${fmt(c.total)}</td></tr>`).join("")}
        ${teamGatherings.map(g => `<tr>
          <td>${esc(g.title)}</td><td><span class="chip chip-gray" style="font-size:.66rem">o'tirish</span></td>
          <td class="num" style="font-weight:700">${fmt(settleGathering(g).total)}</td></tr>`).join("")}
      </table></div>` : `<div class="empty" style="padding:24px">Bu davrda jamoaviy hisoblar yo'q</div>`}
    </div>
  </div>`;
}

/* ---- SVG ustunli diagramma ---- */
function barChartSVG(byMonth) {
  const W = 860, H = 260, padL = 66, padB = 26, padT = 12;
  const plotW = W - padL - 10, plotH = H - padT - padB;
  const maxV = Math.max(1, ...byMonth.flatMap(m => [m.kirim, m.chiqim]));
  const groupW = plotW / 12;
  const barW = Math.min(16, groupW / 3);

  const ticks = 4;
  let grid = "", labels = "";
  for (let i = 0; i <= ticks; i++) {
    const v = maxV / ticks * i;
    const y = padT + plotH - plotH * i / ticks;
    grid += `<line x1="${padL}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="var(--grid)" stroke-width="1"/>`;
    labels += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--text-3)">${shortNum(v)}</text>`;
  }

  let bars = "";
  byMonth.forEach((m, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const hIn = m.kirim / maxV * plotH, hOut = m.chiqim / maxV * plotH;
    bars += `
      <rect x="${cx - barW - 1.5}" y="${padT + plotH - hIn}" width="${barW}" height="${Math.max(hIn, 0)}" rx="4" fill="var(--chart-in)"/>
      <rect x="${cx + 1.5}" y="${padT + plotH - hOut}" width="${barW}" height="${Math.max(hOut, 0)}" rx="4" fill="var(--chart-out)"/>
      <text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--text-3)">${MONTHS_SHORT[i]}</text>
      <rect class="bar-hit" x="${padL + groupW * i}" y="${padT}" width="${groupW}" height="${plotH}"
        onmousemove="chartTip(event,${i},${m.kirim},${m.chiqim})" onmouseleave="hideChartTip()"/>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Oylik kirim va chiqim diagrammasi">
    ${grid}${labels}
    <line x1="${padL}" y1="${padT + plotH}" x2="${W - 10}" y2="${padT + plotH}" stroke="var(--border)" stroke-width="1.5"/>
    ${bars}
  </svg>`;
}
function shortNum(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + " mln";
  if (v >= 1e3) return (v / 1e3).toFixed(0) + " ming";
  return Math.round(v);
}
const tipEl = document.getElementById("chartTip");
function chartTip(e, mi, kirim, chiqim) {
  tipEl.innerHTML = `<div class="t-title">${MONTHS[mi]}</div>
    <div class="t-row"><span class="sw" style="background:var(--chart-in)"></span> Kirim: <b>${fmt(kirim)}</b></div>
    <div class="t-row"><span class="sw" style="background:var(--chart-out)"></span> Chiqim: <b>${fmt(chiqim)}</b></div>`;
  tipEl.classList.remove("hidden");
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  const r = tipEl.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
  tipEl.style.left = x + "px"; tipEl.style.top = y + "px";
}
function hideChartTip() { tipEl.classList.add("hidden"); }

function downloadPDF() {
  const tx = personalTransactions();
  const inPeriod = t => {
    const y = +t.date.slice(0, 4), m = +t.date.slice(5, 7);
    return y === statsYear && (statsMonth === 0 || m === statsMonth);
  };
  const period = tx.filter(inPeriod);
  const kirim = period.filter(t => t.type === "kirim").reduce((s, t) => s + t.amount, 0);
  const chiqim = period.filter(t => t.type === "chiqim").reduce((s, t) => s + t.amount, 0);
  const periodLabel = statsMonth === 0 ? `${statsYear}-yil (yillik)` : `${MONTHS[statsMonth - 1]}, ${statsYear} (oylik)`;

  const inPeriodDate = d => {
    const y = +d.slice(0, 4), m = +d.slice(5, 7);
    return y === statsYear && (statsMonth === 0 || m === statsMonth);
  };
  const teamCollections = S.collections.filter(c => inPeriodDate(c.date));
  const teamGatherings = S.gatherings.filter(g => inPeriodDate(g.date));

  const myDebt = S.debts.filter(d => d.dir === "oldim").reduce((s, d) => s + debtLeft(d), 0);
  const toMe = S.debts.filter(d => d.dir === "berdim").reduce((s, d) => s + debtLeft(d), 0);

  sectionPDF(`Moliyaviy hisobot — ${periodLabel}`, `
    <div class="rep-tiles">
      <div class="rep-tile"><div class="l">Kirim</div><div class="v">${fmt(kirim)} so'm</div></div>
      <div class="rep-tile"><div class="l">Chiqim</div><div class="v">${fmt(chiqim)} so'm</div></div>
      <div class="rep-tile"><div class="l">Saldo</div><div class="v">${fmt(kirim - chiqim)} so'm</div></div>
      <div class="rep-tile"><div class="l">Mening qarzim</div><div class="v">${fmt(myDebt)} so'm</div></div>
      <div class="rep-tile"><div class="l">Menga qarzdorlar</div><div class="v">${fmt(toMe)} so'm</div></div>
    </div>
    <h2>Shaxsiy harakatlar (${period.length} ta)</h2>
    <table>
      <tr><th>Sana</th><th>Kategoriya</th><th>Izoh</th><th>Turi</th><th class="num">Summa (so'm)</th></tr>
      ${period.map(t => `<tr><td>${t.date}</td><td>${esc(t.cat)}</td><td>${esc(t.label)}</td><td>${t.type}</td><td class="num">${fmt(t.amount)}</td></tr>`).join("")
        || `<tr><td colspan="5">Harakatlar yo'q</td></tr>`}
    </table>
    <h2>Jamoaviy hisoblar</h2>
    <table>
      <tr><th>Sana</th><th>Nomi</th><th>Turi</th><th class="num">Summa (so'm)</th><th>Holati</th></tr>
      ${teamCollections.map(c => `<tr><td>${c.date}</td><td>${esc(c.title)}</td><td>Pul yig'ish</td>
        <td class="num">${fmt(c.total)}</td><td>${c.people.filter(p => p.paid).length}/${c.people.length} kishi berdi (yig'ildi: ${fmt(collectionCollected(c))})</td></tr>`).join("")}
      ${teamGatherings.map(g => { const st = settleGathering(g); return `<tr><td>${g.date}</td><td>${esc(g.title)}</td><td>O'tirish</td>
        <td class="num">${fmt(st.total)}</td><td>${g.people.length} kishi, kishi boshiga ${fmt(Math.round(st.share))}</td></tr>`; }).join("")}
      ${!teamCollections.length && !teamGatherings.length ? `<tr><td colspan="5">Jamoaviy hisoblar yo'q</td></tr>` : ""}
    </table>`);
}

/* ================= ISHGA TUSHIRISH ================= */
document.querySelectorAll(".nav-ico").forEach(el => { el.innerHTML = ico(el.dataset.ico); });

(function init() {
  const sid = localStorage.getItem(SESSION_KEY);
  const user = sid ? getUsers().find(u => u.id === sid) : null;
  if (user) enterApp(user);
  else { document.body.classList.add("locked"); renderAuth("login"); }
})();
