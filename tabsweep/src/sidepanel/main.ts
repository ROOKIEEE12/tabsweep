import { normalizeUrl } from "../lib/normalize";
import { categorize, CATEGORY_COLORS, type Category } from "../lib/categorize";
import { getSessions, saveSessions, getReadLater, saveReadLater, type Session } from "../lib/store";

const STALE_DAYS = 30;
const DAY = 86_400_000;
const app = document.getElementById("app")!;

type View = "stale" | "sessions" | "later";
let view: View = "stale";
let sessionDraft = "";
let busy = false;

// Same hex values Chrome uses for tab-group colors, so the bar matches the real groups.
const GROUP_HEX: Record<chrome.tabGroups.ColorEnum, string> = {
  grey: "#5f6368", blue: "#1a73e8", red: "#d93025", yellow: "#f9ab00", green: "#188038",
  pink: "#d01884", purple: "#a142f4", cyan: "#007b83", orange: "#fa903e",
};

const ICONS = {
  broom: '<path d="m13 11 9-9"/><path d="M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2Z"/><path d="m6.8 10.4 6.8 6.8"/><path d="m5 17 1.5 1.5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  open: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};
type IconName = keyof typeof ICONS;

function icon(name: IconName, size = 16) {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return span;
}

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, any> = {}, ...kids: (Node | string | null | false)[]) {
  const el = document.createElement(tag);
  const { class: cls, attrs, ...rest } = props;
  if (cls) el.className = cls;
  if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  Object.assign(el, rest);
  el.append(...(kids.filter(Boolean) as (Node | string)[]));
  return el;
}

const isHttp = (t: chrome.tabs.Tab) => !!t.url && /^https?:/.test(t.url);
const last = (t: chrome.tabs.Tab) => (t as any).lastAccessed as number | undefined;
const bucket = <K, V>(m: Map<K, V[]>, k: K) => m.get(k) ?? m.set(k, []).get(k)!;
const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function timeAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / DAY);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function findDuplicates(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  const groups = new Map<string, chrome.tabs.Tab[]>();
  for (const t of tabs.filter(isHttp)) bucket(groups, normalizeUrl(t.url!)).push(t);
  const extra: chrome.tabs.Tab[] = [];
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.active) - Number(a.active) || (last(b) ?? 0) - (last(a) ?? 0));
    extra.push(...g.slice(1).filter((t) => !t.pinned && !t.active));
  }
  return extra;
}

const findStale = (tabs: chrome.tabs.Tab[]) =>
  tabs
    .filter((t) => isHttp(t) && !t.pinned && !t.active && last(t) && Date.now() - last(t)! > STALE_DAYS * DAY)
    .sort((a, b) => (last(a) ?? 0) - (last(b) ?? 0));

async function groupByCategory(tabs: chrome.tabs.Tab[]) {
  const buckets = new Map<Category, number[]>();
  for (const t of tabs.filter((t) => isHttp(t) && !t.pinned && t.id != null)) bucket(buckets, categorize(t.url!)).push(t.id!);
  for (const [cat, ids] of buckets) {
    const gid = await chrome.tabs.group({ tabIds: ids });
    await chrome.tabGroups.update(gid, { title: `${cat} (${ids.length})`, color: CATEGORY_COLORS[cat] });
  }
}

async function saveSession(tabs: chrome.tabs.Tab[], name: string) {
  const groups = tabs[0] ? await chrome.tabGroups.query({ windowId: tabs[0].windowId }) : [];
  const title = new Map(groups.map((g) => [g.id, g.title ?? ""]));
  const s: Session = {
    id: crypto.randomUUID(), name: name || new Date().toLocaleString(), createdAt: Date.now(),
    tabs: tabs.filter(isHttp).map((t) => ({ url: t.url!, title: t.title ?? t.url!, pinned: !!t.pinned, group: title.get(t.groupId) || undefined })),
  };
  await saveSessions([s, ...(await getSessions())]);
}

async function restoreSession(s: Session) {
  if (!s.tabs.length) return;
  const win = await chrome.windows.create({ url: s.tabs[0].url });
  const byGroup = new Map<string, number[]>();
  for (const [i, st] of s.tabs.entries()) {
    const tab = i === 0 ? win.tabs![0] : await chrome.tabs.create({ windowId: win.id, url: st.url, pinned: st.pinned, active: false });
    if (i === 0 && st.pinned) await chrome.tabs.update(tab.id!, { pinned: true });
    if (st.group) bucket(byGroup, st.group).push(tab.id!);
  }
  for (const [name, ids] of byGroup) {
    const gid = await chrome.tabs.group({ tabIds: ids, createProperties: { windowId: win.id } });
    await chrome.tabGroups.update(gid, { title: name });
  }
}

const act = (fn: () => Promise<unknown>) => async () => {
  if (busy) return;
  busy = true;
  try { await fn(); } finally { busy = false; render(); }
};

function favicon(src: string | undefined, label: string) {
  const fallback = h("span", { class: "fav fav-letter" }, (hostOf(label)[0] ?? "?").toUpperCase());
  if (!src || !/^https?:|^data:/.test(src)) return fallback;
  const img = h("img", { class: "fav", src, alt: "", width: 16, height: 16, loading: "lazy" });
  img.onerror = () => img.replaceWith(fallback);
  return img;
}

function iconButton(name: IconName, label: string, onclick: () => void, variant = "") {
  return h("button", { class: `icon-btn ${variant}`.trim(), title: label, onclick, attrs: { "aria-label": label } }, icon(name, 14));
}

function item(opts: { title: string; sub: string; meta?: string; fav: Node; actions: HTMLElement[]; onOpen?: () => void }) {
  const main = h("div", { class: "item-main" },
    h("span", { class: "item-title", title: opts.title }, opts.title),
    h("span", { class: "item-sub" }, opts.sub, opts.meta ? h("span", { class: "dot", attrs: { "aria-hidden": "true" } }, "·") : null, opts.meta ?? ""),
  );
  return h("li", { class: "item" },
    opts.fav,
    opts.onOpen ? h("button", { class: "item-link", onclick: opts.onOpen, title: opts.title }, main) : main,
    h("div", { class: "item-actions" }, ...opts.actions),
  );
}

function empty(iconName: IconName, title: string, text: string) {
  return h("div", { class: "empty" },
    h("div", { class: "empty-icon" }, icon(iconName, 18)),
    h("p", { class: "empty-title" }, title),
    h("p", { class: "empty-text" }, text),
  );
}

function breakdown(counts: Map<Category, number>, total: number) {
  const entries = [...counts].sort((a, b) => b[1] - a[1]);
  if (!total) return null;
  return h("div", { class: "breakdown" },
    h("div", { class: "bar", attrs: { role: "img", "aria-label": entries.map(([c, n]) => `${c} ${n}`).join(", ") } },
      ...entries.map(([c, n]) => h("span", { style: `flex:${n};background:${GROUP_HEX[CATEGORY_COLORS[c]]}`, title: `${c}: ${n}` })),
    ),
    h("ul", { class: "legend" },
      ...entries.map(([c, n]) => h("li", {},
        h("span", { class: "swatch", style: `background:${GROUP_HEX[CATEGORY_COLORS[c]]}` }),
        c, h("span", { class: "legend-n" }, String(n)),
      )),
    ),
  );
}

async function render() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const dupes = findDuplicates(tabs), stale = findStale(tabs);
  const sessions = await getSessions(), later = await getReadLater();
  const web = tabs.filter(isHttp);
  const counts = new Map<Category, number>();
  for (const t of web) { const c = categorize(t.url!); counts.set(c, (counts.get(c) ?? 0) + 1); }

  const setView = (v: View) => () => { view = v; render(); };

  const summary = h("section", { class: "card summary", attrs: { "aria-label": "Window overview" } },
    h("div", { class: "summary-top" },
      h("div", {},
        h("p", { class: "summary-n" }, String(tabs.length)),
        h("p", { class: "summary-label" }, "open tabs in this window"),
      ),
      h("dl", { class: "summary-stats" },
        h("div", { class: dupes.length ? "warn" : "" }, h("dt", {}, "Duplicates"), h("dd", {}, String(dupes.length))),
        h("div", { class: stale.length ? "warn" : "" }, h("dt", {}, `Stale ${STALE_DAYS}d+`), h("dd", {}, String(stale.length))),
      ),
    ),
    breakdown(counts, web.length),
  );

  const actions = h("section", { class: "actions", attrs: { "aria-label": "Quick actions" } },
    h("button", { class: "action primary", disabled: !dupes.length, onclick: act(() => chrome.tabs.remove(dupes.map((t) => t.id!))) },
      icon("copy"),
      h("span", { class: "action-text" },
        h("span", { class: "action-title" }, dupes.length ? `Close ${plural(dupes.length, "duplicate")}` : "No duplicates"),
        h("span", { class: "action-sub" }, "Keeps pinned & active tabs"),
      ),
    ),
    h("button", { class: "action", disabled: !web.length, onclick: act(() => groupByCategory(tabs)) },
      icon("layers"),
      h("span", { class: "action-text" },
        h("span", { class: "action-title" }, "Group by category"),
        h("span", { class: "action-sub" }, `${counts.size} ${counts.size === 1 ? "group" : "groups"}`),
      ),
    ),
  );

  const tabDefs: [View, string, number][] = [["stale", "Stale", stale.length], ["sessions", "Sessions", sessions.length], ["later", "Read later", later.length]];
  const segmented = h("div", { class: "segmented", attrs: { role: "tablist", "aria-label": "Lists" } },
    ...tabDefs.map(([v, label, n]) => h("button", {
      class: view === v ? "seg active" : "seg", onclick: setView(v),
      attrs: { role: "tab", "aria-selected": view === v, id: `tab-${v}`, "aria-controls": "panel" },
    }, label, h("span", { class: "seg-n" }, String(n)))),
  );

  let panel: HTMLElement;
  if (view === "stale") {
    panel = h("div", {},
      stale.length > 1 ? h("div", { class: "panel-head" },
        h("p", {}, `Not opened in ${STALE_DAYS}+ days`),
        h("button", { class: "text-btn danger", onclick: act(() => chrome.tabs.remove(stale.map((t) => t.id!))) }, `Close all ${stale.length}`),
      ) : null,
      stale.length
        ? h("ul", { class: "list" }, ...stale.slice(0, 30).map((t) => item({
            title: t.title || t.url!, sub: hostOf(t.url!), meta: timeAgo(last(t)!), fav: favicon(t.favIconUrl, t.url!),
            onOpen: () => chrome.tabs.update(t.id!, { active: true }),
            actions: [
              iconButton("bookmark", "Save to read later and close", act(async () => {
                await saveReadLater([{ url: t.url!, title: t.title ?? t.url!, addedAt: Date.now() }, ...later.filter((x) => x.url !== t.url)]);
                await chrome.tabs.remove(t.id!);
              })),
              iconButton("x", "Close tab", act(() => chrome.tabs.remove(t.id!)), "danger"),
            ],
          })))
        : empty("check", "All fresh", `No tabs untouched for ${STALE_DAYS}+ days.`),
    );
  } else if (view === "sessions") {
    const input = h("input", {
      type: "text", placeholder: "Name this session…", value: sessionDraft,
      attrs: { "aria-label": "Session name" },
      oninput: (e: Event) => { sessionDraft = (e.target as HTMLInputElement).value; },
    });
    const save = act(async () => { await saveSession(tabs, sessionDraft.trim()); sessionDraft = ""; });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) save();
    });
    panel = h("div", {},
      h("div", { class: "input-row" }, input,
        h("button", { class: "btn primary", disabled: !web.length, onclick: save }, icon("plus", 14), "Save"),
      ),
      sessions.length
        ? h("ul", { class: "list" }, ...sessions.map((s) => item({
            title: s.name, sub: plural(s.tabs.length, "tab"), meta: timeAgo(s.createdAt),
            fav: h("span", { class: "fav fav-icon" }, icon("folder", 14)),
            onOpen: () => restoreSession(s),
            actions: [
              iconButton("play", "Restore in new window", () => restoreSession(s)),
              iconButton("x", "Delete session", act(() => saveSessions(sessions.filter((x) => x.id !== s.id))), "danger"),
            ],
          })))
        : empty("folder", "No sessions yet", "Save this window to reopen it later, tab groups included."),
    );
  } else {
    const openLater = (url: string) => act(async () => { await chrome.tabs.create({ url }); await saveReadLater(later.filter((x) => x.url !== url)); });
    panel = later.length
      ? h("ul", { class: "list" }, ...later.map((r) => item({
          title: r.title, sub: hostOf(r.url), meta: timeAgo(r.addedAt), fav: favicon(undefined, r.url),
          onOpen: openLater(r.url),
          actions: [
            iconButton("open", "Open and remove from list", openLater(r.url)),
            iconButton("x", "Remove", act(() => saveReadLater(later.filter((x) => x.url !== r.url))), "danger"),
          ],
        })))
      : empty("bookmark", "Nothing saved", "Use the bookmark icon on a stale tab to park it here.");
  }

  const hadFocus = document.activeElement?.tagName === "INPUT";
  app.replaceChildren(
    h("header", { class: "header" },
      h("div", { class: "brand" },
        h("span", { class: "logo" }, icon("broom", 16)),
        h("h1", {}, "TabSweep"),
      ),
    ),
    h("main", { class: "content" },
      summary,
      actions,
      h("section", { class: "lists" }, segmented, h("div", { id: "panel", class: "panel", attrs: { role: "tabpanel", "aria-labelledby": `tab-${view}` } }, panel)),
    ),
    h("footer", { class: "footer" }, icon("lock", 12), "Local-first. Nothing leaves your browser."),
  );
  if (hadFocus) (app.querySelector("input") as HTMLInputElement | null)?.focus();
}

render();
let timer: number | undefined;
const refresh = () => { clearTimeout(timer); timer = window.setTimeout(render, 300); };
chrome.tabs.onCreated.addListener(refresh);
chrome.tabs.onRemoved.addListener(refresh);
chrome.tabs.onUpdated.addListener(refresh);
