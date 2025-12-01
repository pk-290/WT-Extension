async function scrapeHonorsAwards() {
    const section = document.querySelector('#honors_and_awards');
    if (!section) return [];

    // Select the top-level <li> items of awards
    const items = section.closest('section')
        .querySelectorAll(':scope ul > li.artdeco-list__item');

    const honors = [];

    items.forEach(li => {
        const honor = {};

        // -------------------------------
        // 1. TITLE
        // -------------------------------
        const titleSpan = li.querySelector(
            'div.t-bold span[aria-hidden="true"]'
        );
        if (titleSpan) {
            honor.title = titleSpan.innerText.trim();
        }

        // -------------------------------
        // 2. ISSUER + DATE
        // -------------------------------
        const issueSpan = li.querySelector(
            'span.t-14.t-normal span[aria-hidden="true"]'
        );

        if (issueSpan) {
            const text = issueSpan.innerText.trim();

            // "Issued by X · Feb 2018"
            const issuerMatch = text.match(/^Issued by (.*?) ·/);
            const dateMatch = text.match(/· (.*)$/);

            if (issuerMatch) honor.issuer = issuerMatch[1].trim();
            if (dateMatch) honor.date = dateMatch[1].trim();
        }

        // -------------------------------
        // 3. NESTED DESCRIPTION (if exists)
        // -------------------------------
        const nestedDescSpan = li.querySelector(
            '.pvs-entity__sub-components ul li span[aria-hidden="true"]'
        );

        if (nestedDescSpan) {
            honor.description = nestedDescSpan.innerText.trim();
        }

        honors.push(honor);
    });

    return honors;
}
