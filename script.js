let tokens = [];
let currentTokenIndex = 0;
let submitButton = document.querySelector(".submit");

function extractTokens(tokenMsg) {
  let match = tokenMsg.match(
    /Token(?:\s+is)?:?\s*(?![A-Za-z]+)([\d-]+\s*,?\s*)+/gi
  );

  if (!match) return [];

  tokens = match
    .join("")
    .replace(/-/g, " ")
    .split(/\s*,\s*/);

  //removes empty string from array
  return tokens.filter((item) => item);
}

function displayToken() {
  let tokenDiv = document.querySelector(".token");

  if (currentTokenIndex < tokens.length) {
    let token = tokens[currentTokenIndex];
    // Removes any prefix like "Token", "Token is", "Token:", or "Token is:"
    token = token.replace(/^Token(?:\s+is)?:?/i, "").trim();
    // Now it will add space after each four digits if space is missing
    tokenDiv.textContent = token
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .split(/\s*,\s*/);
  } else {
    tokenDiv.textContent = "That's all";
  }

  console.log(currentTokenIndex);
}

//Toast alert message
let notifications = document.querySelector(".notifications");
function createToast(type, icon, title, text) {
  let newToast = document.createElement("div");
  newToast.innerHTML = `
            <div class="toast ${type}">
                <i class="${icon}"></i>
                <div class="content">
                    <div class="title">${title}</div>
                    <span>${text}</span>
                </div>
                <i class="fa-solid fa-xmark" onclick="(this.parentElement).remove()"></i>
            </div>`;
  notifications.appendChild(newToast);
  newToast.timeOut = setTimeout(() => newToast.remove(), 5000);
}

function toastMsg() {
  let type = "warning";
  let icon = "fa-solid fa-triangle-exclamation";
  let title = "Warning";
  let text = "Enter valid message!";
  createToast(type, icon, title, text);
}

function extractMsg() {
  let textarea = document.querySelector("textarea");
  let tokenMsg = textarea.value;

  if (tokenMsg == "") {
    toastMsg();
    return [];
  } else {
    tokens = extractTokens(tokenMsg);
    currentTokenIndex = 0;

    if (tokens.length < 1) {
      toastMsg();
      return [];
    }
    submitButton.remove();
    createResultDiv();
    displayToken();
  }
}

function createResultDiv() {
  const tokenHtml = `
  <div class="token"></div>
  <div class="forward_buttons">
    <button class="arrow-previous">Previous Token</button>
    <button class="arrow-next">Next Token</button>
  </div>
`;

  let resultDiv = document.querySelector(".results");
  resultDiv.innerHTML = tokenHtml;
  resultDiv.classList.add("animate");

  forwardButtons();
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
}

submitButton.addEventListener("click", function () {
  extractMsg();
});
