console.log("%c LinkedIn Scraper Extension LOADED", "color: blue; font-size: 20px; font-weight: bold;");
console.log("Current URL:", window.location.href);

function scrapeProfile() {
    console.log("Starting profile scrape...");

    const basicInfo = scrapeBasicInfo();
    const experience = scrapeExperience();
    const education = scrapeEducation();
    const skills = scrapeSkills();

    const data = {
        ...basicInfo,
        experience,
        education,
        skills,
        profileUrl: window.location.href,
        scrapedAt: new Date().toISOString()
    };

    return data;
}

let isScraping = false;

async function initScraping() {
    if (isScraping) {
        console.log("Scraping already in progress, skipping duplicate trigger...");
        return;
    }
    isScraping = true;

    console.log("Initializing scraping...");

    try {
        // Wait for the main profile name to appear
        const nameElement = await waitForElement('h1', 5000);

        if (!nameElement) {
            console.log("Profile name not found after waiting. Aborting.");
            return;
        }

        // Wait a bit more for other sections to settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        await expandDetails();

        console.log("Attempting to scrape...");
        const data = scrapeProfile();
        console.log("Scraped Data:", data);

        if (data.name) {
            downloadData(data);
        } else {
            console.log("Could not find profile name. Please ensure you are on a profile page.");
        }
    } finally {
        // Reset flag after a cooldown
        setTimeout(() => {
            isScraping = false;
        }, 2000);
    }
}

// Listen for messages from background script (SPA navigation)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape_profile") {
        console.log("Received scrape request from background script");
        initScraping();
    }
});

// Also run on initial load (in case of refresh)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScraping);
} else {
    initScraping();
}
