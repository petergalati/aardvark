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

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_RESULT") {
    const { success, text, message, sources } = request.payload;
    const overlay = createOverlay({ success, text, message, sources });
    document.body.appendChild(overlay);
    sendResponse({ status: "Overlay shown" });
  }
});
