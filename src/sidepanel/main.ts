import { normalizeUrl } from "../lib/normalize";
import { categorize, CATEGORY_COLORS, type Category } from "../lib/categorize";
import { getSessions, saveSessions, getReadLater, saveReadLater, type Session } from "../lib/store";

const STALE_DAYS = 30;
const DAY = 86_400_000;
const app = document.getElementById("app")!;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, any> = {}, ...kids: (Node | string)[]) {
  const el = document.createElement(tag);
  const { class: cls, ...rest } = props;
  if (cls) el.className = cls;
  Object.assign(el, rest);
  el.append(...kids);
  return el;
}

const isHttp = (t: chrome.tabs.Tab) => !!t.url && /^https?:/.test(t.url);
const last = (t: chrome.tabs.Tab) => (t as any).lastAccessed as number | undefined;
const bucket = <K, V>(m: Map<K, V[]>, k: K) => m.get(k) ?? m.set(k, []).get(k)!;

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
  tabs.filter((t) => isHttp(t) && !t.pinned && !t.active && last(t) && Date.now() - last(t)! > STALE_DAYS * DAY);

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

const row = (title: string, sub: string, ...actions: HTMLElement[]) =>
  h("div", { class: "row" },
    h("span", { class: "t", title }, title),
    h("small", {}, sub),
    ...actions
  );

async function render() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const dupes = findDuplicates(tabs), stale = findStale(tabs);
  const sessions = await getSessions(), later = await getReadLater();
  const counts = new Map<Category, number>();
  for (const t of tabs.filter(isHttp)) { const c = categorize(t.url!); counts.set(c, (counts.get(c) ?? 0) + 1); }

  const nameIn = h("input", { type: "text", placeholder: "Session name (optional)" });
  const act = (fn: () => Promise<unknown>) => async () => { await fn(); render(); };

  // Category pills
  const pills = [...counts].map(([c, n]) => h("span", { class: "pill" }, `${c} ${n}`));

  app.replaceChildren(
    // Header
    h("div", { class: "header" },
      h("div", { class: "header-icon" }, "🧹"),
      h("h1", {}, "TabSweep")
    ),

    // Stats
    h("div", { class: "stats" },
      h("div", { class: "stat" }, h("b", {}, String(tabs.length)), h("span", {}, "Tabs")),
      h("div", { class: "stat" }, h("b", {}, String(dupes.length)), h("span", {}, "Dupes")),
      h("div", { class: "stat" }, h("b", {}, String(stale.length)), h("span", {}, `Stale ${STALE_DAYS}d+`))
    ),

    // Clean up
    h("h2", {}, "Clean Up"),
    h("div", { class: "action-row" },
      h("button", { class: "primary", disabled: !dupes.length, onclick: act(() => chrome.tabs.remove(dupes.map((t) => t.id!))) }, `✕ Close ${dupes.length} duplicates`),
      h("button", { onclick: act(() => groupByCategory(tabs)) }, "⬡ Group by category")
    ),

    // Category pills
    ...(pills.length ? [h("div", { class: "category-pills" }, ...pills)] : []),

    // Stale Tabs
    h("h2", {}, `Stale Tabs (${stale.length})`),
    ...(stale.length
      ? stale.slice(0, 15).map((t) => row(
          t.title ?? t.url!,
          `${Math.floor((Date.now() - last(t)!) / DAY)}d ago`,
          h("button", { class: "sm", onclick: act(async () => { await saveReadLater([{ url: t.url!, title: t.title ?? t.url!, addedAt: Date.now() }, ...later]); await chrome.tabs.remove(t.id!); }) }, "📌"),
          h("button", { class: "sm danger", onclick: act(() => chrome.tabs.remove(t.id!)) }, "✕")
        ))
      : [h("div", { class: "empty" }, "✨ No stale tabs — nice!")]),

    // Sessions
    h("h2", {}, "Sessions"),
    h("div", { class: "session-input-row" },
      nameIn,
      h("button", { class: "primary", onclick: act(() => saveSession(tabs, nameIn.value.trim())) }, "💾 Save")
    ),
    ...(sessions.length
      ? sessions.map((s) => row(
          s.name,
          `${s.tabs.length} tabs`,
          h("button", { class: "sm", onclick: () => restoreSession(s) }, "▶ Open"),
          h("button", { class: "sm danger icon-btn", onclick: act(() => saveSessions(sessions.filter((x) => x.id !== s.id))) }, "✕")
        ))
      : [h("div", { class: "empty" }, "No saved sessions yet.")]),

    // Read Later
    h("h2", {}, `Read Later (${later.length})`),
    ...(later.length
      ? later.map((r) => row(
          r.title,
          new URL(r.url).hostname,
          h("button", { class: "sm", onclick: act(async () => { await chrome.tabs.create({ url: r.url }); await saveReadLater(later.filter((x) => x.url !== r.url)); }) }, "↗ Open"),
          h("button", { class: "sm danger icon-btn", onclick: act(() => saveReadLater(later.filter((x) => x.url !== r.url))) }, "✕")
        ))
      : [h("div", { class: "empty" }, "Nothing saved yet.")])
  );
}

render();
let timer: number | undefined;
const refresh = () => { clearTimeout(timer); timer = window.setTimeout(render, 300); };
chrome.tabs.onCreated.addListener(refresh);
chrome.tabs.onRemoved.addListener(refresh);
chrome.tabs.onUpdated.addListener(refresh);
