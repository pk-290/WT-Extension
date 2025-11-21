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
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

async function expandDetails() {
    console.log("Expanding 'Show more' buttons...");
    const buttons = Array.from(document.querySelectorAll('button'));

    const showMoreButtons = buttons.filter(b => {
        const text = b.innerText.toLowerCase();
        return text.includes('more') || text.includes('see more');
    });

    showMoreButtons.forEach(button => {
        try {
            button.click();
        } catch (e) {
            // Ignore click errors
        }
    });

    // Wait a bit for DOM updates after clicks
    if (showMoreButtons.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log("Finished expanding.");
}

function getSectionContent(anchorId) {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return null;

    // Navigate up to the section container
    let container = anchor.closest('section');
    if (!container) return null;

    // Find the UL that contains list items - don't rely on specific class names
    // Look for a UL that has LI children with actual content
    const allLists = container.querySelectorAll('ul');

    for (let list of allLists) {
        const items = list.querySelectorAll(':scope > li');
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
    if (!text) return '';

    // Decode basic HTML entities like &quot;, &amp;, etc.
    const div = document.createElement('div');
    div.innerHTML = text;
    const decoded = div.textContent || div.innerText || '';

    return decoded
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function downloadData(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'linkedin_profile'} LinkedIn Profile.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
