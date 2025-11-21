function scrapeSkills() {
    const skillsList = getSectionContent('skills');
    const skills = [];
    if (skillsList) {
        const items = skillsList.querySelectorAll(':scope > li');
        items.forEach(item => {
            const spans = item.querySelectorAll('span[aria-hidden="true"]');
            for (let span of spans) {
                const text = cleanText(span.innerText);
                // Skills are short text, not endorsement counts
                if (text && text.length > 2 && text.length < 50 && !text.match(/\d+ endorsement/i)) {
                    skills.push(text);
                    break;
                }
            }
        });
    }
    return skills;
}
