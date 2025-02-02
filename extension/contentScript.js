// A simple function to create an overlay element
function createOverlay({ success, text, message, sources }) {
  // Remove any old overlay first
  const existingOverlay = document.getElementById("gemini-verifier-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create a container
  const overlay = document.createElement("div");
  overlay.id = "gemini-verifier-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "10px";
  overlay.style.right = "10px";
  overlay.style.width = "300px";
  overlay.style.padding = "16px";
  overlay.style.zIndex = "999999";
  overlay.style.border = "2px solid #333";
  overlay.style.borderRadius = "8px";
  overlay.style.backgroundColor = "#fff";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  overlay.style.color = "#000";
  overlay.style.textAlign = "center"; // Center align text

  // Create header
  const header = document.createElement("h3");
  header.innerText = "Gemini Verification Result";
  header.style.fontWeight = "bold";
  header.style.marginBottom = "10px"; // Add spacing
  overlay.appendChild(header);

  // Create status message
  const status = document.createElement("p");
  status.style.fontWeight = "bold";
  status.style.color = success ? "green" : "red";
  status.innerText = success ? "✓ Verified" : "✗ Not Verified";
  status.style.marginBottom = "10px"; // Add spacing
  overlay.appendChild(status);

  // Create the original text section
  const originalText = document.createElement("p");
  originalText.style.fontStyle = "italic";
  originalText.style.marginBottom = "10px"; // Add spacing
  originalText.innerText = `"${text}"`;
  overlay.appendChild(originalText);

  // Add sources if available
  if (Array.isArray(sources) && sources.length > 0) {
    const sourceTitle = document.createElement("p");
    sourceTitle.innerText = "Sources:";
    sourceTitle.style.fontWeight = "bold";
    sourceTitle.style.marginBottom = "5px"; // Add spacing
    overlay.appendChild(sourceTitle);

    const sourceList = document.createElement("ul");
    sourceList.style.paddingLeft = "0";
    sourceList.style.listStyleType = "none"; // Remove default list styling

    sources.forEach((src) => {
      const li = document.createElement("li");
      li.innerText = src;
      li.style.marginBottom = "5px"; // Add spacing between list items
      sourceList.appendChild(li);
    });
    overlay.appendChild(sourceList);
  }

  // Close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.marginTop = "10px";
  closeButton.style.padding = "5px 10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.border = "2px solid #333";
  closeButton.style.borderRadius = "8px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.color = "#333";
  closeButton.onclick = () => {
    overlay.remove();
  };
  overlay.appendChild(closeButton);

  return overlay;
}

function createCommentOverlay({ url, text }) {
  // Check if the verification overlay is present
  const verificationOverlay = document.getElementById("gemini-verifier-overlay");

  // Create the container
  const commentOverlay = document.createElement("div");
  commentOverlay.id = "gemini-comment-overlay";
  commentOverlay.style.position = "fixed";
  commentOverlay.style.width = "300px";
  commentOverlay.style.padding = "16px";
  commentOverlay.style.zIndex = "999999";
  commentOverlay.style.border = "2px solid #333";
  commentOverlay.style.borderRadius = "8px";
  commentOverlay.style.backgroundColor = "#fff";
  commentOverlay.style.fontFamily = "Arial, sans-serif";
  commentOverlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  commentOverlay.style.color = "#000";

  // If verification overlay is present, place this below it
  // else default to top-right
  if (verificationOverlay) {
    // We can get the bounding box to place it below
    const rect = verificationOverlay.getBoundingClientRect();
    commentOverlay.style.top = (rect.bottom + 10) + "px";
    commentOverlay.style.right = "10px";
  } else {
    // If no verification overlay, just place at top-right
    commentOverlay.style.top = "10px";
    commentOverlay.style.right = "10px";
  }

  // Header
  const header = document.createElement("h3");
  header.innerText = "Add Comment to Gemini";
  header.style.marginTop = "0";
  commentOverlay.appendChild(header);

  // Show the url/text that will be commented on
  const info = document.createElement("p");
  info.innerText = `URL: ${url}\nText: "${text}"`;
  info.style.whiteSpace = "pre-wrap";
  info.style.fontSize = "0.9em";
  commentOverlay.appendChild(info);

  // Text area for the comment
  const textArea = document.createElement("textarea");
  textArea.rows = 4;
  textArea.cols = 30;
  textArea.placeholder = "Enter your comment here...";
  textArea.style.display = "block";
  textArea.style.width = "100%";
  textArea.style.marginBottom = "8px";
  commentOverlay.appendChild(textArea);

  // Save button
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save Comment";
  saveButton.onclick = () => {
    const comment = textArea.value.trim();
    if (!comment) {
      alert("Comment cannot be empty.");
      return;
    }

    // Send the data (url, text, comment) to the background script for saving
    chrome.runtime.sendMessage({
      action: "SAVE_COMMENT",
      payload: {
        url,
        text,
        comment,
        username: "Anonymous"  // or gather from your extension’s settings
      }
    }, (response) => {
      if (response && response.success) {
        alert("Comment saved successfully!");
      } else {
        alert("Failed to save comment: " + (response?.message || "Unknown error"));
      }
      commentOverlay.remove(); // Close the overlay after saving
    });
  };
  commentOverlay.appendChild(saveButton);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Close";
  closeBtn.style.marginLeft = "8px";
  closeBtn.onclick = () => {
    commentOverlay.remove();
  };
  commentOverlay.appendChild(closeBtn);

  return commentOverlay;
}


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_RESULT") {
    const { success, text, message, sources } = request.payload;
    const overlay = createOverlay({ success, text, message, sources });
    document.body.appendChild(overlay);
    sendResponse({ status: "Overlay shown" });
  }

  if (request.action === "SHOW_COMMENT_BOX") {
    // Show the comment overlay
    const { url, text } = request.payload;
    const overlay = createCommentOverlay({ url, text });
    document.body.appendChild(overlay);
    sendResponse({ status: "Comment overlay shown" });
  }
});
