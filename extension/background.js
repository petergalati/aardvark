// background.js

// When the extension is installed (or updated), create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyAardvark",
    title: "Verify with Aardvark",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "addComment",
    title: "Add comment",
    contexts: ["selection"]
  });
});

// Listen for the context menu click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;

  if (info.menuItemId === "verifyAardvark") {
    try {
      // Show loading state
      chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_LOADING",
        payload: {
          text: selectedText
        }
      });

      // Call the Flask backend
      const response = await fetch("http://127.0.0.1:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: selectedText })
      });

      if (!response.ok) {
        throw new Error("Backend returned an error");
      }

      const data = await response.json();

      if (!data || !data.response) {
        throw new Error("Invalid response format");
      }

      // Send the formatted data to the content script
      chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_RESULT",
        payload: data // Send the entire response object
      });

    } catch (error) {
      // If there's an error, show an error message in the overlay
      chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_RESULT",
        payload: {
          response: {
            claims: [{
              determination: "Error",
              claim: selectedText,
              explanation: "An error occurred while verifying this claim: " + error.message,
              context_and_bias: "Unable to analyze due to technical error",
              evidence_strength: "No evidence available due to error",
              counterarguments: "Unable to provide counterarguments",
              limitations: "Service currently unavailable",
              sources: []
            }],
            summary: "Verification failed due to technical issues. Please try again later."
          }
        }
      });
    }
  }

  if (info.menuItemId === "addComment") {
    // We’ll ask the content script to show a comment box
    // We can get the current tab URL from 'tab.url'
    // The user will enter a comment in the overlay
    // Then the content script will talk back to the background script to POST to the server
    chrome.tabs.sendMessage(tab.id, {
      action: "SHOW_COMMENT_BOX",
      payload: {
        url: tab.url, // Current page URL
        text: selectedText
      }
    });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.action === "SAVE_COMMENT") {
    const { url, text, comment, username } = request.payload;

    try {
      const response = await fetch("http://127.0.0.1:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          text,
          comment,
          username: username || "Anonymous"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown error saving comment.");
      }

      // Successfully saved, let the content script know
      sendResponse({ success: true, message: data.message });
    } catch (error) {
      // Return error to content script
      sendResponse({ success: false, message: error.message });
    }

    // Let Chrome know we’ll respond asynchronously
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "FETCH_COMMENTS" });
  }
});