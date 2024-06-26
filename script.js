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
    textarea.remove();
    submitButton.remove();

    changeMarginTop();
    createResultDiv();
    displayToken();
  }
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
  if (currentTokenIndex < tokens.length) {
    let token = tokens[currentTokenIndex];
    toksequenceEndiv.textContent = token;
  } else {
    toksequenceEndiv.textContent = "That's all";
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
