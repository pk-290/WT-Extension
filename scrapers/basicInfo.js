function scrapeBasicInfo() {
    const data = {};

    // --- Basic Info ---
    const nameElem = document.querySelector('h1');
    if (nameElem) data.name = cleanText(nameElem.innerText);

    // Headline is usually in a div near the h1
    const h1Parent = nameElem ? nameElem.closest('div').parentElement : null;
    if (h1Parent) {
        const divs = h1Parent.querySelectorAll('div');
        for (let div of divs) {
            const text = cleanText(div.innerText);
            if (text && text !== data.name && text.length > 10 && text.length < 200) {
                data.headline = text;
                break;
            }
        }
    }

    // Location - look for text that looks like a location
    const allSpans = document.querySelectorAll('span');
    for (let span of allSpans) {
        const text = cleanText(span.innerText);
        if (text.match(/,.*United States|,.*India|,.*UK|Area$/i) && text.length < 100) {
            data.location = text;
            break;
        }
    }

    // --- About Section ---
    const aboutElem = document.querySelector('#about');
    if (aboutElem) {
        const aboutContainer = aboutElem.closest('section');
        if (aboutContainer) {
            const spans = aboutContainer.querySelectorAll('span[aria-hidden="true"]');
            for (let span of spans) {
                const text = cleanText(span.innerText);
                if (text.length > 50) {
                    data.about = text;
                    break;
                }
            }
        }
    }

    return data;
}
