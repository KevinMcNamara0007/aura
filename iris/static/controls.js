/**Base Control code */
let APIKEY = localStorage.getItem("apiKey") ? localStorage.getItem("apiKey") : "";

let modelSelecter = "oai";
let rag = "y";

function updateKey(){
  APIKEY = document.getElementById("apiKey").value;
  localStorage.setItem("apiKey", APIKEY)
}

let history = localStorage.getItem("history")
  ? JSON.parse(localStorage.getItem("history"))
  : [];

let compressedHist = localStorage.getItem("compressedHist")
        ? JSON.parse(localStorage.getItem("compressedHist"))
        : history;

$("#apiform").submit(function (e) {
  e.preventDefault();
});

function evaluatePrompt(){
  document.getElementById("soundWaveContainer").style.display = "none";
  getFillerVoice();
  let instructions = document.getElementById("instructions").value;
  if (document.getElementById("guide")) {
    document.getElementById("guide").style.display = "none";
  }
  displayLoader()

  //Disable form elements
  disableElements()


  let promptLowerCase = instructions.toLowerCase();
  const wordsToCheck = ["image", "picture", "design", "generate"];
  if(wordsToCheck.some(imageWord => promptLowerCase.includes(imageWord))){
    console.log("generating Image")
    generateImage(instructions)
  }else{
    if(rag === "y"){
      semanticSearch()
    }else{
      console.log("no image or rag key word detected")
      callAPI()
    }
  }
}

function semanticSearch(){
  let formData = new FormData();
  let instructions = document.getElementById("instructions").value;
  formData.append("query", instructions)
  $.ajax({
    type: "POST",
    url: "/Inference/semantic_search",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      console.log(data)
      let notes = document.getElementById("notes");
      if (notes && document.getElementById("notesContainer").style.display !== "none") {
        if (notes.value !== "") {
          notes = document.getElementById("notes");
          data.forEach((item, index)=>{
            notes.value = notes.value + "\n" + "File Text " + index + ": " + item.content
          })
        }
        if (notes.value === "") {
          notes = document.getElementById("notes");
          data.forEach((item, index)=>{
            notes.value = "\n" + "File Text " + index + ": " + item.content
          })
        }
      } else {
        loadNotes();
        notes = document.getElementById("notes");
        data.forEach((item, index)=>{
          notes.value = "\n" + "File Text " + index + ": " + item.content
        })
      }
      callAPI()
    },
    error: function (xhr, ajaxOptions, thrownError) {
      callAPI()
    },
  });
}

function callAPI() {
  historyLogMaintenance()
  let notes = document.getElementById("notes");
  let instructions = document.getElementById("instructions").value;
  let formData = new FormData();
  formData.append("api_key", APIKEY);
  if (notes) {
    if (notes.value !== "") {
      formData.append("notes", notes.value);
    }
  }
  formData.append("history", JSON.stringify(compressedHist));
  console.log(formData.get("history"));
  formData.append("prompt", instructions);

  let responseHTML = document.getElementById("response");

  document.getElementById("textAudioContainer").style.display = "none";
  document.getElementById("soundWaveContainer").style.display = "none";
  //remove notes
  document.getElementById("notesContainer").style.display = "none";
  document.getElementById("clearHistoryDiv").style.display = "block";

  if(modelSelecter === "oai"){
    $.ajax({
      type: "POST",
      url: "/Inference/freestyle",
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        if(notes){
          notes.value = "";
        }
        //Remove Loader
        // document.getElementById("loaderContainer").style.display = "none";
        // document.getElementById("loaderContainer").innerHTML = "";
        hideLoader()
        //show Response
        responseHTML.style.display = "flex";

        //Get Audio For Response
        getTextToAudio(data);

        let assistantResponse = data.replaceAll(/\\n/g, " ");
        //Save response history
        let userObject = { role: "user", content: instructions };
        let assistantObject = {
          role: "assistant",
          content: assistantResponse,
        };
        history.push(userObject);
        history.push(assistantObject);
        compressedHist.push(assistantObject);
        localStorage.setItem("history", JSON.stringify(history));
        localStorage.setItem("compressedHist", JSON.stringify(compressedHist))

        //Display Response
        insertResponseBox(responseHTML, data, history.indexOf(assistantObject))
      },
      error: function (xhr, ajaxOptions, thrownError) {
        // document.getElementById("loaderContainer").style.display = "none";
        hideLoader()
        alert("OpenAI Failed to load response, try again");
      },
    });
  }else{
    callELF();
  }
}

function callELF(){
  let formData = new FormData();
  let instructions = document.getElementById("instructions").value;
  let notes = document.getElementById("notes");
  if (notes) {
    if (notes.value !== "") {
      instructions = instructions + " /n notes: /n" + notes.value;
    }
  }
  formData.append("prompt", instructions);
  formData.append("messages", JSON.stringify(compressedHist));

  let responseHTML = document.getElementById("response");
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8000/Inference/ask_an_expert",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      if(notes){
        notes.value = "";
      }
      //Remove Loader
      // document.getElementById("loaderContainer").style.display = "none";
      // document.getElementById("loaderContainer").innerHTML = "";
      hideLoader()
      //show Response
      responseHTML.style.display = "flex";

      //Get Audio For Response
      getTextToAudio(data.choices[0].message.content);

      let assistantResponse = data.choices[0].message.content.replaceAll(/\\n/g, " ");
      //Save response history
      let userObject = { role: "user", content: instructions };
      let assistantObject = {
        role: "assistant",
        content: assistantResponse,
      };
      history.push(userObject);
      history.push(assistantObject);
      compressedHist.push(assistantObject);
      localStorage.setItem("history", JSON.stringify(history));
      localStorage.setItem("compressedHist", JSON.stringify(compressedHist));

      //Display Response
      insertResponseBox(responseHTML, data.choices[0].message.content, history.indexOf(assistantObject))
    },
    error: function (xhr, ajaxOptions, thrownError) {
      // document.getElementById("loaderContainer").style.display = "none";
      hideLoader()
    },
  });
}

function historyLogMaintenance(){
  let formData = new FormData();
  formData.append("api_key", APIKEY)
  formData.append("history", JSON.stringify(compressedHist))
  $.ajax({
    type: "POST",
    url: "/Inference/history_management",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      if(data !== null){
        let removeSpecialCharacters = data.replaceAll(/\n/g,'');
        removeSpecialCharacters = removeSpecialCharacters.replaceAll('```','');
        removeSpecialCharacters = removeSpecialCharacters.replaceAll('json','');
        try{
          compressedHist = JSON.parse(removeSpecialCharacters);
        }catch (e) {
          console.log(e)
        }
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log("history management could not be done")
    },
  });
}

function displayChatHistory(){
  let responseHTML = document.getElementById("response");
  if(history.length > 1){
    document.getElementById("textAudioContainer").style.display =
            "flex";
    history.forEach((item)=> {
      if(item.role.includes("user")){
        addUserInputText(item.content)
      }else{
        insertResponseBox(responseHTML, item.content, history.indexOf(item))
      }
    })
  }
}

function loadNotes() {
  let notesHTML = document.getElementById("notesContainer");

  if(notesHTML.style.display === "block") {
    notesHTML.style.display = "none"
  }
  else {
    notesHTML.innerHTML =
    '<div><label>Notes</label><textarea id="notes"></textarea></div>';
    notesHTML.style.display = "block";
  }
}
function getImageText() {
  let instructions = document.getElementById("instructions");
  if(modelSelecter === "oai"){
    if(instructions.value){
      //UE functions
      document.getElementById("soundWaveContainer").style.display = "none";
      if (document.getElementById("guide")) {
        document.getElementById("guide").style.display = "none";
      }
      document.getElementById("textAudioContainer").style.display = "none";
      document.getElementById("soundWaveContainer").style.display = "none";
      //remove notes
      document.getElementById("notesContainer").style.display = "none";
      document.getElementById("clearHistoryDiv").style.display = "block";
      disableElements()

      addUserInputText(instructions.value)
      displayLoader()
      let formData = new FormData();
      formData.append("prompt", instructions.value);
      formData.append("file", $("#image")[0].files[0]);
      formData.append("api_key", APIKEY);
      $.ajax({
        method: "POST",
        url: "/Inference/image_text_extraction",
        data: formData,
        enctype: "multipart/form-data",
        processData: false,
        contentType: false,
        success: function (result) {
          hideLoader();
          enableElements();
          let responseHTML = document.getElementById("response");
          //show Response
          responseHTML.style.display = "flex";

          //Get Audio For Response
          getTextToAudio(result.message.content);

          let assistantResponse = result.message.content.replaceAll(/\\n/g, " ");
          //Save response history
          let userObject = { role: "user", content: instructions };
          let assistantObject = {
            role: "assistant",
            content: assistantResponse,
          };
          history.push(userObject);
          history.push(assistantObject);
          compressedHist.push(assistantObject);
          localStorage.setItem("compressedHist", JSON.stringify(compressedHist));
          localStorage.setItem("history", JSON.stringify(history));

          //Display Response
          insertResponseBox(responseHTML, result.message.content, history.indexOf(assistantObject))
          $("#image").val(null)
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
          hideLoader()
          enableElements();
          $("#image").val(null)
          alert("OpenAI could not process your request, please try a different prompt and add your image again");
        },
      });
    }else{
      $("#image").val(null)
      alert("Please include a prompt for your image and add your image again")
    }
  }else{
    elfImageExtractor()
  }
}

function getFillerVoice(){
        // document.getElementById("soundWaveContainer").style.display = "flex";
        // const audioPopup = document.getElementById("audioPopup")
        // const audioLoader = document.getElementById("audioLoader")
        // const audioBar = document.getElementById("audioFrequencyBar")
        // audioPopup.style.display = "flex"
        // audioLoader.style.display = "block"
        // audioBar.style.display = "none"
        // let audio = document.getElementById("textToAudio");
        let randomNum = Math.floor(Math.random() * (11 - 1 + 1)) + 1;
        showAudioFrequencyBar(autoplay, "audio/filler" + randomNum + ".wav")
}

function elfImageExtractor(){
  if (document.getElementById("guide")) {
    document.getElementById("guide").style.display = "none";
  }
  displayLoader()
  let formData = new FormData();
  formData.append("image", $("#image")[0].files[0]);
  $.ajax({
    method: "POST",
    url: "http://127.0.0.1:8000/Images/text_extraction",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
    success: function (result) {
      if(result !== null){
        displayImageText(result);
      }else{
        $("#image").val(null)
        hideLoader()
        alert("Elf Failed to extract image text")
      }
    },
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      $("#image").val(null)
      hideLoader()
      alert("Elf Failed to extract image text")
    }
  });
}

function displayImageText(text){
  hideLoader()
  $("#image").val(null)
  let notes = document.getElementById("notes");
  if (notes && document.getElementById("notesContainer").style.display !== "none") {
    if (notes.value !== "") {
      notes = document.getElementById("notes");
      notes.value =
              notes.value +
              "\nImage Text:\n" +
              text;
    }
    if (notes.value === "") {
      notes = document.getElementById("notes");
      notes.value = text;
    }
  } else {
    loadNotes();
    notes = document.getElementById("notes");
    notes.value = text;
  }
}

function ragExtract(){
  document.getElementById("myPopup").style.display = "none";
  let formData = new FormData();
  let file = document.getElementById("file").files[0];
  if (file !== undefined) {
    formData.append("file", file);
    formData.append("api_key", APIKEY);
    formData.append("rag", "y");
  }
  if (document.getElementById("guide")) {
    document.getElementById("guide").style.display = "none";
  }
  displayLoader()
  $.ajax({
    method: "POST",
    url: "/Inference/file_text_extraction",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
    success: function (result) {
      $("#file").val(null)
      hideLoader()
      alert("Successfully added file permanently, ready to query against")
    },
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      hideLoader()
      $("#file").val(null)
      alert("Failed to Permanently add file, try again");
    },
  });
}

function deleteAllFiles(){
  $.ajax({
    method: "GET",
    url: "/Inference/reset_rag_data",
    processData: false,
    contentType: false,
    success: function (result) {
      alert("All Files have been deleted")
    },error: function ajaxError(jqXHR, textStatus, errorThrown) {

    }
  })
}
function getFileText() {
  document.getElementById("myPopup").style.display = "none";
  let formData = new FormData();
  let file = document.getElementById("file").files[0];
  if (file !== undefined) {
    formData.append("file", file);
  }
  if (document.getElementById("guide")) {
    document.getElementById("guide").style.display = "none";
  }
  displayLoader()
  $.ajax({
    method: "POST",
    url: "/Inference/file_text_extraction",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
    success: function (result) {
      $("#file").val(null)
      let notes = document.getElementById("notes");
      if (notes && document.getElementById("notesContainer").style.display !== "none") {
        if (notes.value !== "") {
          notes = document.getElementById("notes");
          notes.value =
                  notes.value +
                  "\nFile Text:\n" +
                  result;
        }
        if (notes.value === "") {
          notes = document.getElementById("notes");
          notes.value = result;
        }
      } else {
        loadNotes();
        notes = document.getElementById("notes");
        notes.value = result;
      }
      hideLoader()
      alert("File converted to text, check notes");
    },
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      hideLoader()
      alert("Failed to get File Text");
    },
  });
}

window.onload = function () {
  document.getElementById("stopButton").style.display = "none";
  document.getElementById("textAudioContainer").style.display = "none";
  document.getElementById("showVoiceRecordingDiv").style.display = "none";
  document.getElementById("loaderContainer").style.display = "none";
  document.getElementById("apiKey").value = APIKEY;
  displayChatHistory();
  if(history.length < 1){
    document.getElementById("clearHistoryDiv").style.display = "none";
    document.getElementById("response").innerHTML = guideDiv;
  }
};
function showVoiceRecorder() {
  document.getElementById("showVoiceRecordingDiv").style.display =
    "block";

  document.getElementById("soundWaveContainer").style.display = "block";
}
function hideVoiceRecorder() {
  document.getElementById("showVoiceRecordingDiv").style.display = "none";
}
function clearChatHistory() {
  localStorage.removeItem("history");
  history = [];
  localStorage.removeItem("compressedHist");
  compressedHist = [];
  document.getElementById("textAudioContainer").style.display = "none";
  document.getElementById("response").innerHTML = guideDiv;
  document.getElementById("textToAudio").innerHTML = "";
  document.getElementById("clearHistoryDiv").style.display = "none";
}

function generateImage(text){
  let formData = new FormData();
  formData.append("api_key", APIKEY);
  formData.append("prompt", text);
  document.getElementById("clearHistoryDiv").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/Inference/imageGeneration",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      let responseHTML = document.getElementById("response");
      //show Response
      responseHTML.style.display = "flex";

      insertImageResponseBox(responseHTML, data)

      //Enable All Form Elements and Disable Loader
      enableElements()
      hideLoader()
    },
    error: function (xhr, ajaxOptions, thrownError) {
      //Enable All Form Elements and disable loader
      enableElements()
      hideLoader()
      alert("Could not generate image, try again");
    },
  });
}

let autoplay = true;
function getTextToAudio(text) {
  const audioPopup = document.getElementById("audioPopup")
  const audioLoader = document.getElementById("audioLoader")
  const audioBar = document.getElementById("audioFrequencyBar")
  audioPopup.style.display = "flex"
  audioLoader.style.display = "block"
  audioBar.style.display = "none"

  let formData = new FormData();
  formData.append("text", text);
  formData.append("api_key", APIKEY);
  $.ajax({
    type: "POST",
    url: "/Inference/textToVoice",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      //Enable All Form Elements
      enableElements()

      let audio = document.getElementById("textToAudio");
      showAudioFrequencyBar(autoplay, data)
    },
    error: function (xhr, ajaxOptions, thrownError) {
      //Enable All Form Elements
      enableElements()
      alert("Could not get audio for this response due to length");
    },
  });
}

function enableElements(){
  //Enable All Form Elements
  $('#apiform').prop('disabled', false);
  $('#instructions').prop('disabled', false);
  $('#notesButton').prop('disabled', false);
  $('#recordButton').prop('disabled', false);
  $('#image').prop('disabled', false);
  $('#file').prop('disabled', false);
  $('#searchButton').prop('disabled', false);
  $('#searchButton').removeClass('disabled');
  $('#imageButton').removeClass('disabled');
  $('#fileButton').removeClass('disabled');
  $('#instructions').val("");
}

function disableElements(){
  //Disable All Form Elements To Wait for response
  $('#apiform').prop('disabled', true);
  $('#instructions').prop('disabled', true);
  $('#notesButton').prop('disabled', true);
  $('#recordButton').prop('disabled', true);
  $('#image').prop('disabled', true);
  $('#file').prop('disabled', true);
  $('#searchButton').prop('disabled', true);
  $('#searchButton').addClass('disabled');
  $('#imageButton').addClass('disabled');
  $('#fileButton').addClass('disabled');
}

function setAutoPlay() {
    let autoPlayBtn = document.getElementById('togBtn')
    if (autoPlayBtn.checked) {
      autoplay = true
    }
    else {
      autoplay = false
    }
}

function setModel() {
  let modelBtn = document.getElementById('togBtn1')
  if (modelBtn.checked) {
    modelSelecter = "oai"
    console.log(modelSelecter)
  }
  else {
    modelSelecter = "elf"
    console.log(modelSelecter)
  }
}

function setRag(){
  let ragBtn = document.getElementById('togBtn2')
  if (ragBtn.checked) {
    rag = "y"
    console.log(rag)
  }
  else {
    rag = "n"
    console.log(rag)
  }
}

function popUpToggle() {
  document.getElementById("myPopup").style.display = "block";
}

function copyToClipboard(index) {
  // Copies the text to clipboard
  navigator.clipboard.writeText(history[index].content);
}

const guideDiv = 
`<div id="guide">
  <span>Hi there, my name is Aura.  I am here to assist you. Feel free to us natural language to help me understand what you need.
  </span>
  <div class="example">
  Please see some examples of ways that you can ask for assistance:
  <br>   
  Generate me an image of a dog holding ice cream cones.
  <img src="assets/dog.png" alt="dog">
  </div>
  <div class="example">
    Draft a business plan for the Research and Development team for 2024
    <div>
    <b>Business Plan for Research and Development Team 2024</b>\n\n1. Executive Summary:\nThe objective for 2024 is to enhance our organization's market position by developing innovative products and improving existing ones, ensuring they are sustainable, cost-effective, and meet consumer needs. We aim for a 15% growth in our product line's market share by Q4 2024.\n\n2. Team Structure and Roles:\n- Head of R&D: Overseeing all R&D activities...\n
    </div>
  </div>
</div>`
