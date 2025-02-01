// background.js

// When the extension is installed (or updated), create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "verifyGemini",
    title: "Verify with Gemini",
    contexts: ["selection"] // Only show when text is selected
  });
});

// Listen for the context menu click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "verifyGemini") {
    const selectedText = info.selectionText;

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
            sources: data.sources || []
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
});
