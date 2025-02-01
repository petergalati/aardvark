// Create a context menu item that appears when text is selected.
chrome.contextMenus.create({
    id: "check-evidence",
    title: "Check Evidence with Gemini Flash (Backend)",
    contexts: ["selection"]
});

// Listen for clicks on the context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "check-evidence" && info.selectionText) {
        // Optionally, send a message to the content script to show a loading indicator.
        chrome.tabs.sendMessage(tab.id, { action: "showLoading", selection: info.selectionText });

        // Call our Flask backend.
        queryBackend(info.selectionText)
            .then(response => {
                // Send the results back to the content script.
                chrome.tabs.sendMessage(tab.id, { action: "displayResults", data: response });
            })
            .catch(error => {
                chrome.tabs.sendMessage(tab.id, { action: "displayError", error: error.toString() });
            });
    }
});

// Make a POST request to our Flask backend with the selected text.
async function queryBackend(selectedText) {
    // Change this URL to your Flask server if needed.
    // If Flask is running on localhost:5000, this should work.
    const url = "http://127.0.0.1:5000/api/evidence";

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: selectedText })
    });

    if (!response.ok) {
        throw new Error("API request failed with status " + response.status);
    }

    // We expect structured JSON (e.g., { summary: "some text", evidence: [ ... ] })
    return response.json();
}
