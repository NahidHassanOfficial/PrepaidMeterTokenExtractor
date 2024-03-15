let tokens = [];
let begin = -1,
  end = -1,
  sequence = -1,
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
    textarea.remove();
    submitButton.remove();

    changeMarginTop();
    createResultDiv();
    displayToken();
  }
}

function extractTokens(tokenMsg) {
  let match = tokenMsg.match(
    /Token(?:\s+is)?:?\s*(?![A-Za-z]+)([\d-]+\s*,?\s*)+/gi
  );

  if (!match) return [];

  tokens = match
    .join("")
    .replace(/-/g, "  ")
    .split(/\s*,\s*/);

  //Removes any prefix like "Token", "Token is", "Token:", or "Token is:"
  tokens[0] = tokens[0].replace(/^Token(?:\s+is)?:?/i, "").trim();

  //it will add space after each four digits if space is missing
  tokens.forEach((element, index) => {
    tokens[index] = element.replace(/(\d{4})(?=\d)/g, "$1  ");
  });

  //removes empty string from array
  return tokens.filter((item) => item);
}

function extractSequence(tokenMsg) {
  //pattern with or without space SquNo:- 7~11 SquNo:- 7 Sequence: 0~2 SeqNo: 5 SeqNo: 5~8
  let match = tokenMsg.match(
    /(?<=(?:Sq(?:u)?No|Sequence|SeqNo):\s*-?\s*)\d+(?:~(\d+))?/g
  );
  try {
    match.forEach((matched) => {
      let numbers = matched.split("~").map((num) => parseInt(num, 10));
      if (numbers.length == 2) {
        [begin, end] = numbers;
      } else {
        sequence = numbers[0];
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function createResultDiv() {
  let tokenHtml = `
  <div class="token" style="white-space: pre-wrap;"></div>
  <div class="forward_buttons">
    <button class="arrow-previous">Previous Token</button>
    <button class="arrow-next">Next Token</button>
  </div>
`;

  let resultDiv = document.querySelector(".results");
  resultDiv.innerHTML = tokenHtml;
  resultDiv.classList.add("animate");
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

  for (let i = 0; i < tokens.length; i++) {
    let thirdTableData = "";

    // Check if sequence information is available
    if (begin != -1 && end != -1) {
      if (begin <= end) {
        thirdTableData = begin++;
      }
    } else if (sequence !== -1 && !flag) {
      thirdTableData = sequence;
      flag++;
    }

    tableData += `
            <tr>
                <td>${i + 1}</td>
                <td>${tokens[i].replace(/  /g, " - ")}</td>
                <td>${thirdTableData}</td>
            </tr>
        `;
  }
  tableData += "</tbody>";

  let table = document.querySelector("table");
  table.innerHTML = tableData;

  table.classList.add("animate");
}

function displayToken() {
  let tokenDiv = document.querySelector(".token");
  if (currentTokenIndex < tokens.length) {
    let token = tokens[currentTokenIndex];
    tokenDiv.textContent = token;
  } else {
    tokenDiv.textContent = "That's all";
  }
  updateNthChildValue(currentTokenIndex + 1);
}

function changeMarginTop() {
  var section = document.querySelector("section");
  var totalToken = tokens.length * 10;
  section.style.marginTop = Math.min(150 - Math.abs((totalToken -= 50))) + "px";
}

function updateNthChildValue(nthChildValue) {
  let styleTag = document.querySelector("style");
  let cssText = `tbody tr:nth-child(${nthChildValue}){
  color:white; 
  background-color: darkcyan;
}
tbody tr:nth-child(${nthChildValue}) td{
  border:1px solid white;
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
