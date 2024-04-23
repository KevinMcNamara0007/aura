function addUserInput(cur) {
  console.log("adding user input...")
  var text = cur.instructions.value;
  addUserInputText(text)
}
function addUserInputText(text) {
  let newDiv = document.createElement("div");
  newDiv.className = "responseDiv userChat";
  newDiv.innerHTML = `<div>${text}</div>`;

  var responseHTML = document.getElementById("response");
  responseHTML.insertAdjacentElement('beforeend', newDiv);
}

function displayLoader() {
  let loader = document.createElement("div");
  loader.className = "responseDiv";
  loader.id = "chatLoader";
  loader.innerHTML = `
    <div class="dot-elastic"></div>
  `;

  var responseHTML = document.getElementById("response");
  responseHTML.insertAdjacentElement('beforeend', loader);

  scrollToLast()
}

function hideLoader() {
  let loader = document.getElementById("chatLoader");
  loader.remove()
}

function scrollToLast() {
  const chatWin = document.querySelector(".chatWindow.scrollBar")
  chatWin.lastChild.scrollIntoView({ behavior: "smooth", block: "start"})
}

function insertResponseBox(targetDiv, data, index) {
  let newDiv = document.createElement("div");
  newDiv.className = "responseDiv botChat";
  newDiv.innerHTML =
    `<div class="botChatHeader">
      <div class="botProfile iconWrapper">
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path class="a" d="M20.84,2.75a152.53,152.53,0,0,0-1.79,17.88,69.39,69.39,0,0,1,7.46-.6l2.36,0-.48,2.32c-.2,1-.29,1.27-.49,2.1a38.71,38.71,0,0,1,4.8.61l2.37.68-1.2,2.15c-3.13,5.63-8.73,8-10.69,8.72A73,73,0,0,0,24.32,44c.12.57.21,1,.32,1.5M28.58,8a3.69,3.69,0,0,1,0,7.37h0a3.69,3.69,0,0,1-3.69-3.69h0A3.69,3.69,0,0,1,28.58,8Z"></path><circle class="a" cx="24" cy="24" r="21.5"></circle></g></svg>
      </div> AIA` +
      // audioFrequencyBarEle + 
    `</div>` +
    "<div class='chatText'>" +
    data +
    "</div>" +
    '<div class="responseBtns"><button id="copyButton" class="copyText iconBtn" onclick="copyToClipboard(' +
    index +
    `)">
    <svg class="autoPlayImg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.53 8L14 2.47C13.8595 2.32931 13.6688 2.25018 13.47 2.25H11C10.2707 2.25 9.57118 2.53973 9.05546 3.05546C8.53973 3.57118 8.25 4.27065 8.25 5V6.25H7C6.27065 6.25 5.57118 6.53973 5.05546 7.05546C4.53973 7.57118 4.25 8.27065 4.25 9V19C4.25 19.7293 4.53973 20.4288 5.05546 20.9445C5.57118 21.4603 6.27065 21.75 7 21.75H14C14.7293 21.75 15.4288 21.4603 15.9445 20.9445C16.4603 20.4288 16.75 19.7293 16.75 19V17.75H17C17.7293 17.75 18.4288 17.4603 18.9445 16.9445C19.4603 16.4288 19.75 15.7293 19.75 15V8.5C19.7421 8.3116 19.6636 8.13309 19.53 8ZM14.25 4.81L17.19 7.75H14.25V4.81ZM15.25 19C15.25 19.3315 15.1183 19.6495 14.8839 19.8839C14.6495 20.1183 14.3315 20.25 14 20.25H7C6.66848 20.25 6.35054 20.1183 6.11612 19.8839C5.8817 19.6495 5.75 19.3315 5.75 19V9C5.75 8.66848 5.8817 8.35054 6.11612 8.11612C6.35054 7.8817 6.66848 7.75 7 7.75H8.25V15C8.25 15.7293 8.53973 16.4288 9.05546 16.9445C9.57118 17.4603 10.2707 17.75 11 17.75H15.25V19ZM17 16.25H11C10.6685 16.25 10.3505 16.1183 10.1161 15.8839C9.8817 15.6495 9.75 15.3315 9.75 15V5C9.75 4.66848 9.8817 4.35054 10.1161 4.11612C10.3505 3.8817 10.6685 3.75 11 3.75H12.75V8.5C12.7526 8.69811 12.8324 8.88737 12.9725 9.02747C13.1126 9.16756 13.3019 9.24741 13.5 9.25H18.25V15C18.25 15.3315 18.1183 15.6495 17.8839 15.8839C17.6495 16.1183 17.3315 16.25 17 16.25Z" fill="#000000"/>
    </svg>
    </button>
    </div>`;
  targetDiv.insertAdjacentElement('beforeend', newDiv);
  scrollToLast()
}
function insertImageResponseBox(targetDiv, data) {
  let newDiv = document.createElement("div");
  newDiv.className = "responseDiv botChat";
  newDiv.innerHTML =
          `<div class="botChatHeader">
            <div class="botProfile iconWrapper">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path class="a" d="M20.84,2.75a152.53,152.53,0,0,0-1.79,17.88,69.39,69.39,0,0,1,7.46-.6l2.36,0-.48,2.32c-.2,1-.29,1.27-.49,2.1a38.71,38.71,0,0,1,4.8.61l2.37.68-1.2,2.15c-3.13,5.63-8.73,8-10.69,8.72A73,73,0,0,0,24.32,44c.12.57.21,1,.32,1.5M28.58,8a3.69,3.69,0,0,1,0,7.37h0a3.69,3.69,0,0,1-3.69-3.69h0A3.69,3.69,0,0,1,28.58,8Z"></path><circle class="a" cx="24" cy="24" r="21.5"></circle></g></svg>
            </div> AIA` +
          `</div>` +
          "<div>" +
          "<img alt='generatedImage' src='" + data + "'/>" +
          "</div>";
  targetDiv.insertAdjacentElement('beforeend', newDiv)
  scrollToLast()
}

const audioFrequencyBarEle = `
<div class="audioFrequencyBar">
<div id="audioControls" style="display: none;">
    <button id="audioControl" class="pause" onclick="handleAudioControl()">
      <div class="iconWrapper" id="pause">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4 2h6v20H4zm10 20h6V2h-6z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
      </div>
      <div class="iconWrapper" id="resume">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6 1.773l15 10.23L6 22.226z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
      </div>
    </button>
</div>
<canvas id="canvas" style="display: none;"></canvas>
</div>`;

function removeFile() {
  const fileEle = document.getElementById("file")
  fileEle.value = null;
  let fileName = document.getElementById("fileName");
  fileName.innerHTML = "";
}