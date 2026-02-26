document.addEventListener('DOMContentLoaded', async () => {
    const keywordsContainer = document.getElementById('keywordsContainer');
    const statusElement = document.getElementById('status');

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
        // Step 1: Execute content script to scrape the page
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            // Step 2: Send a message to the content script to perform the scrape
            chrome.tabs.sendMessage(tab.id, { action: "performScrape" }, async (response) => {
                if (response && response.success) {
                    const { title, description } = response.data;

                    if (!description || description.length < 50) {
                        statusElement.innerText = "No significant job description found.";
                        keywordsContainer.innerHTML = '';
                        return;
                    }

                    statusElement.innerText = "Generating learning path with AI...";
                    keywordsContainer.innerHTML = '<div class="loading-animation"></div>';

                    try {
                        // Step 3: Call your new Next.js API with the scraped data
                        const websiteUrl = `http://localhost:3000`; // Use your live URL if deployed
                        const apiResponse = await fetch(`${websiteUrl}/api/curate-keywords`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobTitle: title, jobDescription: description }),
                        });

                        const curatedData = await apiResponse.json();

                        if (apiResponse.ok && curatedData.keywords) {
                            // Step 4: Display keywords in the popup
                            keywordsContainer.innerHTML = ''; // Clear loading animation
                            statusElement.innerText = "Click a keyword to start learning!";

                            curatedData.keywords.forEach(keyword => {
                                const keywordButton = document.createElement('button');
                                keywordButton.innerText = keyword;
                                keywordButton.className = 'keyword-button';
                                
                                // Step 5: Add a click listener to each button
                                keywordButton.addEventListener('click', () => {
                                    const encodedQuery = encodeURIComponent(keyword);
                                    const redirectUrl = `${websiteUrl}/?q=${encodedQuery}`;
                                    chrome.tabs.update(tab.id, { url: redirectUrl });
                                });
                                
                                keywordsContainer.appendChild(keywordButton);
                            });
                        } else {
                            statusElement.innerText = `Error: ${curatedData.error || 'Failed to generate learning path'}`;
                            keywordsContainer.innerHTML = '';
                        }
                    } catch (error) {
                        statusElement.innerText = "Network Error: Could not connect to API.";
                        keywordsContainer.innerHTML = '';
                        console.error("API call failed:", error);
                    }
                } else {
                    statusElement.innerText = "Failed to scrape page content.";
                    keywordsContainer.innerHTML = '';
                }
            });
        });
    }
});