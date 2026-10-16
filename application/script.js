const $ = (id) => document.getElementById(id);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 3-2 4-4 4zM14 21c3 0 7-1 7-8V5h-7v8h4c0 3-2 4-4 4z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  spark: '<path d="M13 2L3 14h8l-1 8 10-12h-8z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6z"/>',
};
const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

const PRI = [
  { value: "High", label: "High", color: "#f43f5e" },
  { value: "Medium", label: "Medium", color: "#f59e0b" },
  { value: "Low", label: "Low", color: "#14b8a6" },
];
const STA = [
  { value: "Pending", color: "#8b5cf6" },
  { value: "In Progress", color: "#3b82f6" },
  { value: "Completed", color: "#10b981" },
];
const PO = { High: 0, Medium: 1, Low: 2 };
const col = (list, v) => (list.find((x) => x.value === v) || {}).color || "#999";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const S = { tasks: [], filter: "All", sel: null, draft: null, delId: null };

/* ---------- helpers ---------- */
async function api(path, opts) {
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
const JSON_HDR = { "Content-Type": "application/json" };

function toast(msg, isErr) {
  const t = $("toast");
  t.innerHTML = icon(isErr ? "trash" : "check") + esc(msg);
  t.classList.toggle("err", !!isErr);
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2200);
}

function confetti(el) {
  const r = el.getBoundingClientRect();
  const cols = ["#6366f1", "#f472b6", "#2dd4bf", "#fbbf24", "#60a5fa"];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("span");
    s.className = "cf";
    s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${cols[i % 5]}`;
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 100;
    s.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 70}px) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }
    ).onfinish = () => s.remove();
  }
}

function countUp(id, to) {
  const el = $(id), from = +el.textContent || 0, t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / 700, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const emptyHtml = (t, p) => `<div class="empty-in">${icon("inbox")}<b>${t}</b><p>${p}</p></div>`;

function card(t, i, noAnim) {
  return `<article class="tcard" style="--i:${i};--pc:${col(PRI, t.priority)}${noAnim ? ";animation:none" : ""}">
    <div class="tc-top"><span class="tid">${esc(t.id)}</span><span class="badge" style="--bc:${col(STA, t.status)}">${esc(t.status)}</span></div>
    <h3 class="${t.status === "Completed" ? "done" : ""}">${esc(t.title)}</h3>
    <div class="tc-meta"><span><i class="dot" style="background:${col(PRI, t.priority)}"></i>${esc(t.priority)} priority</span><span>${icon("calendar")}${fmtDate(t.createdDate)}</span></div>
  </article>`;
}

/* ---------- custom dropdown ---------- */
function Dropdown(root, cfg) {
  root.classList.add("dd");
  root.innerHTML = '<button type="button" class="dd-btn"><span class="dd-label"></span>' + icon("chevron") + '</button><ul class="dd-menu"></ul>';
  const btn = root.firstChild, label = btn.firstChild, menu = root.lastChild;
  const dd = { value: cfg.value ?? null, options: cfg.options || [] };
  const dot = (o) => (o.color ? `<i class="dot" style="background:${o.color}"></i>` : "");
  function paint() {
    const cur = dd.options.find((o) => o.value === dd.value);
    label.innerHTML = cur ? dot(cur) + esc(cur.label) : `<span class="ph">${esc(cfg.placeholder || "Select")}</span>`;
    menu.innerHTML = dd.options.map((o) => `<li data-v="${esc(o.value)}" class="${o.value === dd.value ? "sel" : ""}">${dot(o)}${esc(o.label)}</li>`).join("") || '<li class="none">No options</li>';
  }
  dd.set = (v, silent) => { dd.value = v; paint(); if (!silent && cfg.onChange) cfg.onChange(v); };
  dd.setOptions = (opts) => { dd.options = opts; if (!opts.some((o) => o.value === dd.value)) dd.value = null; paint(); };
  btn.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll(".dd.open").forEach((d) => d !== root && d.classList.remove("open"));
    root.classList.toggle("open");
  };
  menu.onclick = (e) => {
    const li = e.target.closest("li[data-v]");
    if (!li) return;
    root.classList.remove("open");
    dd.set(li.dataset.v);
  };
  paint();
  return dd;
}
document.addEventListener("click", () => document.querySelectorAll(".dd.open").forEach((d) => d.classList.remove("open")));

/* ---------- components ---------- */
document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

const cPri = Dropdown($("c-pri"), { options: PRI, value: "Medium", onChange: () => renderPreview() });
const uPri = Dropdown($("u-pri"), { options: PRI, onChange: (v) => { if (S.draft) S.draft.priority = v; } });
const rSort = Dropdown($("r-sort"), {
  options: [{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "priority", label: "By priority" }],
  value: "newest",
  onChange: () => renderRead(),
});
const uSel = Dropdown($("u-sel"), { options: [], placeholder: "Choose a task to edit", onChange: (v) => pickTask(v) });

/* ---------- router ---------- */
const VIEWS = ["dashboard", "create", "read", "update", "delete"];
const FLOW = [["create", "Create"], ["read", "View"], ["update", "Update"], ["delete", "Delete"]];

function go() {
  const h = location.hash.slice(1);
  const v = VIEWS.includes(h) ? h : "dashboard";
  VIEWS.forEach((n) => ($("view-" + n).hidden = n !== v));
  document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.view === v));
  const cur = FLOW.findIndex((f) => f[0] === v);
  document.querySelectorAll("[data-steps]").forEach((ol) => {
    ol.innerHTML = FLOW.map((f, i) => `<li class="${i === cur ? "cur" : i < cur ? "done" : ""}"><a href="#${f[0]}"><span class="n">${i < cur ? icon("check") : i + 1}</span>${f[1]}</a></li>`).join("");
  });
  if (v === "dashboard") renderDashboard();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", go);

/* ---------- dashboard ---------- */
function renderDashboard() {
  const t = S.tasks, n = t.length;
  const c = (s) => t.filter((x) => x.status === s).length;
  const p = c("Pending"), i = c("In Progress"), d = c("Completed");
  countUp("st-total", n); countUp("st-pending", p); countUp("st-progress", i); countUp("st-done", d);
  $("lg-p").textContent = p; $("lg-i").textContent = i; $("lg-c").textContent = d;
  $("dn-pct").textContent = (n ? Math.round((d / n) * 100) : 0) + "%";

  const C = 2 * Math.PI * 52;
  let off = 0;
  [["dn-pending", p], ["dn-progress", i], ["dn-done", d]].forEach(([id, v]) => {
    const len = n ? (v / n) * C : 0;
    const el = $(id);
    el.style.strokeDasharray = `${len} ${C - len}`;
    el.style.strokeDashoffset = -off;
    off += len;
  });

  PRI.forEach((pr) => {
    const k = t.filter((x) => x.priority === pr.value).length;
    $("bn-" + pr.value).textContent = k;
    $("bar-" + pr.value).style.width = (n ? (k / n) * 100 : 0) + "%";
  });

  const recent = [...t].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 4);
  $("recent").innerHTML = recent.length
    ? recent.map((x) => `<div class="mini"><i class="dot big" style="background:${col(PRI, x.priority)}"></i><div class="grow"><b>${esc(x.title)}</b><br><small>${esc(x.id)} &middot; ${fmtDate(x.createdDate)}</small></div><span class="badge" style="--bc:${col(STA, x.status)}">${esc(x.status)}</span></div>`).join("")
    : emptyHtml("No tasks yet", "Create your first task to see it here.");
}

/* ---------- create ---------- */
function renderPreview() {
  $("c-prev").innerHTML = card({
    id: "NEW",
    title: $("c-title").value.trim() || "Your task title appears here",
    priority: cPri.value,
    status: "Pending",
    createdDate: new Date().toISOString(),
  }, 0, true);
}
$("c-title").addEventListener("input", renderPreview);

$("c-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const t = await api("/api/tasks", {
      method: "POST",
      headers: JSON_HDR,
      body: JSON.stringify({ title: $("c-title").value, priority: cPri.value, status: "Pending" }),
    });
    $("c-title").value = "";
    renderPreview();
    const ok = $("c-ok");
    ok.hidden = true; void ok.offsetWidth; ok.hidden = false;
    ok.innerHTML = `${icon("check")}<div><b>Task successfully created</b><br>${esc(t.id)} &middot; ${esc(t.title)} &middot; ${esc(t.priority)} &middot; Pending</div>`;
    toast("Task successfully created");
    await loadTasks();
  } catch (err) { toast(err.message, true); }
});

/* ---------- read ---------- */
function visible() {
  const q = $("r-search").value.trim().toLowerCase();
  const out = S.tasks.filter((t) => (S.filter === "All" || t.status === S.filter) && (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)));
  const s = rSort.value;
  out.sort((a, b) => s === "priority" ? PO[a.priority] - PO[b.priority] : s === "oldest" ? a.createdDate.localeCompare(b.createdDate) : b.createdDate.localeCompare(a.createdDate));
  return out;
}

function renderRead() {
  $("r-chips").innerHTML = ["All", "Pending", "In Progress", "Completed"].map((f) => {
    const n = f === "All" ? S.tasks.length : S.tasks.filter((t) => t.status === f).length;
    return `<button class="chip ${f === S.filter ? "on" : ""}" data-f="${f}">${f} &middot; ${n}</button>`;
  }).join("");
  const items = visible();
  $("r-list").innerHTML = items.map((t, i) => card(t, i)).join("");
  $("r-empty").hidden = items.length > 0;
  $("r-empty").innerHTML = emptyHtml("No tasks found", "Create a task first, or change the search and filter.");
}
$("r-chips").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  S.filter = b.dataset.f;
  renderRead();
});
$("r-search").addEventListener("input", renderRead);

$("l-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("l-id").value.trim().toUpperCase();
  if (!id) return;
  try {
    const t = await api("/api/tasks/" + encodeURIComponent(id));
    $("l-res").innerHTML = `<div class="tgrid">${card(t, 0)}</div>`;
  } catch (err) {
    $("l-res").innerHTML = `<p class="note">${esc(err.message)}: no task with ID ${esc(id)}</p>`;
  }
});

/* ---------- update ---------- */
function renderUpdate() {
  uSel.setOptions(S.tasks.map((t) => ({ value: t.id, label: `${t.id} · ${t.title}`, color: col(STA, t.status) })));
  pickTask(S.sel ? S.sel.id : null);
}

function pickTask(id) {
  S.sel = S.tasks.find((t) => t.id === id) || null;
  S.draft = S.sel ? { title: S.sel.title, priority: S.sel.priority, status: S.sel.status } : null;
  uSel.set(S.sel ? S.sel.id : null, true);
  const t = S.sel;
  $("u-editor").hidden = !t;
  $("u-empty").hidden = !!t;
  $("u-empty").innerHTML = emptyHtml("No task selected", "Choose a task from the dropdown to edit it.");
  if (!t) return;
  $("u-id").textContent = t.id;
  $("u-title").value = S.draft.title;
  uPri.set(S.draft.priority, true);
  paintTrack();
}

function paintTrack() {
  const idx = STA.findIndex((s) => s.value === S.draft.status);
  document.querySelectorAll(".stp").forEach((b, i) => {
    b.classList.toggle("on", i <= idx);
    b.classList.toggle("cur", i === idx);
  });
  $("track-fill").style.width = `calc((100% - 90px) * ${idx / 2})`;
  const b = (s) => `<span class="badge" style="--bc:${col(STA, s)}">${s}</span>`;
  $("u-diff").innerHTML = `<span>Status change</span>${b(S.sel.status)}${icon("arrow")}${b(S.draft.status)}`;
}

document.querySelector(".track").addEventListener("click", (e) => {
  const b = e.target.closest(".stp");
  if (!b || !S.draft) return;
  S.draft.status = b.dataset.s;
  paintTrack();
});
$("u-title").addEventListener("input", (e) => { if (S.draft) S.draft.title = e.target.value; });

$("u-save").addEventListener("click", async () => {
  if (!S.sel) return;
  const d = S.draft, was = S.sel.status;
  if (!d.title.trim()) return toast("Title cannot be empty", true);
  try {
    await api("/api/tasks/" + S.sel.id, { method: "PUT", headers: JSON_HDR, body: JSON.stringify(d) });
    toast(d.status !== was ? "Status changed successfully" : "Task updated successfully");
    if (d.status === "Completed" && was !== "Completed") confetti($("u-save"));
    await loadTasks();
  } catch (err) { toast(err.message, true); }
});

/* ---------- delete ---------- */
function renderDelete() {
  $("d-list").innerHTML = S.tasks.map((t, i) => `
    <div class="drow" style="--i:${i}" data-id="${esc(t.id)}">
      <i class="dot big" style="background:${col(PRI, t.priority)}"></i>
      <div class="grow"><h3>${esc(t.title)}</h3><small>${esc(t.id)} &middot; ${esc(t.priority)} priority</small></div>
      <span class="badge" style="--bc:${col(STA, t.status)}">${esc(t.status)}</span>
      <button class="del" data-id="${esc(t.id)}" aria-label="Delete task">${icon("trash")}</button>
    </div>`).join("");
  $("d-empty").hidden = S.tasks.length > 0;
  $("d-empty").innerHTML = emptyHtml("Nothing to delete", "All tasks are already removed.");
}

const closeModal = () => $("modal").classList.remove("show");
$("d-list").addEventListener("click", (e) => {
  const b = e.target.closest(".del");
  if (!b) return;
  const t = S.tasks.find((x) => x.id === b.dataset.id);
  S.delId = t.id;
  $("m-text").textContent = `${t.id} · ${t.title}`;
  $("modal").classList.add("show");
});
$("m-no").addEventListener("click", closeModal);
$("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

$("m-yes").addEventListener("click", async () => {
  const id = S.delId;
  closeModal();
  try {
    await api("/api/tasks/" + id, { method: "DELETE" });
    const row = document.querySelector(`.drow[data-id="${id}"]`);
    if (row) { row.classList.add("out"); await new Promise((r) => setTimeout(r, 350)); }
    if (S.sel && S.sel.id === id) S.sel = null;
    toast("Task removed successfully");
    await loadTasks();
  } catch (err) { toast(err.message, true); }
});

/* ---------- data + init ---------- */
function renderAll() { renderDashboard(); renderRead(); renderUpdate(); renderDelete(); }

async function loadTasks() {
  try { S.tasks = await api("/api/tasks"); } catch (err) { toast(err.message, true); }
  renderAll();
}

// typing effect on dashboard heading
(function typer() {
  const words = ["organise", "track", "update", "finish"], el = $("rotator");
  let w = 0, i = 0, del = false;
  function tick() {
    const word = words[w];
    el.textContent = word.slice(0, i);
    if (!del && i === word.length) { del = true; return setTimeout(tick, 1300); }
    if (del && i === 0) { del = false; w = (w + 1) % words.length; }
    i += del ? -1 : 1;
    setTimeout(tick, del ? 45 : 95);
  }
  tick();
})();

// rotating quotes
(function quotes() {
  const Q = [
    "Small steps every day beat big plans someday.",
    "Done is better than perfect.",
    "Focus on progress, not perfection.",
    "One task at a time. One win at a time.",
    "Your future self will thank you for starting today.",
    "Clear tasks, clear mind.",
  ];
  const el = $("q-text");
  let n = 0;
  el.textContent = Q[0];
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => { n = (n + 1) % Q.length; el.textContent = Q[n]; el.style.opacity = 1; }, 400);
  }, 7000);
})();

renderPreview();
go();
loadTasks();