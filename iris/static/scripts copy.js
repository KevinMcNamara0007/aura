$(document).ready(function() {
    let APIKEY = localStorage.getItem("apiKey") ? localStorage.getItem("apiKey") : "";
    let modelSelector = "oai";
    let rag = "y";
    let history = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : [];
    let compressedHist = localStorage.getItem("compressedHist") ? JSON.parse(localStorage.getItem("compressedHist")) : history;

    $('#apiform').submit(function(e) {
        e.preventDefault();
        evaluatePrompt();
    });

    document.addEventListener('DOMContentLoaded', (event) => {
        const modelToggle = document.getElementById('togBtn1');
        if (modelToggle) {
          modelToggle.addEventListener('click', setModel);
        }
      
        const form = document.getElementById('apiform');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            evaluatePrompt();
          });
        }
        
        // ... other code to set up your page
      });
    function updateKey() {
        APIKEY = document.getElementById("apiKey").value;
        localStorage.setItem("apiKey", APIKEY);
    }

    function evaluatePrompt() {
        document.getElementById("soundWaveContainer").style.display = "none";
        getFillerVoice();
        let instructions = document.getElementById("instructions").value;
        if (document.getElementById("guide")) {
            document.getElementById("guide").style.display = "none";
        }
        displayLoader();

        //Disable form elements
        disableElements();

        let promptLowerCase = instructions.toLowerCase();
        const wordsToCheck = ["image", "picture", "design", "generate"];
        if (wordsToCheck.some(imageWord => promptLowerCase.includes(imageWord))) {
            console.log("Generating image");
            generateImage(instructions);
        } else {
            if (rag === "y") {
                semanticSearch();
            } else {
                console.log("No image or rag keyword detected");
                callAPI();
            }
        }
    }

    function disableElements() {
        // Code to disable elements
    }

    function enableElements() {
        // Code to enable elements
    }

    function displayLoader() {
        // Display loader
    }

    function hideLoader() {
        // Hide loader
    }

    function semanticSearch() {
        let formData = new FormData();
        formData.append("query", document.getElementById("instructions").value);
        $.ajax({
            type: "POST",
            url: "/Inference/semantic_search",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                console.log(data);
                let notes = document.getElementById("notes");
                updateNotes(data, notes);
                callAPI();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                callAPI();
            },
        });
    }

    function callAPI() {
        // Functionality for calling your backend API
    }

    function getFillerVoice() {
        // Simulate the filler voice
    }

    function generateImage(text) {
        let formData = new FormData();
        formData.append("api_key", APIKEY);
        formData.append("prompt", text);
        // Implement the image generation call
    }

    function updateNotes(data, notes) {
        if (notes && document.getElementById("notesContainer").style.display !== "none") {
            if (notes.value !== "") {
                notes.value += "\n" + "Data: " + JSON.stringify(data);
            } else {
                notes.value = "Data: " + JSON.stringify(data);
            }
        }
    }

    document.getElementById('apiKey').addEventListener('change', updateKey);
});

function displayChatHistory() {
    // Load and display the chat history
}

function loadNotes() {
    // Code to manage notes loading
}

window.onload = function() {
    displayChatHistory();
};

function clearChatHistory() {
    localStorage.removeItem("history");
    localStorage.removeItem("compressedHist");
    // Resetting all related data and display elements
}
