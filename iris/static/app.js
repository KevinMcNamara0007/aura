//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
	document.getElementById("textToAudio").innerHTML = "";
	recordButton.style.display = "none"
	stopButton.style.display = "block"
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia()
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();


		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
	});
}



function stopRecording() {
	recordButton.style.display = "block"
	stopButton.style.display = "none"
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;

	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var filename = "audio" + Math.floor(Math.random() * 1000) + ".wav";

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//add the new audio element to li
	li.appendChild(au);


	//add the li element to the ol
	recordingsList.appendChild(li);

	//Send straight to Translate then LLM

	var xhr=new XMLHttpRequest();
	xhr.onload=function(e) {
		if(this.readyState === 4) {
			let text = "";
			text = e.target.responseText.replaceAll(/\\n/g," ");
			text = text.replace(/"/g,'');
			let search = document.getElementById("instructions")
			if(search){
				if(search.value !== ""){
					search = document.getElementById("instructions")
					search.value = text;
					addUserInputText(text)
					evaluatePrompt()
				}
				if(search.value === ""){
					search = document.getElementById("instructions")
					search.value = text;
					addUserInputText(text)
					evaluatePrompt()
				}
			}
			else{
				search = document.getElementById("instructions")
				search.value = text;
				addUserInputText(text)
				evaluatePrompt()
			}
		}
	};
	var fd=new FormData();
	let file = new File([blob], filename);
	fd.append("file",file);
	fd.append("api_key",APIKEY);
	xhr.open("POST","/Inference/transcribeVoice",true);
	xhr.send(fd);
}