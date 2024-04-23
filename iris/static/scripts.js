// Global variables
let APIKEY = localStorage.getItem("apiKey") ? localStorage.getItem("apiKey") : "";
let modelSelector = "oai"; // corrected from "modelSelecter" to "modelSelector" for consistency
let rag = "y";
let history = localStorage.getItem("history") ? JSON.parse(localStorage.getItem("history")) : [];
let compressedHist = localStorage.getItem("compressedHist") ? JSON.parse(localStorage.getItem("compressedHist")) : history;

$(document).ready(function() {
    // Event handler for API key input change
    $('#apiKey').change(function() {
        updateKey();
    });

    // Form submission event handler
    $('#apiform').on('submit', function(e) {
        e.preventDefault();
        evaluatePrompt();
    });

    // Additional initializations or operations to perform after DOM is fully loaded
    displayChatHistory();
});

// Updates the API key stored in local storage
function updateKey() {
    APIKEY = $('#apiKey').val();
    localStorage.setItem("apiKey", APIKEY);
}

// Placeholder function for setting the model
function setModel() {
    // Placeholder implementation - Update this based on actual requirements
    modelSelector = $('#togBtn1').is(':checked') ? 'model1' : 'model2';
    console.log("Model selected: " + modelSelector);
    // Additional logic for setting the model based on the checkbox
}

// Processes the form submission and evaluates the prompt
function evaluatePrompt() {
    $('#soundWaveContainer').hide();
    getFillerVoice();
    let instructions = $('#instructions').val();
    $('#guide').hide();
    displayLoader();
    disableElements();

    let promptLowerCase = instructions.toLowerCase();
    const wordsToCheck = ["image", "picture", "design", "generate"];
    if (wordsToCheck.some(word => promptLowerCase.includes(word))) {
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

// Disables form elements to prevent repeated submissions
function disableElements() {
    $('#apiform input, #apiform button').prop('disabled', true);
}

// Enables form elements after an operation completes
function enableElements() {
    $('#apiform input, #apiform button').prop('disabled', false);
}

// Displays a loader during asynchronous operations
function displayLoader() {
    $('#loader').show();
}

// Hides the loader when operations complete
function hideLoader() {
    $('#loader').hide();
}

// Performs a semantic search using the server
function semanticSearch() {
    let formData = new FormData();
    formData.append("query", $('#instructions').val());
    $.ajax({
        type: "POST",
        url: "/Inference/semantic_search",
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log(data);
            updateNotes(data);
            callAPI();
        },
        error: function(xhr, status, error) {
            console.log("Error in semantic search: " + error);
            callAPI();
        }
    });
}

// Placeholder function for calling your backend API
function callAPI() {
    console.log("API called with key: " + APIKEY);
    // Add actual API calling code here
}

// Simulates a filler voice during processing
function getFillerVoice() {
    console.log("Simulating filler voice...");
}

// Generates an image based on the provided text
function generateImage(text) {
    let formData = new FormData();
    formData.append("api_key", APIKEY);
    formData.append("prompt", text);
    // Add your image generation API calling code here
}

// Updates the notes with data from the server
function updateNotes(data) {
    let notes = $('#notes');
    if (notes.length && notes.is(':visible')) {
        let currentText = notes.val();
        notes.val(currentText + "\n" + "Data: " + JSON.stringify(data));
    }
}

// Displays chat history on page load
function displayChatHistory() {
    console.log("Displaying chat history...");
    // Load and display the chat history
}

// Clears the chat history stored in local storage
function clearChatHistory() {
    localStorage.removeItem("history");
    localStorage.removeItem("compressedHist");
    console.log("Chat history cleared.");
}

// Called on window load to display the chat history
window.onload = function() {
    displayChatHistory();
};

/* Commenting out references to elements not present in the provided HTML
var stopButton = document.getElementById('stopButton');
if (stopButton) {
    stopButton.addEventListener('click', function() {
        // Your code here...
    });
}

var canvas = document.getElementById('myCanvas');
if (canvas) {
    var ctx = canvas.getContext('2d');
    // Your canvas code here...
} else {
    console.log('Canvas element not found!');
}
*/
