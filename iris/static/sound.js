// Define variables for audio context and visualizer components
var context; // AudioContext, for managing and playing sounds
var analyser;
var source;
var request; // Used for animation frame request
var flag = 0; // Used to control the draw loop
var wrapper; // Will hold the reference to the 'audioFrequencyBar' for control
var height;
var frequencyArray = [];

// Assuming that there is an element with id 'responseAudio' in your HTML
const audio = document.getElementById("responseAudio");

// Add an event listener to the document to initialize the AudioContext on a user interaction
document.addEventListener('click', function initAudioContext() {
  if (!context && audio) {
    // Use a fallback for webkit browsers
    context = new (window.AudioContext || window.webkitAudioContext)();
    // Create a media element source only once
    source = context.createMediaElementSource(audio);
    source.connect(context.destination);
    audio.play().catch(e => console.error("Error playing audio:", e));
    console.log("play silent audio...");
  }
}, { once: true });

// Set up the rest of the environment once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  var submitButton = document.querySelector('button[type="submit"]');
  var sound = document.getElementById('button-sound'); // Ensure this element exists in your HTML

  if (submitButton && sound) {
    submitButton.addEventListener('click', function() {
      sound.play();
    });
  }

  // Initialize visualizer components
  wrapper = document.getElementById("audioFrequencyBar");
  const audioPopup = document.getElementById("audioPopup");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const bars = 100; // Number of bars in the visualizer

  // Other initialization code can go here
});

// Define the rest of your functions

function showAudioFrequencyBar(autoPlay, filepath) {
  audio.src = filepath;
  audio.load();

  audio.addEventListener("canplay", initAudioAnalyzer);
  audio.addEventListener("ended", closeVisualizer);
  audio.addEventListener("play", beginDraw);
  audio.addEventListener("pause", stopDraw);

  function initAudioAnalyzer() {
    if (!analyser) {
      analyser = context.createAnalyser();
      source.connect(analyser);
      analyser.connect(context.destination);
    }
    frequencyArray = new Uint8Array(analyser.frequencyBinCount);
    showAudioResponseEle();
    canvas.style.display = "block";
    if (autoPlay) {
      updateAudioControlStyle("on");
      audio.play();
    } else {
      updateAudioControlStyle("off");
      audio.pause();
    }
  }
}

function beginDraw() {
  flag = 0;
  drawCanvas();
}

function stopDraw() {
  flag = 1;
}

function closeVisualizer() {
  if (request) {
    cancelAnimationFrame(request);
  }
  audio.src = "";
  canvas.style.display = "none";
  wrapper.style.display = "none";
  audioPopup.style.display = "none";
}

function drawCanvas() {
  if (flag === 0) {
    request = requestAnimationFrame(drawCanvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(frequencyArray);

    ctx.fillStyle = "rgb(0, 69, 255)";
    const barWidth = 2;
    const scale = 1.1;
    for (let i = 0; i < bars; i++) {
      const barX = i * 3;
      const barHeight = frequencyArray[i] / 2;
      const barY = canvas.height / 2 - barHeight / 2; // Align in the middle of canvas
      ctx.fillRect(barX, barY, barWidth, barHeight * scale);
    }
  }
}

function handleAudioControl() {
  const control = document.querySelector("#audioControls");
  if (control.classList.contains("pause")) {
    control.classList.remove("pause");
    control.classList.add("resume");
    audio.pause();
  } else {
    control.classList.remove("resume");
    control.classList.add("pause");
    audio.play();
  }
}

function handleAudioVolume() {
  const control = document.querySelector("#audioVolume");
  if (control.classList.contains("unmuted")) {
    control.classList.remove("unmuted");
    control.classList.add("muted");
    audio.muted = true;
  } else {
    control.classList.remove("muted");
    control.classList.add("unmuted");
    audio.muted = false;
  }
}

function updateAudioControlStyle(status) {
  const control = document.querySelector("#audioControls");
  if (status === "off") {
    control.classList.remove("pause");
    control.classList.add("resume");
  } else if (status === "on") {
    control.classList.remove("resume");
    control.classList.add("pause");
  }
}

function showAudioResponseEle() {
  const loader = document.getElementById("audioLoader");
  loader.style.display = "none";
  wrapper.style.display = "flex";
}
