// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResults") {
    const { summary, sources } = request.results;
    displayResultsOverlay(summary, sources);
  } else if (request.action === "noApiKey") {
    alert("Please set your Gemini API key in the extension's options page.");
  } else if (request.action === "apiError") {
    alert("An error occurred calling the Gemini API: " + request.error);
  }
});

/**
 * Creates a semi-transparent overlay at the bottom of the page, showing the fact-check summary and sources.
 */
function displayResultsOverlay(summary, sources = []) {
  // Create a container for the overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; 
    bottom: 20px;
    left: 20px;
    right: 20px;
    background-color: #333;
    color: #fff;
    padding: 15px;
    border-radius: 6px;
    z-index: 999999;
    font-family: sans-serif;
    max-height: 50vh;
    overflow-y: auto;
  `;

  // Add the summary
  const summaryEl = document.createElement("p");
  summaryEl.textContent = summary;
  summaryEl.style.marginBottom = "10px";
  overlay.appendChild(summaryEl);

  // Add sources if available
  if (sources.length > 0) {
    const sourcesTitle = document.createElement("strong");
    sourcesTitle.textContent = "Sources:";
    overlay.appendChild(sourcesTitle);

    const sourceList = document.createElement("ul");
    sourceList.style.margin = "5px 0";
    sources.forEach((src) => {
      const li = document.createElement("li");
      // Create clickable links for sources
      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = src;
      link.style.color = "#4AE";
      li.appendChild(link);
      sourceList.appendChild(li);
    });
    overlay.appendChild(sourceList);
  }

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.cssText = `
    margin-top: 10px;
    background: #555;
    color: #fff;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 4px;
  `;
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });
  overlay.appendChild(closeButton);

  // Add overlay to the page
  document.body.appendChild(overlay);
}
