async function scrapePublications() {
    const pubSection = document.querySelector('#publications');
    const publications = [];
    if (!pubSection) return publications;

    // Find the top-level UL that contains the publication items
    const topUl = pubSection.parentElement.querySelector('section.artdeco-card > div > ul');
    if (!topUl) return publications;

    // Only direct li children of the top-level UL
    const items = topUl.querySelectorAll(':scope > li');
    items.forEach(item => {
        const pub = {};

        // --- Helper: all visible spans that belong to the top-level UL (exclude nested UL spans) ---
        const visibleSpans = Array.from(item.querySelectorAll('span[aria-hidden="true"]'))
            .filter(sp => {
                const closestUl = sp.closest('ul');
                // keep the span only if its closest UL is the top-level UL (not a nested UL)
                return closestUl === topUl;
            })
            .map(s => cleanText(s.innerText))
            .filter(t => t && t.length > 0);

        // Title: first visible span that belongs to topUl
        if (visibleSpans.length > 0) {
            pub.title = visibleSpans[0];
        }

        // Subtitle/date: usually the second such span
        if (visibleSpans.length > 1) {
            pub.subTitle = visibleSpans[1];
        }

        // --- Description: explicitly read from nested sub-components (nested UL / inline-show-more block) ---
        // Look for the description span inside the nested block
        const descSpan = item.querySelector(
            ':scope .pvs-entity__sub-components span[aria-hidden="true"], :scope ul ul span[aria-hidden="true"], :scope div.inline-show-more-text--is-collapsed span[aria-hidden="true"]'
        );

        if (descSpan) {
            const raw = cleanText(descSpan.innerText || '');

            // Split by bullet characters (• or ◦) and newline markers
            const parts = raw
                .split(/•|◦|\n/g)
                .map(t => cleanText(t))
                .filter(t => t.length > 0);

            if (parts.length > 0) {
                pub.description = parts;
            } else if (raw) {
                pub.description = [raw];
            }
        }

        // --- External link (Show publication) ---
        const linkEl = item.querySelector('a[aria-label^="Show publication"], a.optional-action-target-wrapper');
        if (linkEl) {
            pub.link = linkEl.getAttribute('href') || linkEl.href || null;
        }

        // Push only if we have a title (dedupe by title as safety)
        if (pub.title) {
            // avoid duplicates
            const exists = publications.some(p => p.title === pub.title);
            if (!exists) publications.push(pub);
        }
    });

    return publications;
}
