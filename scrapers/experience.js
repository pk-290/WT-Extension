function scrapeExperience() {
    const experienceItems = [];
    const experienceSection = document.querySelector("#experience");

    if (experienceSection) {
        const experienceContainer = experienceSection.parentElement.querySelector(
            "section.artdeco-card > div > ul"
        );

        if (experienceContainer) {
            const topLevelItems = experienceContainer.querySelectorAll("li");

            topLevelItems.forEach((item) => {
                // Check for nested company structure (Company -> Roles)
                const subComponentsDiv = item.querySelector(".pvs-entity__sub-components");
                const companyElement = item.querySelector('.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]');

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
                    const companyName = companyElement ? companyElement.innerText.trim() : "";

                    subListItems.forEach((subItem) => {
                        const exp = {};
                        exp.company = companyName;

                        const titleElement = subItem.querySelector('.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]');
                        const durationElement = subItem.querySelector('.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]');
                        const locationElement = subItem.querySelector('.t-black--light:not(.pvs-entity__caption-wrapper) span[aria-hidden="true"]');

                        if (titleElement) exp.title = titleElement.innerText.trim();
                        if (durationElement) exp.duration = durationElement.innerText.trim();
                        if (locationElement) exp.location = locationElement.innerText.trim();

                        // Description and Skills for nested role
                        const roleSubComponents = subItem.querySelector(".pvs-entity__sub-components");
                        if (roleSubComponents) {
                            const descriptionElement = roleSubComponents.querySelector('.t-14.t-normal.t-black span[aria-hidden="true"]');
                            if (descriptionElement) {
                                const text = descriptionElement.innerText.trim();
                                if (text.startsWith("Skills:")) {
                                    exp.skills = text.replace("Skills:", "").trim();
                                } else {
                                    exp.description = text;
                                }
                            }

                            // Sometimes description and skills are separate list items
                            const roleSubItems = roleSubComponents.querySelectorAll(":scope > ul > li");
                            roleSubItems.forEach((rsi) => {
                                const textEl = rsi.querySelector('.t-14.t-normal.t-black span[aria-hidden="true"]');
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
                        if (exp.title) experienceItems.push(exp);
                    });
                } else {
                    // Single role
                    const exp = {};
                    const titleElement = item.querySelector('.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]');

                    const companyElements = item.querySelectorAll('.t-14.t-normal span[aria-hidden="true"]');
                    let companyName = "";
                    if (companyElements.length > 0) {
                        const firstText = companyElements[0].innerText.trim();
                        if (!firstText.includes("·")) {
                            companyName = firstText;
                        } else {
                            companyName = firstText.split("·")[0].trim();
                        }
                    }

                    const durationElement = item.querySelector('.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]');
                    const locationElements = item.querySelectorAll('.t-14.t-normal.t-black--light span[aria-hidden="true"]');

                    if (titleElement) exp.title = titleElement.innerText.trim();
                    if (companyName) exp.company = companyName;
                    if (durationElement) exp.duration = durationElement.innerText.trim();
                    if (locationElements.length > 1) exp.location = locationElements[1].innerText.trim();

                    // Description and Skills
                    if (subComponentsDiv) {
                        const subItems = subComponentsDiv.querySelectorAll(":scope > ul > li");
                        subItems.forEach((si) => {
                            const textEl = si.querySelector('.t-14.t-normal.t-black span[aria-hidden="true"]');
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
