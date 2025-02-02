// A simple function to create an overlay element
function createOverlay({ success, text, sources }) {
  // Remove any old overlay first
  const existingOverlay = document.getElementById("aardvark-verifier-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create a container
  const overlay = document.createElement("div");
  overlay.id = "aardvark-verifier-overlay";
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
  header.innerText = "Aardvark Verification Result";
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
  // Remove any existing comment overlay first
  const existingOverlay = document.getElementById("gemini-comment-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Check if the verification overlay is present
  const verificationOverlay = document.getElementById("aardvark-verifier-overlay");

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
  commentOverlay.style.textAlign = "center"; // Center align text

  // If verification overlay is present, place this below it
  // else default to top-right
  if (verificationOverlay) {
    const rect = verificationOverlay.getBoundingClientRect();
    commentOverlay.style.top = (rect.bottom + 10) + "px";
    commentOverlay.style.right = "10px";
  } else {
    commentOverlay.style.top = "10px";
    commentOverlay.style.right = "10px";
  }

  // Header
  const header = document.createElement("h3");
  header.innerText = "Add Comment to Aardvark";
  header.style.fontWeight = "bold";
  header.style.marginBottom = "10px";
  commentOverlay.appendChild(header);

  // Show the url/text that will be commented on
  const info = document.createElement("p");
  info.innerText = `URL: ${url}\nText: "${text}"`;
  info.style.whiteSpace = "pre-wrap";
  info.style.fontSize = "0.9em";
  info.style.marginBottom = "10px";
  commentOverlay.appendChild(info);

  // Text area for the comment
  const textArea = document.createElement("textarea");
  textArea.rows = 4;
  textArea.cols = 30;
  textArea.placeholder = "Enter your comment here...";
  textArea.style.display = "block";
  textArea.style.width = "100%";
  textArea.style.marginBottom = "10px";
  commentOverlay.appendChild(textArea);

  // Button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.gap = "8px";

  // Save button
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save Comment";
  saveButton.style.padding = "5px 10px";
  saveButton.style.cursor = "pointer";
  saveButton.style.border = "2px solid #333";
  saveButton.style.borderRadius = "8px";
  saveButton.style.backgroundColor = "transparent";
  saveButton.style.color = "#333";
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
      commentOverlay.remove(); // Close the overlay after saving
    });
  };
  buttonContainer.appendChild(saveButton);

  // Close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.padding = "5px 10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.border = "2px solid #333";
  closeButton.style.borderRadius = "8px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.color = "#333";
  closeButton.onclick = () => {
    commentOverlay.remove();
  };
  buttonContainer.appendChild(closeButton);

  commentOverlay.appendChild(buttonContainer);

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

// Fetch comments from backend when the page loads
async function fetchComments() {
  const url = window.location.href;

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/comments?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.comments && data.comments.length > 0) {
      highlightTextWithComments(data.comments);
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

// Highlight text that has comments
function highlightTextWithComments(comments) {
  const body = document.body;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
  const nodesToProcess = [];

  while (walker.nextNode()) {
    nodesToProcess.push(walker.currentNode);
  }

  nodesToProcess.forEach(node => {
    let parent = node.parentNode;
    let textContent = node.nodeValue;
    let modified = false;

    let highlights = [];

    // Collect all matches & their comments
    comments.forEach(({ text, comment }) => {
      let regex = new RegExp(text, "gi"); // Case-insensitive search
      let match;

      while ((match = regex.exec(textContent)) !== null) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          comments: [comment]
        });
      }
    });

    if (highlights.length > 0) {
      highlights = mergeOverlappingHighlights(highlights, textContent); // Merge overlapping highlights

      let fragment = document.createDocumentFragment();
      let lastIndex = 0;

      highlights.forEach(({ start, end, text, comments }) => {
        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(textContent.slice(lastIndex, start)));
        }

        // Create highlight span
        let span = document.createElement("span");
        span.textContent = text;
        span.style.backgroundColor = "yellow";
        span.style.cursor = "pointer";
        span.style.borderRadius = "3px";
        span.style.padding = "2px";

        // Show multiple comments in tooltip
        span.title = comments.join("\n");

        fragment.appendChild(span);
        lastIndex = end;
      });

      if (lastIndex < textContent.length) {
        fragment.appendChild(document.createTextNode(textContent.slice(lastIndex)));
      }

      parent.replaceChild(fragment, node);
    }
  });
}

// Merges overlapping or contained highlights into a single range
function mergeOverlappingHighlights(highlights, textContent) {
  if (highlights.length === 0) return [];

  // Sort highlights by start position
  highlights.sort((a, b) => a.start - b.start);

  let merged = [];
  let current = highlights[0];

  for (let i = 1; i < highlights.length; i++) {
    let next = highlights[i];

    if (next.start <= current.end) {
      // If overlapping or contained, extend the highlight and merge comments
      current.end = Math.max(current.end, next.end);
      current.comments = [...new Set([...current.comments, ...next.comments])]; // Merge unique comments
    } else {
      // Store the correctly merged highlight
      current.text = textContent.slice(current.start, current.end);
      merged.push(current);
      current = next;
    }
  }

  // Push the last merged highlight
  current.text = textContent.slice(current.start, current.end);
  merged.push(current);

  return merged;
}


// Run this when the page loads
fetchComments();

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "FETCH_COMMENTS") {
    fetchComments();
  }
});

