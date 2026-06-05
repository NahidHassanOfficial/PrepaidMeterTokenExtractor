let tokens = [];
let sequenceBegin = -1,
  sequenceEnd = -1,
  flag = 0;
let currentTokenIndex = 0;
let submitButton = document.querySelector(".submit");

submitButton.addEventListener("click", function () {
  extractMsg();
});

function extractMsg() {
  let textarea = document.querySelector("textarea");
  let tokenMsg = textarea.value;

  if (tokenMsg == "") {
    toastMsg();
    return [];
  } else {
    tokens = extractTokens(tokenMsg);
    extractSequence(tokenMsg);
    currentTokenIndex = 0;

    if (tokens.length < 1) {
      toastMsg();
      return [];
    }

    // Hide input elements (keep in DOM for reset)
    let textareaContainer = document.querySelector(".textarea-container");
    let instructionsBox = document.querySelector(".instructions-box");
    
    if (textareaContainer) textareaContainer.style.display = "none";
    if (instructionsBox) instructionsBox.style.display = "none";
    submitButton.style.display = "none";

    let section = document.querySelector("section");
    section.classList.add("results-active");

    createResultDiv();
    displayToken();
  }
}

function resetToInput() {
  // Reset state
  tokens = [];
  sequenceBegin = -1;
  sequenceEnd = -1;
  flag = 0;
  currentTokenIndex = 0;

  // Clear results and table
  document.querySelector(".results").innerHTML = "";
  document.querySelector("table").innerHTML = "";

  // Clear dynamic style
  let styleTag = document.querySelector("style");
  if (styleTag) styleTag.innerHTML = "";

  // Restore input elements
  let textareaContainer = document.querySelector(".textarea-container");
  let instructionsBox = document.querySelector(".instructions-box");
  if (textareaContainer) textareaContainer.style.display = "";
  if (instructionsBox) instructionsBox.style.display = "";
  submitButton.style.display = "";

  let section = document.querySelector("section");
  section.classList.remove("results-active");

  // Clear textarea for fresh input
  let textarea = document.querySelector("textarea");
  if (textarea) textarea.value = "";
  if (textarea) textarea.focus();
}

function extractTokens(tokenMsg) {
  let match = tokenMsg.match(/(?:\b|\d{4}-?)((?:\d{4}-?){4})(?:\d{4}-?)\b/g);

  if (!match) return [];

  //replace hyphens with double space
  for (let i = 0; i < match.length; i++) {
    match[i] = match[i].replace(/-/g, "  ");
  }
  tokens = match;

  //it will add space after each four digits if space is missing
  tokens.forEach((element, index) => {
    tokens[index] = element.replace(/(\d{4})(?=\d)/g, "$1  ");
  });

  return tokens;
}

function extractSequence(tokenMsg) {
  //pattern with or without space ex: SquNo:- 7~11 SquNo:- 7 Sequence: 0~2 SeqNo: 5 SeqNo: 5~8
  //sequence separator (= or ~)
  let match = tokenMsg.match(
    /(?<=(?:Sq(?:u)?No|Sequence|SeqNo):\s*-?\s*)\d+(?:(?:[~=]\d+)?)/g
  );
  try {
    match.forEach((matched) => {
      let numbers = matched.split(/[~=]/).map((num) => parseInt(num, 10));
      if (numbers.length == 2) {
        [sequenceBegin, sequenceEnd] = numbers;
      } else {
        sequenceEnd = numbers[0];
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function createResultDiv() {
  let tokenHtml = `
  <div class="token-counter"></div>
  <div class="token" title="Click to copy token"></div>
  <div class="forward_buttons">
    <button class="arrow-previous">Previous</button>
    <button class="arrow-next">Next</button>
  </div>
  <div class="action-buttons">
    <button class="reset-btn" title="Start over"><i class="fa-solid fa-rotate-left"></i> New Extract</button>
    <button class="share-btn" title="Share this tool"><i class="fa-solid fa-share-nodes"></i> Share</button>
  </div>
`;

  let resultDiv = document.querySelector(".results");
  resultDiv.innerHTML = tokenHtml;
  resultDiv.classList.add("animate");

  // Copy token to clipboard on click
  let tokenEl = resultDiv.querySelector(".token");
  tokenEl.addEventListener("click", function () {
    if (currentTokenIndex < tokens.length) {
      let cleanToken = tokens[currentTokenIndex].replace(/\s+/g, "");
      navigator.clipboard.writeText(cleanToken).then(() => {
        tokenEl.classList.add("copied");
        tokenEl.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        createToast("success", "fa-solid fa-circle-check", "Copied", "Token copied to clipboard!");
        
        setTimeout(() => {
          tokenEl.classList.remove("copied");
          tokenEl.textContent = tokens[currentTokenIndex];
        }, 1200);
      }).catch(err => {
        console.error("Failed to copy token: ", err);
        createToast("warning", "fa-solid fa-circle-exclamation", "Copy Failed", "Please copy it manually.");
      });
    }
  });

  tokenTable();
  forwardButtons();
}

function tokenTable() {
  let tableData = `
  <thead>
        <tr>
            <th>S/N</th>
            <th>Token</th>
            <th>Seq.</th>
        </tr>
        </thead>
        <tbody>
    `;
  //token length difference
  let difference = 0;
  if (sequenceEnd != -1) {
    if (sequenceBegin != -1) {
      difference = tokens.length - (sequenceEnd - sequenceBegin + 1);
    } else difference = tokens.length - 1;
  }

  for (let i = 0; i < tokens.length; i++) {
    let sequenceCol = "";
    // Check if token length is more than the sequence
    if (difference) {
      sequenceCol = 0;
      difference--;
    }
    //check if sequence start and ending index is available
    else if (sequenceBegin != -1 && sequenceEnd != -1) {
      console.log(difference);
      if (sequenceBegin <= sequenceEnd) {
        sequenceCol = sequenceBegin++;
      }
    } else if (sequenceEnd !== -1 && !flag) {
      sequenceCol = sequenceEnd;
      flag++;
    }

    tableData += `
            <tr>
                <td>${i + 1}</td>
                <td>${tokens[i].replace(/  /g, " - ")}</td>
                <td>${sequenceCol}</td>
            </tr>
        `;
  }
  tableData += "</tbody>";

  let table = document.querySelector("table");
  table.innerHTML = tableData;

  table.classList.add("animate");
}

function displayToken() {
  let toksequenceEndiv = document.querySelector(".token");
  let counterEl = document.querySelector(".token-counter");

  // Calculate total digits across all tokens
  let totalDigits = tokens.reduce((sum, t) => sum + t.replace(/\s+/g, "").length, 0);

  if (currentTokenIndex < tokens.length) {
    let token = tokens[currentTokenIndex];
    toksequenceEndiv.textContent = token;
  } else {
    toksequenceEndiv.textContent = "That's all";
  }

  if (counterEl) {
    counterEl.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${tokens.length} token${tokens.length > 1 ? 's' : ''} &middot; ${totalDigits} digits extracted`;
  }

  updateNthChildValue(currentTokenIndex + 1);
}

function updateNthChildValue(nthChildValue) {
  let styleTag = document.querySelector("style");
  let cssText = `tbody tr:nth-child(${nthChildValue}){
  color: white !important; 
  background-color: var(--btn-bg) !important;
}
tbody tr:nth-child(${nthChildValue}) td{
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}`;
  styleTag.innerHTML = cssText;
}

function forwardButtons() {
  let previousButton = document.querySelector(".arrow-previous");
  previousButton.addEventListener("click", function () {
    currentTokenIndex = Math.max(0, currentTokenIndex - 1);
    displayToken();
  });

  let nextButton = document.querySelector(".arrow-next");
  nextButton.addEventListener("click", function () {
    currentTokenIndex = Math.min(tokens.length, currentTokenIndex + 1);
    displayToken();
  });

  let resetButton = document.querySelector(".reset-btn");
  if (resetButton) {
    resetButton.addEventListener("click", resetToInput);
  }

  let shareButton = document.querySelector(".share-btn");
  if (shareButton) {
    shareButton.addEventListener("click", function () {
      let url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        createToast("success", "fa-solid fa-circle-check", "Link Copied", "URL copied! Share it with your friends.");
      }).catch(() => {
        // Fallback: try Web Share API
        if (navigator.share) {
          navigator.share({ title: "Prepaid Meter Token Extractor", url: url });
        } else {
          createToast("warning", "fa-solid fa-circle-exclamation", "Copy Failed", "Please copy the URL manually.");
        }
      });
    });
  }
}

// Toast — Sonner-style
const notifications = document.querySelector(".notifications");
const TOAST_DURATION = 4000;

function dismissToast(toastEl) {
  if (!toastEl || toastEl.classList.contains("toast--leaving")) return;
  clearTimeout(toastEl.dismissTimer);
  toastEl.classList.add("toast--leaving");
  toastEl.addEventListener("animationend", () => toastEl.remove(), { once: true });
}

function createToast(type, icon, title, text) {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <div class="toast__icon"><i class="${icon}"></i></div>
    <div class="toast__content">
      <p class="toast__title">${title}</p>
      <p class="toast__description">${text}</p>
    </div>
    <button class="toast__close" type="button" aria-label="Dismiss">
      <i class="fa-solid fa-xmark"></i>
    </button>`;

  toast.querySelector(".toast__close").addEventListener("click", () => dismissToast(toast));
  notifications.prepend(toast);
  toast.dismissTimer = setTimeout(() => dismissToast(toast), TOAST_DURATION);
}

function toastMsg() {
  let type = "warning";
  let icon = "fa-solid fa-triangle-exclamation";
  let title = "Warning";
  let text = "Enter valid message!";
  createToast(type, icon, title, text);
}

// Theme Switcher Implementation
const themeToggleBtn = document.getElementById("theme-toggle");
let currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

setTheme(currentTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = activeTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const metaThemeColor = document.getElementById("meta-theme-color");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#0f172a" : "#008b8b");
  }
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector("i");
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
    } else {
      icon.className = "fa-solid fa-moon";
    }
  }
}

// PWA Install Prompt Hook
const pwaInstallBtn = document.getElementById("pwa-install");
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.remove("hidden");
  }
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener("click", () => {
    if (!deferredPrompt) return;
    pwaInstallBtn.classList.add("hidden");
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        createToast("success", "fa-solid fa-circle-check", "Installed", "Thank you for installing!");
      }
      deferredPrompt = null;
    });
  });
}

window.addEventListener("appinstalled", () => {
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.add("hidden");
  }
  deferredPrompt = null;
  createToast("success", "fa-solid fa-circle-check", "Success", "App installed successfully!");
});
