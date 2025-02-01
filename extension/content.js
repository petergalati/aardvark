chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showLoading") {
        showIndicator("Loading evidence...");
    } else if (message.action === "displayResults") {
        displayResults(message.data);
    } else if (message.action === "displayError") {
        showIndicator("Error: " + message.error);
    }
});

function removeIndicator() {
    const existing = document.getElementById("evidence-indicator");
    if (existing) {
        existing.remove();
    }
}

function showIndicator(text) {
    removeIndicator();
    const indicator = document.createElement("div");
    indicator.id = "evidence-indicator";
    indicator.style.position = "absolute";
    indicator.style.background = "#fff";
    indicator.style.border = "1px solid #ccc";
    indicator.style.padding = "8px";
    indicator.style.zIndex = 10000;
    indicator.textContent = text;

    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    indicator.style.top = (rect.bottom + window.scrollY + 5) + "px";
    indicator.style.left = (rect.left + window.scrollX) + "px";

    document.body.appendChild(indicator);
}

function displayResults(data) {
    removeIndicator();

    const resultDiv = document.createElement("div");
    resultDiv.id = "evidence-indicator";
    resultDiv.style.position = "absolute";
    resultDiv.style.background = "#f9f9f9";
    resultDiv.style.border = "1px solid #ccc";
    resultDiv.style.padding = "8px";
    resultDiv.style.zIndex = 10000;

    // If you enforced JSON output in your Flask/Gemini prompt,
    // you'll get data like: { summary: "...", evidence: [ { url, title }, ... ] }
    if (data.summary) {
        const summaryP = document.createElement("p");
        summaryP.textContent = data.summary;
        resultDiv.appendChild(summaryP);
    }

    if (data.evidence && Array.isArray(data.evidence)) {
        const list = document.createElement("ul");
        data.evidence.forEach(item => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            link.href = item.url;
            link.textContent = item.title || item.url;
            link.target = "_blank";
            li.appendChild(link);
            list.appendChild(li);
        });
        resultDiv.appendChild(list);
    } else if (!data.summary) {
        // If the model didn't return structured data, just show it as raw JSON or text.
        const rawResponse = document.createElement("p");
        rawResponse.textContent = JSON.stringify(data);
        resultDiv.appendChild(rawResponse);
    }

    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    resultDiv.style.top = (rect.bottom + window.scrollY + 5) + "px";
    resultDiv.style.left = (rect.left + window.scrollX) + "px";

    document.body.appendChild(resultDiv);
}
