let tokens = [];
let currentTokenIndex = 0;
let tokenDiv = document.querySelector(".token");
let forwardButtonsDiv = document.querySelector(".forward_buttons");
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

function updateTokenDisplay() {
  // Hide submit button and display token and forward buttons
  submitButton.style.display = "none";
  tokenDiv.style.display = "block";
  forwardButtonsDiv.style.display = "flex";

  if (currentTokenIndex < tokens.length) {
    let token = tokens[currentTokenIndex];
    // Removes any prefix like "Token", "Token is", "Token:", or "Token is:"
    token = token.replace(/^Token(?:\s+is)?:?/i, "").trim();
    tokenDiv.textContent = token;
  } else {
    tokenDiv.textContent = "That's all";
  }
}

function extractMsg() {
  let textarea = document.querySelector("textarea");
  let tokenMsg = textarea.value;

  if (tokenMsg == "") {
    return [];
  } else {
    tokens = extractTokens(tokenMsg);
    currentTokenIndex = 0;

    if (tokens.length < 1) {
      alert("Enter Valid Message");
      return [];
    }

    updateTokenDisplay();
  }
}

let previousButton = document.querySelector(".arrow-previous");
previousButton.addEventListener("click", function () {
  currentTokenIndex = Math.max(0, currentTokenIndex - 1);
  updateTokenDisplay();
});

let nextButton = document.querySelector(".arrow-next");
nextButton.addEventListener("click", function () {
  currentTokenIndex = Math.min(tokens.length, currentTokenIndex + 1);
  updateTokenDisplay();
});

submitButton.addEventListener("click", function () {
  extractMsg();
});
