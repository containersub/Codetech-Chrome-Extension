// background.js
let activeTabId, startTime;

chrome.tabs.onActivated.addListener(activeInfo => {
  activeTabId = activeInfo.tabId;
  startTracking();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (tabId === activeTabId && changeInfo.url) {
    startTracking();
  }
});

function startTracking() {
  chrome.tabs.get(activeTabId, tab => {
    if (tab.url) {
      startTime = Date.now();
      chrome.storage.local.get(['timeData'], result => {
        const domain = new URL(tab.url).hostname;
        const timeData = result.timeData || {};
        timeData[domain] = (timeData[domain] || 0) + 1;
        chrome.storage.local.set({ timeData });
      });
    }
  });
}