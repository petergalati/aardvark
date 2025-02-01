// background.js

// Create a right-click menu that appears only when text is selected.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factCheckWithGemini",
    title: "Fact Check with Gemini",
    contexts: ["selection"]
  });
});

// Handle the click event on our context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "factCheckWithGemini") {
    const selectedText = info.selectionText;

    // Retrieve the Gemini API key from local storage.
    chrome.storage.local.get("geminiApiKey", (data) => {
      const apiKey = data.geminiApiKey;
      if (!apiKey) {
        // If there's no API key stored, tell the content script to notify the user
        chrome.tabs.sendMessage(tab.id, {
          action: "noApiKey"
        });
        return;
      }

      // Construct the request for the Gemini API
      // Replace the URL, request body, and headers as needed for your actual Gemini API
      const apiUrl = "https://api.gemini.example.com/v1/factcheck"; // Placeholder endpoint
      const requestBody = {
        model: "gemini-fact-check-model", // Example model name
        prompt: {
          text: `Fact-check the following statement and provide sources:\n\n"${selectedText}"`
        }
      };

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })
        .then((response) => response.json())
        .then((geminiResponse) => {
          // Process the Gemini response into a simpler object
          const factCheckResults = extractResults(geminiResponse);

          // Send the fact-check data to the content script
          chrome.tabs.sendMessage(tab.id, {
            action: "showResults",
            results: factCheckResults
          });
        })
        .catch((error) => {
          console.error("Gemini API error:", error);
          chrome.tabs.sendMessage(tab.id, {
            action: "apiError",
            error: error.message
          });
        });
    });
  }
});

/**
 * Extract relevant info (summary, sources, etc.) from Gemini’s response.
 * Adapt this function to match the actual Gemini response structure.
 */
function extractResults(geminiResponse) {
  try {
    // Example:
    // Suppose geminiResponse might look like:
    // {
    //   "candidates": [
    //     { "content": { "parts": [{ "text": "Here's a fact check summary..." }] } }
    //   ],
    //   "sources": [
    //     "https://source1.com",
    //     "https://source2.org"
    //   ]
    // }

    const summary = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 
                    "No summary provided.";
    const sources = geminiResponse?.sources || [];

    return { summary, sources };
  } catch (err) {
    console.error("Error extracting results:", err);
    return {
      summary: "Unable to parse Gemini response.",
      sources: []
    };
  }
}
