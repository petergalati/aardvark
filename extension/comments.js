// comments.js

/********************************************
 * 1) Comment Overlay
 ********************************************/

/**
 * Creates an overlay for adding comments.
 *
 * @param {Object} params
 * @param {string} params.url - The URL associated with the comment.
 * @param {string} params.text - The text snippet associated with the comment.
 * @returns {HTMLDivElement} The overlay element.
 */
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

    // If verification overlay is present, place this below it, else default to top-right
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

/********************************************
 * 2) Listen for comment overlay messages
 ********************************************/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_COMMENT_BOX") {
        // Show the comment overlay
        const { url, text } = request.payload;
        const overlay = createCommentOverlay({ url, text });
        document.body.appendChild(overlay);
        sendResponse({ status: "Comment overlay shown" });
    }
});

/********************************************
 * 3) Fetch and Highlight Comments
 ********************************************/

// Fetch comments from your backend when the page loads
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

/**
 * Highlights any text in the DOM that has associated comments.
 * @param {Array} comments - An array of comment objects { text, comment } from backend.
 */
function highlightTextWithComments(comments) {
    const body = document.body;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToProcess = [];

    while (walker.nextNode()) {
        nodesToProcess.push(walker.currentNode);
    }

    nodesToProcess.forEach(node => {
        const parent = node.parentNode;
        let textContent = node.nodeValue;

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

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            highlights.forEach(({ start, end, text, comments }) => {
                if (start > lastIndex) {
                    fragment.appendChild(document.createTextNode(textContent.slice(lastIndex, start)));
                }

                // Create highlight span
                const span = document.createElement("span");
                span.textContent = text;
                span.style.backgroundColor = "yellow";
                span.style.cursor = "pointer";
                span.style.borderRadius = "3px";
                span.style.padding = "2px";
                span.style.position = "relative";

                // Create pop-up on hover
                span.onmouseenter = () => showCommentPopup(span, text, comments);
                span.onmouseleave = hideCommentPopup;

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

/********************************************
 * 4) Pop-up for Comments on Hover
 ********************************************/

// Show the pop-up comment box
function showCommentPopup(span, text, comments) {
    // Remove any existing pop-ups
    hideCommentPopup();

    const popup = document.createElement("div");
    popup.id = "comment-popup";
    popup.style.position = "absolute";
    popup.style.left = "0";
    popup.style.top = "100%";
    popup.style.width = "250px";
    popup.style.backgroundColor = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    popup.style.padding = "8px";
    popup.style.zIndex = "9999";
    popup.style.fontSize = "0.9em";
    popup.style.color = "#000";

    // Summary comment
    const summary = document.createElement("p");
    summary.innerText = `Summary: ${generateSummary(comments)}`;
    summary.style.fontWeight = "bold";
    popup.appendChild(summary);

    // Expandable "Show all comments" link
    const commentsLink = document.createElement("a");
    commentsLink.innerText = "Show all comments";
    commentsLink.href = "#";
    commentsLink.style.color = "blue";
    commentsLink.style.cursor = "pointer";

    // Hidden div for full comments
    const fullCommentsDiv = document.createElement("div");
    fullCommentsDiv.style.display = "none"; // Initially hidden
    fullCommentsDiv.style.marginTop = "8px";

    comments.forEach(comment => {
        const commentItem = document.createElement("p");
        commentItem.innerText = `• ${comment}`;
        fullCommentsDiv.appendChild(commentItem);
    });

    // Close link for full comments
    const closeButton = document.createElement("a");
    closeButton.innerText = "Close";
    closeButton.href = "#";
    closeButton.style.display = "block";
    closeButton.style.color = "red";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = (event) => {
        event.preventDefault();
        fullCommentsDiv.style.display = "none";
        commentsLink.style.display = "block";
    };
    fullCommentsDiv.appendChild(closeButton);

    // Show/hide logic
    commentsLink.onclick = (event) => {
        event.preventDefault();
        fullCommentsDiv.style.display = "block";
        commentsLink.style.display = "none";
    };

    popup.appendChild(commentsLink);
    popup.appendChild(fullCommentsDiv);

    span.appendChild(popup);
}

// Hide the pop-up
function hideCommentPopup() {
    const existingPopup = document.getElementById("comment-popup");
    if (existingPopup) {
        existingPopup.remove();
    }
}

/********************************************
 * 5) Utility Functions
 ********************************************/

function generateSummary(comments) {
    if (comments.length === 1) return comments[0];
    return `${comments.length} comments available.`;
}

// Merge overlapping highlights in the text
function mergeOverlappingHighlights(highlights, textContent) {
    if (highlights.length === 0) return [];

    // Sort highlights by start
    highlights.sort((a, b) => a.start - b.start);

    const merged = [];
    let current = highlights[0];

    for (let i = 1; i < highlights.length; i++) {
        const next = highlights[i];
        if (next.start <= current.end) {
            // Overlap: merge them
            current.end = Math.max(current.end, next.end);
            current.comments = [...new Set([...current.comments, ...next.comments])];
        } else {
            // Push the current merged highlight
            current.text = textContent.slice(current.start, current.end);
            merged.push(current);
            current = next;
        }
    }
    // Push the last one
    current.text = textContent.slice(current.start, current.end);
    merged.push(current);

    return merged;
}

/********************************************
 * 6) On Page Load
 ********************************************/

// Initial fetch of comments after the content script loads
fetchComments();

// (Optional) Listen for a request to refetch comments
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "FETCH_COMMENTS") {
        fetchComments();
    }
});
