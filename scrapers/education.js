function scrapeEducation() {
    const educationList = getSectionContent('education');
    const edus = [];
    if (educationList) {
        const items = educationList.querySelectorAll(':scope > li');
        items.forEach(item => {
            const edu = {};
            const spans = item.querySelectorAll('span[aria-hidden="true"]');
            const texts = Array.from(spans).map(s => cleanText(s.innerText)).filter(t => t);

            // First text is school
            if (texts.length > 0) edu.school = texts[0];

            // Second text is usually degree
            if (texts.length > 1 && !texts[1].match(/\d{4}/)) {
                edu.degree = texts[1];
            }

            // Find years
            for (let text of texts) {
                if (text.match(/\d{4}/)) {
                    edu.years = text;
                    break;
                }
            }

            // Look for grade/activities in nested content
            const nestedSpans = item.querySelectorAll('div span[aria-hidden="true"]');
            for (let span of nestedSpans) {
                const text = cleanText(span.innerText);
                if (text.startsWith('Grade:')) {
                    edu.grade = text.replace('Grade:', '').trim();
                } else if (text.startsWith('Activities')) {
                    edu.activities = text.replace('Activities and societies:', '').trim();
                }
            }

            if (edu.school) edus.push(edu);
        });
    }
    return edus;
}
