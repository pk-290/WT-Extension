console.log("%c LinkedIn Scraper Background Worker STARTED", "color: green; font-size: 16px; font-weight: bold;");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only trigger if the URL explicitly changed (SPA navigation)
    // We avoid checking for 'status === complete' because that fires on refresh/load, 
    // which conflicts with the content script's auto-run logic.
    if (changeInfo.url && tab.url.includes('linkedin.com/in/')) {
        console.log("LinkedIn profile navigation detected:", tab.url);
        chrome.tabs.sendMessage(tabId, { action: "scrape_profile", url: tab.url })
            .catch(err => console.log("Could not send message (tab might be loading/unloading):", err));
    }
});
