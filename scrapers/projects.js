async function scrapeProjects() {
    const projectSection = document.querySelector('#projects');
    const projects = [];
    console.log("yo maan");
    if (!projectSection) return projects;
     
    console.log("here the project");
    // Use only the first/top-level UL to avoid nested lists
    const topUl = projectSection.parentElement.querySelector('section.artdeco-card > div > ul');
    if (!topUl) return projects;
    
    // Only direct li children of that top-level UL
    const items = topUl.querySelectorAll(':scope > li');

    const seenTitles = new Set();

    items.forEach(item => {
        const project = {};

        // ---- GET TITLE (prefer the bold title span) ----
        // Prefer the t-bold span (LinkedIn uses t-bold for the title area).
        let titleSpan = item.querySelector('.t-bold span[aria-hidden="true"]');

        // Fallback: the first top-level span under the item's main block
        if (!titleSpan) {
            // try to find a span that's not inside nested <ul>
            titleSpan = Array.from(item.querySelectorAll('span[aria-hidden="true"]'))
                .find(sp => {
                    // ensure the span is not inside a nested <ul> (defensive)
                    return !sp.closest('ul') || sp.closest('ul') === topUl;
                }) || null;
        }

        if (titleSpan) {
            project.title = cleanText(titleSpan.innerText);
        }

        // ---- GET DATE RANGE ----
        // Date typically appears in the t-14 span next to the title
        const dateSpan = item.querySelector('span.t-14 span[aria-hidden="true"], :scope > div span.t-14[aria-hidden="true"]');
        if (dateSpan) {
            project.date = cleanText(dateSpan.innerText);
        } else {
            // fallback: second top-level span if exists and looks like a date
            const allSpans = Array.from(item.querySelectorAll(':scope > div span[aria-hidden="true"]'))
                .map(s => cleanText(s.innerText))
                .filter(t => t);
            if (allSpans.length > 1) {
                const maybeDate = allSpans[1];
                if (/\d{4}/.test(maybeDate) || /-/ .test(maybeDate) || /May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr/.test(maybeDate)) {
                    project.date = maybeDate;
                }
            }
        }

        // ---- GET DESCRIPTION BULLETS ----
        // Description lives inside the inline-show-more-text container
        const descriptionContainer = item.querySelector(
            'div.inline-show-more-text--is-collapsed span[aria-hidden="true"], .inline-show-more-text--is-collapsed span[aria-hidden="true"]'
        );

        if (descriptionContainer) {
            const rawText = cleanText(descriptionContainer.innerText || '');

            // Split into bullet points (LinkedIn uses "•")
            const bullets = rawText
                .split('•')
                .map(t => cleanText(t))
                .filter(t => t.length > 0);

            if (bullets.length > 0) {
                project.description = bullets;
            } else if (rawText) {
                // fallback to whole text if bullets not found
                project.description = [rawText];
            }
        } else {
            // Another fallback: sometimes description spans are nested differently
            const nestedDescSpan = item.querySelector('div span[aria-hidden="true"].t-14.t-normal.t-black');
            if (nestedDescSpan) {
                const rawText = cleanText(nestedDescSpan.innerText || '');
                if (rawText) {
                    project.description = rawText.split('•').map(t => cleanText(t)).filter(t => t);
                }
            }
        }

        // Push only if title exists and not duplicate
        if (project.title && !seenTitles.has(project.title)) {
            seenTitles.add(project.title);
            projects.push(project);
        }
    });

    return projects;
}
