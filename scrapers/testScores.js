function scrapeTestScores() {
    const section = document.querySelector('#test_scores');
    if (!section) return [];

    // Select the top-level <li> items inside the test_scores section
    const items = section.closest('section')
        .querySelectorAll(':scope ul > li.artdeco-list__item');

    const tests = [];

    items.forEach(li => {
        const test = {};

        // -------------------------------
        // 1. TITLE (e.g., "TOEFL")
        // -------------------------------
        const titleSpan = li.querySelector(
            'div.t-bold span[aria-hidden="true"]'
        );

        if (titleSpan) {
            test.title = titleSpan.innerText.trim();
        }

        // -------------------------------
        // 2. SCORE + DATE
        // -------------------------------
        const scoreSpan = li.querySelector(
            'span.t-14.t-normal span[aria-hidden="true"]'
        );

        if (scoreSpan) {
            const text = scoreSpan.innerText.trim(); 
            // Examples:
            // "Score: AIR 403 · May 2016"
            // "Score: 117 / 120"

            // Extract score
            const scoreMatch = text.match(/^Score:\s*(.*?)($| ·)/);
            if (scoreMatch) {
                test.score = scoreMatch[1].trim();
            }

            // Extract date
            const dateMatch = text.match(/· (.*)$/);
            if (dateMatch) {
                test.date = dateMatch[1].trim();
            }
        }

        tests.push(test);
    });

    return tests;
}
