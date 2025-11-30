console.log(
  "%c LinkedIn Scraper Extension LOADED",
  "color: blue; font-size: 20px; font-weight: bold;"
);
console.log("Current URL:", window.location.href);

async function scrapeProfile() {
  console.log("Starting profile scrape...");

  const basicInfo = await scrapeBasicInfo();
  const experience = await scrapeExperience();
  const education = await scrapeEducation();
  const skills = await scrapeSkills();
  const projects = await scrapeProjects();
  const publications = await scrapePublications();
  const honors_and_awards = await scrapeHonorsAwards();
  const test_scores = await scrapeTestScores();

  const data = {
    ...basicInfo,
    experience,
    education,
    skills,
    projects,
    publications,
    honors_and_awards,
    test_scores,
    profileUrl: window.location.href,
    scrapedAt: new Date().toISOString(),
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

  // Initialize UI
  if (typeof UI !== "undefined") {
    UI.init();
    UI.setStatus("loading");
  }

  console.log("Initializing scraping...");

  try {
    // Wait for the main profile name to appear
    const nameElement = await waitForElement("h1", 5000);

    if (!nameElement) {
      console.log("Profile name not found after waiting. Aborting.");
      if (typeof UI !== "undefined") UI.setStatus("error");
      return;
    }

    // Wait a bit more for other sections to settle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Attempting to scrape...");
    const data = await scrapeProfile();
    console.log("Scraped Data:", data);

    // Update UI with data for preview
    if (typeof UI !== "undefined") {
      UI.setData(data);
    }

    if (data.name) {
      await sendProfileData(data);
    } else {
      console.log(
        "Could not find profile name. Please ensure you are on a profile page."
      );
      if (typeof UI !== "undefined") UI.setStatus("error");
    }
  } catch (e) {
    console.error("Scraping error:", e);
    if (typeof UI !== "undefined") UI.setStatus("error");
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScraping);
} else {
  initScraping();
}
