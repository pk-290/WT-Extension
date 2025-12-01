// Dynamic waiting helper
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function getSectionContent(anchorId) {
  const anchor = document.getElementById(anchorId);
  if (!anchor) return null;
  console.log("found the anchor:", anchorId);
  // Navigate up to the section container
  let container = anchor.closest("section");
  if (!container) return null;

  // Find the UL that contains list items - don't rely on specific class names
  // Look for a UL that has LI children with actual content
  const allLists = container.querySelectorAll("ul");

  for (let list of allLists) {
    const items = list.querySelectorAll(":scope > li");
    // Check if this list has substantial content (not just navigation/buttons)
    if (items.length > 0) {
      // Verify it's a content list by checking if items have text content
      const firstItem = items[0];
      if (firstItem && firstItem.textContent.trim().length > 10) {
        return list;
      }
    }
  }

  return null;
}

function cleanText(text) {
  if (!text) return "";

  // Decode basic HTML entities like &quot;, &amp;, etc.
  const div = document.createElement("div");
  div.innerHTML = text;
  const decoded = div.textContent || div.innerText || "";

  return decoded
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function sendProfileData(data) {
  const payload = {
    name: data.name,
    url: data.profileUrl,
    scrapetime: data.scrapedAt,
    edu: data.education,
    exp: data.experience,
    projects: data.projects,
    publications: data.publications,
    honors_and_awards: data.honors_and_awards,
    test_scores: data.test_scores,
    about: data.about,
    location: data.location,
  };

  // Validation - Only check name and url
  const requiredFields = ["name", "url"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    return;
  }

  try {
    const response = await fetch("https://wts.iie.network/extension", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Data sent successfully!");
      if (typeof UI !== "undefined") UI.setStatus("success");
    } else {
      console.error("Failed to send data:", response.statusText);
      if (typeof UI !== "undefined") UI.setStatus("error");
    }
  } catch (error) {
    console.error("Error sending data:", error);
    if (typeof UI !== "undefined") UI.setStatus("error");
  }
}
