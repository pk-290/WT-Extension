async function openFullExperienceIfAvailable() {
  const expSection = document.querySelector("#experience");
  if (!expSection) return null;

  // Find footer button container (same as Projects / Awards / Test scores)
  const button = expSection.closest("section")
    ?.querySelector(".pvs-list__footer-wrapper a.optional-action-target-wrapper");

  if (!button) return null; // No "See more" button

  const fullUrl = button.getAttribute("href");
  if (!fullUrl) return null;

  // Open in new tab

  return new Promise(async (resolve, reject) => {
        const newTab = window.open(fullUrl, "_blank");

        if (!newTab) {
            return reject("Popup blocked!");
        }
        
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Check if page loaded
        const checkLoaded = setInterval(() => {
            try {
                // If page is fully loaded and accessible
                if (newTab.document && newTab.document.readyState === "complete") {
                    
                    clearInterval(checkLoaded);

                    // Inject scraping function into the new tab
                    const result =  scrapeExperienceInNewTab(newTab.document);
                    
                    resolve({experience:result, url:fullUrl});
                }
            } catch (err) {
                // Cross-origin block NOT possible for LinkedIn → same domain.
            }
        }, 500);
    });
 
}

function scrapeExperienceInNewTab(doc) {
    const experienceItems = [];
    
    const list = doc.querySelector("section > div > div > div > ul");
    if (!list) return experienceItems;

    const items = list.querySelectorAll(":scope > li");

    items.forEach(li => {
        const exp = {};

        // TITLE
        const titleEl = li.querySelector(
            '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
        );

        // COMPANY
        const companyEl = li.querySelector(
            '.t-14.t-normal span[aria-hidden="true"]'
        );

        // DURATION
        const durationEl = li.querySelector(
            '.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]'
        );

        if (titleEl) exp.title = titleEl.textContent.trim();
        if (companyEl) exp.company = companyEl.textContent.trim();
        if (durationEl) exp.duration = durationEl.textContent.trim();

        // -------------------------------
        // 🔥 DESCRIPTION HANDLING
        // -------------------------------

        // 1. direct description (usually one block)
        const descEl = li.querySelector(
            '.t-14.t-normal.t-black span[aria-hidden="true"]'
        );

        if (descEl) {
            const txt = descEl.textContent.trim();
            if (txt && !txt.startsWith("Skills:")) {
                exp.description = txt;
            }
        }

        // 2. nested description list items
        const nestedDescItems = li.querySelectorAll(
            ".pvs-entity__sub-components > ul > li"
        );

        nestedDescItems.forEach(subLi => {
            const textEl = subLi.querySelector(
                '.t-14.t-normal.t-black span[aria-hidden="true"]'
            );
            if (textEl) {
                const txt = textEl.textContent.trim();
                if (!txt) return;

                if (txt.startsWith("Skills:")) {
                    // optional skills capture
                    exp.skills = txt.replace("Skills:", "").trim();
                } else {
                    // combine multiple description lines
                    if (exp.description) {
                        exp.description += "\n" + txt;
                    } else {
                        exp.description = txt;
                    }
                }
            }
        });

        experienceItems.push(exp);
    });

    return experienceItems;
}



async function scrapeExperience() {

   const result = await openFullExperienceIfAvailable();

  if (result?.experience?.length>0) {
    console.log("Full experience page opened:", result.url);
    // You can stop scraping here and let backend fetch & parse this URL
    return result.experience;
  }

  const experienceItems = [];
  const experienceSection = document.querySelector("#experience");
  if (experienceSection) {
    const experienceContainer = experienceSection.parentElement.querySelector(
      "section.artdeco-card > div > ul"
    );
    //console.log(experienceContainer, "----> baaaka");
    if (experienceContainer) {
      //console.log("we are hwwere");
      const topLevelItems = experienceContainer.querySelectorAll(":scope > li");

      topLevelItems.forEach((item) => {
        // Check for nested company structure (Company -> Roles)
        const subComponentsDiv = item.querySelector(
          ".pvs-entity__sub-components"
        );
        const companyElement = item.querySelector(
          '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
        );

        const topLevelSubtitle = item.querySelector(".t-14.t-normal");

        // Better heuristic: Look at the sub-items. Do they have titles?
        const subListItems = subComponentsDiv
          ? subComponentsDiv.querySelectorAll(":scope > ul > li")
          : [];
        let hasNestedRoles = false;
        if (subListItems.length > 0) {
          const firstSubItem = subListItems[0];
          if (firstSubItem.querySelector(".mr1.hoverable-link-text.t-bold")) {
            hasNestedRoles = true;
          }
        }

        if (hasNestedRoles) {
          // Multi-role company
          const companyName = companyElement
            ? companyElement.innerText.trim()
            : "";

          subListItems.forEach((subItem) => {
            const exp = {};
            exp.company = companyName;

            const titleElement = subItem.querySelector(
              '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
            );
            const durationElement = subItem.querySelector(
              '.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]'
            );
            const locationElement = subItem.querySelector(
              '.t-black--light span[aria-hidden="true"]:not(.pvs-entity__caption-wrapper'
            );

            if (titleElement) exp.title = titleElement.innerText.trim();
            if (durationElement)
              exp.duration = durationElement.innerText.trim();
            if (locationElement)
              exp.location = locationElement.innerText.trim();

            //console.log("huraaaa----", exp);
            // Description and Skills for nested role
            const roleSubComponents = subItem.querySelector(
              ".pvs-entity__sub-components"
            );
            if (roleSubComponents) {
              const descriptionElement = roleSubComponents.querySelector(
                '.t-14.t-normal.t-black span[aria-hidden="true"]'
              );
              if (descriptionElement) {
                const text = descriptionElement.innerText.trim();
                if (text.startsWith("Skills:")) {
                  exp.skills = text.replace("Skills:", "").trim();
                } else {
                  exp.description = text;
                }
              }

              // Sometimes description and skills are separate list items
              const roleSubItems =
                roleSubComponents.querySelectorAll(":scope > ul > li");
              roleSubItems.forEach((rsi) => {
                const textEl = rsi.querySelector(
                  '.t-14.t-normal.t-black span[aria-hidden="true"]'
                );
                if (textEl) {
                  const text = textEl.innerText.trim();
                  if (text.startsWith("Skills:")) {
                    exp.skills = text.replace("Skills:", "").trim();
                  } else if (!exp.description) {
                    // Only take first non-skill text as description for now
                    exp.description = text;
                  } else {
                    // Append if multiple description blocks
                    exp.description += "\n" + text;
                  }
                }
              });
            }
            //console.log("here u bitit---", exp);
            if (exp.title) experienceItems.push(exp);
          });
        } else {
          // Single role
          const exp = {};
          const titleElement = item.querySelector(
            '.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]'
          );

          const companyElements = item.querySelectorAll(
            '.t-14.t-normal span[aria-hidden="true"]'
          );
          let companyName = "";
          if (companyElements.length > 0) {
            const firstText = companyElements[0].innerText.trim();
            if (!firstText.includes("·")) {
              companyName = firstText;
            } else {
              companyName = firstText.split("·")[0].trim();
            }
          }

          const durationElement = item.querySelector(
            '.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]'
          );
          const locationElements = item.querySelectorAll(
            '.t-14.t-normal.t-black--light span[aria-hidden="true"]'
          );

          if (titleElement) exp.title = titleElement.innerText.trim();
          if (companyName) exp.company = companyName;
          if (durationElement) exp.duration = durationElement.innerText.trim();
          if (locationElements.length > 1)
            exp.location = locationElements[1].innerText.trim();

          // Description and Skills
          if (subComponentsDiv) {
            const subItems =
              subComponentsDiv.querySelectorAll(":scope > ul > li");
            subItems.forEach((si) => {
              const textEl = si.querySelector(
                '.t-14.t-normal.t-black span[aria-hidden="true"]'
              );
              if (textEl) {
                const text = textEl.innerText.trim();
                if (text.startsWith("Skills:")) {
                  exp.skills = text.replace("Skills:", "").trim();
                } else {
                  if (exp.description) {
                    exp.description += "\n" + text;
                  } else {
                    exp.description = text;
                  }
                }
              }
            });
          }

          if (exp.title || exp.company) experienceItems.push(exp);
        }
      });
    }
  }
  return experienceItems;
}
