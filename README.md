# TabSweep

**Tame your browser tabs.** A lightweight, local-first Chrome extension built to group, de-duplicate, and tidy up hundreds of tabs in seconds. Built with Manifest V3 and TypeScript.

---

## Features

- **Auto-Categorization**: Intelligently groups your open tabs into logical categories (e.g., Work, Social, Reading, Shopping) so you can focus on what matters.
- **Duplicate Detection**: Finds and removes duplicate tabs even if they have different tracking parameters (e.g., `utm_source`, `fbclid`), URL fragments (`#hash`), or trailing slashes.
- **Stale Tabs Cleanup**: Identifies tabs you haven't looked at in a while (e.g., 30+ days inactive using `tab.lastAccessed`) to help you declutter your workspace.
- **Read-Later Stack**: Save tabs for later without keeping them open, reducing memory usage and visual noise.
- **Session Management**: Save your current window's tabs as a session and restore them later—complete with tab groups intact.

## Privacy First

Your data is yours. **TabSweep is 100% local.**
- Everything is stored using `chrome.storage.local`.
- **Zero** network requests sent to external servers.
- **Zero** analytics or tracking.
- Required Permissions: `tabs`, `tabGroups`, `storage`, `sidePanel`.

## Tech Stack

- **Extension Framework:** Manifest V3
- **Language:** TypeScript
- **Bundler:** ESBuild
- **UI:** Vanilla HTML/CSS/JS (Lightweight Side Panel)

## Getting Started

### Installation (Developer Mode)

1. Clone or download this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the `dist/` directory generated from the build step.

### Available Scripts

- `npm run build`: Compiles TypeScript and bundles files using ESBuild into the `dist/` folder.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.
- `npm run zip`: Builds the project and creates a `tabsweep.zip` file, ready for publishing to the Chrome Web Store.

## Roadmap

- [ ] **Similar-tab clustering**: Local TF-IDF to group logically similar tabs.
- [ ] **Research briefs**: Generate summaries from selected tabs (opt-in feature).
- [ ] **Link/Todo extraction**: Automatically extract actionable items from tabs.
- [ ] **Optional Cloud Sync**: Opt-in Supabase sync to share sessions across devices.

---

*Made to keep your browser light and your mind clear.*
