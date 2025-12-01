console.log("%c LinkedIn Scraper Background Worker STARTED", "color: green; font-size: 16px; font-weight: bold;");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only trigger if the URL explicitly changed (SPA navigation)
    // We avoid checking for 'status === complete' because that fires on refresh/load, 
    // which conflicts with the content script's auto-run logic.
    const u = new URL(tab.url);
    const path = u.pathname.replace(/\/+$/, "");
    //console.log(path);
    const profileRegex = /^\/in\/[a-zA-Z0-9-_%]+$/;
    if (changeInfo.url && u.hostname.includes("linkedin.com") && profileRegex.test(path)) {
        console.log("LinkedIn profile navigation detected:", tab.url);
        chrome.tabs.sendMessage(tabId, { action: "scrape_profile", url: tab.url })
            .catch(err => console.log("Could not send message (tab might be loading/unloading):", err));
    }
});
