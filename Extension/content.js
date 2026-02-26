// This function runs on the webpage to scrape the content.
function scrapeJobDescription() {
    let jobDescriptionText = "";
    // A list of common selectors to find job description text.
    // To make this more robust, you can add more selectors common on popular job sites.
    const selectors = [
        'div[class*="job-description"]',
        'div[id*="job-details"]',
        '.job-content',
        'body' // Fallback
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText) {
            jobDescriptionText = element.innerText;
            break;
        }
    }

    // You can also add more specific selectors for job titles if needed.
    const jobTitleElement = document.querySelector('h1.job-title, h1, .job-title');
    const jobTitle = jobTitleElement ? jobTitleElement.innerText : 'Unknown Job';

    return { title: jobTitle, description: jobDescriptionText };
}

// Listen for a message from the popup script to perform the scrape
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "performScrape") {
        const data = scrapeJobDescription();
        sendResponse({ success: true, data });
    }
});