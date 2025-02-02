// background.js

// When the extension is installed (or updated), create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyGemini",
    title: "Verify with Gemini",
    contexts: ["selection"] // Only show when text is selected
  });

  chrome.contextMenus.create({
    id: "addComment",
    title: "Add comment",
    contexts: ["selection"]
  });
});

// Listen for the context menu click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText || "";


  if (info.menuItemId === "verifyGemini") {
    try {
      // Call the Flask backend
      const response = await fetch("http://127.0.0.1:5000/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: selectedText })
      });

      // If the backend doesn’t respond with valid JSON or the status != 200
      if (!response.ok) {
        throw new Error("Backend returned an error");
      }

      const data = await response.json();

      // If the data is null or empty, we handle fallback
      if (!data) {
        // Send fallback info to the content script
        chrome.tabs.sendMessage(tab.id, {
          action: "SHOW_RESULT",
          payload: {
            success: false,
            text: selectedText,
            message: "No valid response from backend.",
            sources: []
          }
        });
      } else {
        // Data from the server is available; forward to content script
        chrome.tabs.sendMessage(tab.id, {
          action: "SHOW_RESULT",
          payload: {
            success: true,
            text: selectedText,
            message: data.message || "Verification successful.",
            sources: data.sources || ["source1.com", "source2.com"]
          }
        });
      }
    } catch (error) {
      // If the request fails (network or server error), send fallback
      chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_RESULT",
        payload: {
          success: false,
          text: selectedText,
          message: "Failed to connect to backend.",
          sources: []
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
