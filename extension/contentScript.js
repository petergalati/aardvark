// contentScript.js

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

  // Create header
  const header = document.createElement("h3");
  header.innerText = "Gemini Verification Result";
  header.style.marginTop = "0";
  overlay.appendChild(header);

  // Create status message
  const status = document.createElement("p");
  status.style.fontWeight = "bold";
  status.style.color = success ? "green" : "red";
  status.innerText = success ? "✓ Verified" : "✗ Not Verified";
  overlay.appendChild(status);

  // Create the original text section
  const originalText = document.createElement("p");
  originalText.style.fontStyle = "italic";
  originalText.innerText = `"${text}"`;
  overlay.appendChild(originalText);

  // Create the message from the server or fallback
  const resultMessage = document.createElement("p");
  resultMessage.innerText = message || "No additional info.";
  overlay.appendChild(resultMessage);

  // Add sources if available
  if (Array.isArray(sources) && sources.length > 0) {
    const sourceTitle = document.createElement("p");
    sourceTitle.innerText = "Sources:";
    sourceTitle.style.fontWeight = "bold";
    overlay.appendChild(sourceTitle);

    const sourceList = document.createElement("ul");
    sources.forEach((src) => {
      const li = document.createElement("li");
      li.innerText = src;
      sourceList.appendChild(li);
    });
    overlay.appendChild(sourceList);
  }

  // Close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.marginTop = "10px";
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
