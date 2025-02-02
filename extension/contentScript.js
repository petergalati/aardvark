const STYLES = {
  overlay: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    maxHeight: '80vh',
    padding: '24px',
    zIndex: '999999',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    color: '#1a1a1a',
    overflowY: 'auto',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)',
  },
  button: {
    padding: '8px 16px',
    margin: '8px',
    cursor: 'pointer',
    border: '1px solid #007AFF',
    borderRadius: '8px',
    backgroundColor: '#007AFF',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  determinationBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '16px',
  }
};

// Utility functions
const removeExistingOverlay = (id) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
};

const createButton = (text, onClick) => {
  const button = document.createElement('button');
  Object.assign(button.style, STYLES.button);
  button.innerText = text;
  button.onclick = onClick;
  return button;
};

function createLoadingOverlay(text) {
  removeExistingOverlay('aardvark-verifier-overlay');
  
  const overlay = document.createElement('div');
  overlay.id = 'aardvark-verifier-overlay';
  Object.assign(overlay.style, STYLES.overlay);

  const content = document.createElement('div');
  content.innerHTML = `
    <div style="text-align: center;">
      <div style="margin-bottom: 20px;">
        <div class="loader"></div>
        <h3>Analyzing Claim</h3>
      </div>
      <div style="font-style: italic; margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 8px;">
        "${text}"
      </div>
      <div>Please wait while we verify this information...</div>
    </div>
  `;

  // Add loading spinner styles
  const style = document.createElement('style');
  style.textContent = `
    .loader {
      border: 4px solid #f3f3f3;
      border-radius: 50%;
      border-top: 4px solid #007AFF;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

function createResultOverlay(data) {
  removeExistingOverlay('aardvark-verifier-overlay');

  const overlay = document.createElement('div');
  overlay.id = 'aardvark-verifier-overlay';
  Object.assign(overlay.style, STYLES.overlay);

  const claim = data.response.claims[0]; // Assuming first claim

  // Create main content container
  const content = document.createElement('div');
  
  // Add determination badge
  const determinationBadge = document.createElement('div');
  Object.assign(determinationBadge.style, STYLES.determinationBadge);
  determinationBadge.style.backgroundColor = getDeterminationColor(claim.determination);
  determinationBadge.style.color = '#ffffff';
  determinationBadge.innerText = claim.determination;
  content.appendChild(determinationBadge);

  // Add claim text
  const claimText = document.createElement('h2');
  claimText.style.cssText = 'margin: 16px 0; font-size: 18px;';
  claimText.innerText = claim.claim;
  content.appendChild(claimText);

  // Add summary
  const summary = document.createElement('div');
  summary.style.cssText = 'margin: 16px 0; padding: 16px; background: #f5f5f5; border-radius: 8px;';
  summary.innerText = data.response.summary;
  content.appendChild(summary);

  // Add expandable sections
  const sections = [
    { title: 'Explanation', content: claim.explanation },
    { title: 'Context & Bias', content: claim.context_and_bias },
    { title: 'Evidence Strength', content: claim.evidence_strength },
    { title: 'Counterarguments', content: claim.counterarguments },
    { title: 'Research Process', content: claim.research_process },
    { title: 'Limitations', content: claim.limitations }
  ];

  sections.forEach(section => {
    content.appendChild(createExpandableSection(section.title, section.content));
  });

  // Add sources section
  if (claim.sources && claim.sources.length > 0) {
    const sourcesSection = document.createElement('div');
    sourcesSection.style.cssText = 'margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;';
    
    const sourcesTitle = document.createElement('h3');
    sourcesTitle.innerText = 'Sources';
    sourcesSection.appendChild(sourcesTitle);

    claim.sources.forEach(source => {
      const sourceDiv = document.createElement('div');
      sourceDiv.style.cssText = 'margin: 12px 0; padding: 12px; background: #f8f8f8; border-radius: 8px;';
      
      const sourceLink = document.createElement('a');
      sourceLink.href = source.url;
      sourceLink.target = '_blank';
      sourceLink.style.cssText = 'color: #007AFF; text-decoration: none; display: block; margin-bottom: 8px;';
      sourceLink.innerText = source.url;
      
      const reliability = document.createElement('div');
      reliability.style.cssText = 'color: #666; font-size: 14px; margin-bottom: 8px;';
      reliability.innerText = `Reliability: ${source.reliability}`;
      
      const description = document.createElement('div');
      description.style.cssText = 'font-size: 14px;';
      description.innerText = source.description;

      sourceDiv.appendChild(sourceLink);
      sourceDiv.appendChild(reliability);
      sourceDiv.appendChild(description);
      sourcesSection.appendChild(sourceDiv);
    });

    content.appendChild(sourcesSection);
  }

  // Add close button
  const closeButton = createButton('Close', () => overlay.remove());
  closeButton.style.marginTop = '16px';
  content.appendChild(closeButton);

  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

function createExpandableSection(title, content) {
  const section = document.createElement('div');
  section.style.cssText = 'margin: 16px 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;';

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px;
    background-color: #f8f8f8;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <span style="font-weight: 600;">${title}</span>
    <span class="arrow">▼</span>
  `;

  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = 'padding: 12px; display: none;';
  contentDiv.innerText = content;

  header.onclick = () => {
    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
    header.querySelector('.arrow').innerText = contentDiv.style.display === 'none' ? '▼' : '▲';
  };

  section.appendChild(header);
  section.appendChild(contentDiv);
  return section;
}

function getDeterminationColor(determination) {
  const colors = {
    'True': '#34C759',
    'False': '#FF3B30',
    'Partially True': '#FF9500',
    'Unverified': '#8E8E93',
    'Error': '#FF3B30'
  };
  return colors[determination] || colors['Unverified'];
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SHOW_LOADING") {
    createLoadingOverlay(request.payload.text);
    sendResponse({ status: "Loading overlay shown" });
  }

  if (request.action === "SHOW_RESULT") {
    createResultOverlay(request.payload);
    sendResponse({ status: "Result overlay shown" });
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

