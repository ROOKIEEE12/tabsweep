# TabSweep

Tame 50–200 browser tabs. Local-first Chrome extension (Manifest V3, TypeScript).

**Features:** category grouping · duplicate detection (tracking params, `#hash`, `www`, trailing slash ignored) · stale tabs (30d+, via `tab.lastAccessed`) · read-later stack · session save/restore (with tab groups).

**Privacy:** everything stays in `chrome.storage.local`. No network requests, no analytics. Permissions: `tabs`, `tabGroups`, `storage`, `sidePanel`.

## Develop
```
npm install
npm run build        # -> dist/
```
Chrome → `chrome://extensions` → Developer mode → Load unpacked → select `dist/`.

## Publish
`npm run zip` → upload `tabsweep.zip` to the Chrome Web Store dashboard.

## Roadmap
- Similar-tab clustering (local TF-IDF)
- Research brief from selected tabs (opt-in, optional host permissions)
- Link/todo extraction
- Optional Supabase sync
