// options.js
document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");

  // Load the stored API key when the options page is opened
  chrome.storage.local.get("geminiApiKey", (data) => {
    if (data.geminiApiKey) {
      apiKeyInput.value = data.geminiApiKey;
    }
  });

  // Save the API key to local storage when the user clicks "Save"
  saveBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      statusEl.textContent = "API key saved successfully!";
      setTimeout(() => {
        statusEl.textContent = "";
      }, 2000);
    });
  });
});
