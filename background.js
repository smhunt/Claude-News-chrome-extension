// Background service worker for Claude Code Digest

// Allow opening side panel on action click (optional - can use popup OR side panel)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Listen for messages to open side panel or pop-out window
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSidePanel") {
    chrome.sidePanel.open({ windowId: sender.tab?.windowId });
    sendResponse({ success: true });
  }

  if (message.action === "openPopout") {
    chrome.windows.create({
      url: chrome.runtime.getURL("panel.html"),
      type: "popup",
      width: 420,
      height: 700,
      focused: true
    });
    sendResponse({ success: true });
  }

  return true;
});

// Context menu to open side panel
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSidePanel",
    title: "Open Claude Digest in Side Panel",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "openPopout",
    title: "Open Claude Digest in Window",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
  if (info.menuItemId === "openPopout") {
    chrome.windows.create({
      url: chrome.runtime.getURL("panel.html"),
      type: "popup",
      width: 420,
      height: 700,
      focused: true
    });
  }
});
