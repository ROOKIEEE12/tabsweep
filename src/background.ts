import { categorize, CATEGORY_COLORS } from "./lib/categorize";

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

const isHttp = (url?: string) => !!url && /^https?:/.test(url);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && isHttp(changeInfo.url) && !tab.pinned) {
    try {
      const cat = categorize(changeInfo.url);
      const groups = await chrome.tabGroups.query({ windowId: tab.windowId, title: cat });
      
      if (groups.length > 0) {
        if (tab.groupId !== groups[0].id) {
          await chrome.tabs.group({ tabIds: tabId, groupId: groups[0].id });
        }
      } else {
        const gid = await chrome.tabs.group({ tabIds: tabId, createProperties: { windowId: tab.windowId } });
        await chrome.tabGroups.update(gid, { title: cat, color: CATEGORY_COLORS[cat] });
      }
    } catch (err) {
      console.error("Auto-categorize failed:", err);
    }
  }
});
