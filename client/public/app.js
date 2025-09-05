// CONFIG
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function fetchAssignments() {
  const res = await fetch("/api", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load assignments");
  return (await res.json()).items || [];
}

function fmtDiff(iso){
  const t=new Date(iso).getTime(), now=Date.now(), ms=t-now, od=ms<0, a=Math.abs(ms);
  const s=Math.floor(a/1000), d=Math.floor(s/86400), h=Math.floor((s%86400)/3600),
        m=Math.floor((s%3600)/60), sec=s%60, pad=n=>String(n).padStart(2,"0");
  return { overdue:od, hoursLeft:Math.floor(a/3_600_000), text:`${d}d ${pad(h)}h ${pad(m)}m ${pad(sec)}s` };
}

function fmtWhen(iso){
  const d=new Date(iso);
  return new Intl.DateTimeFormat(undefined,{weekday:"short",year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(d);
}

function keepItem(item) {
  const due = new Date(item.dueDate).getTime();
  return (Date.now() - due) < ONE_DAY_MS;
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function hasRealLink(it) {
  const s = (it.link || "").trim();
  return s && s.toUpperCase() !== "NONE";
}

function hasRealLink(it) {
  const s = (it.link || "").trim();
  return s !== "" && s.toUpperCase() !== "NONE";
}

function cardHTML(it){
  const diff = fmtDiff(it.dueDate);
  let tone = "text-emerald-700 dark:text-emerald-300";
  if (diff.overdue || diff.hoursLeft <= 24) tone = "text-red-600 dark:text-red-400";
  else if (diff.hoursLeft <= 72) tone = "text-amber-600 dark:text-amber-300";

  const showLink = hasRealLink(it);
  const safeLink = esc((it.link || "").trim());

  return `
    <article class="rounded-2xl border p-4 shadow-sm bg-white/70 dark:bg-zinc-900/60 backdrop-blur"
            data-id="${it.id}" data-due="${it.dueDate}">
      <div>
        <h3 class="text-lg font-semibold leading-tight">${esc(it.title)}</h3>
        <div class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">${esc(it.course || "—")}</div>
      </div>
      <div class="mt-3 text-2xl md:text-3xl font-bold tabular-nums ${tone}" data-role="countdown">
        ${diff.overdue ? "Overdue " : ""}${diff.text}
      </div>
      <div class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Due: ${fmtWhen(it.dueDate)}</div>
      ${showLink ? `<a class="mt-3 inline-block text-sm underline decoration-dotted text-blue-700 dark:text-blue-300"
                      href="${safeLink}" target="_blank" rel="noreferrer">Open in Canvas</a>` : ""}
    </article>
  `;
}

function render(items){
  const root = document.getElementById("cards");
  const filtered = items.filter(keepItem);
  if (!filtered.length) {
    root.innerHTML = `<p class="text-zinc-600 dark:text-zinc-300">No assignments.</p>`;
    return;
  }
  root.innerHTML = filtered.map(cardHTML).join("");
}

function tick(){
  const now = Date.now();
  const cardsRoot = document.getElementById("cards");

  document.querySelectorAll("[data-due]").forEach(el=>{
    const iso = el.getAttribute("data-due");
    const due = new Date(iso).getTime();

    // remove if ≥1 day overdue
    if ((now - due) >= ONE_DAY_MS) {
      el.remove();
      return;
    }

    const cd = el.querySelector("[data-role='countdown']");
    const diff = fmtDiff(iso);
    let tone="text-emerald-700 dark:text-emerald-300";
    if (diff.overdue || diff.hoursLeft <= 24) tone="text-red-600 dark:text-red-400";
    else if (diff.hoursLeft <= 72) tone="text-amber-600 dark:text-amber-300";
    cd.className = `mt-3 text-2xl md:text-3xl font-bold tabular-nums ${tone}`;
    cd.textContent = (diff.overdue ? "Overdue " : "") + diff.text;
  });

  if (!cardsRoot.querySelector("[data-due]")) {
    cardsRoot.innerHTML = `<p class="text-zinc-600 dark:text-zinc-300">No assignments.</p>`;
  }
}

(async function init(){
  try{ const items=await fetchAssignments(); render(items); setInterval(tick,1000); }
  catch(e){ document.getElementById("cards").innerHTML=`<div class="text-red-600 dark:text-red-400">Failed to load.</div>`; console.error(e); }
})();
