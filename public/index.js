var audioSampleNames = [
	"kick.wav",
	"snare.wav",
	"closed_hh.wav"
];

function audioSetUp() {
	var timeTable = [];	
	var i = 0;
	for(sample of audioSampleNames) {
		makeRow(timeTable, 16, sample, i);
		i++;
	}
	var sampleList = generateAudioSamples(audioSampleNames);
	var audioPlayer = generateAudioPlayer(sampleList, timeTable);
	updateTimeSignature(audioPlayer);
	document.getElementById("play-button").addEventListener("click", function() { audioPlayer.beginLoop(audioPlayer) });
	document.getElementById("pause-button").addEventListener("click", function() { audioPlayer.pause(audioPlayer) });
	document.getElementById("stop-button").addEventListener("click", function() { audioPlayer.stop(audioPlayer) });
	$("#numerator-input").change(function() { updateTimeSignature(audioPlayer) });
	$("#denominator-input").change(function() { updateTimeSignature(audioPlayer) });
	$("#bpm-input").change(function() { audioPlayer.updateSubBeatLength(audioPlayer) });
}

function updateTimeSignature(audioPlayer) {
	if(document.getElementById("highlighter-container")) {
		document.getElementById("highlighter-container").remove();
	}
	addHighlighter(document.getElementById("numerator-input").value, document.getElementById("denominator-input").value);
	if(audioPlayer.playing) {
		audioPlayer.stop(audioPlayer);
	}
	audioPlayer.currentSubBeat = 0;
	audioPlayer.table = []

	var childList = document.getElementsByClassName("row");
	while(childList[1]) {
		childList[1].remove();
	}

	var numerator = document.getElementById("numerator-input").value;
	var subdivisions = denominatorToSubdivisions(document.getElementById("denominator-input").value);
	var i = 0;
	for(sample of audioSampleNames) {
		makeRow(audioPlayer.table, numerator * subdivisions, sample, i);
		i++;
	}
}

function denominatorToSubdivisions(denominator) {
	if(denominator <= 4) {
		return 4;
	} else {
		return 2;
	}
}

function generateAudioSamples(audioSampleNames) {
	var sampleList = [];
	for(sound of audioSampleNames) {
		var audio = document.createElement("audio");
		var audioSource = document.createElement("source");
		audioSource.setAttribute("src", "audio/" + sound);
		audio.appendChild(audioSource);
		document.getElementById("audio-holder").appendChild(audio);
		sampleList.push(audio);
	}
	return sampleList;
}


function generateAudioPlayer(sampleList, timeTable) {
	var audioPlayer = {
		samples:sampleList,
		table:timeTable,
		currentSubBeat:0,
		loop:null,
		playing:false,
		subBeatLength: null,
		updateSubBeatLength: function(audioPlayer) {
			var bpm = document.getElementById("bpm-input").value;
			var denominator = document.getElementById("denominator-input").value;
			/*	bdr = beats denominator represents */
			/*	(1 min / x beats) * (60 sec / 1 min) * (1000 ms / 1 sec) * (4 beats / y bdr) * (1 bdr / 4 originalsubdivisions) */
			audioPlayer.subBeatLength = (60 * 1000 * 4) / (bpm * denominator * 4);
		},
		beginLoop: function(audioPlayer) {
			if(!audioPlayer.playing) {
				audioPlayer.playing = true;
				audioPlayer.updateSubBeatLength(audioPlayer);
				audioPlayer.loopFunction(audioPlayer);
			}
		},
		loopFunction: function(audioPlayer) {
			if(audioPlayer.playing) {

				var i;		
				for(i = 0; i < audioPlayer.table.length; i++) {
					if(audioPlayer.table[i][audioPlayer.currentSubBeat]) {
						audioPlayer.samples[i].currentTime = 0;
						audioPlayer.samples[i].play();
					}
					var id = i + "-" + audioPlayer.currentSubBeat;
					var last_id = i + "-" + ((this.currentSubBeat + audioPlayer.table[0].length - 1) % audioPlayer.table[0].length);
					document.getElementById(id).classList.add("playing");

					var last_box = document.getElementById(last_id);
					if(last_box.classList.contains("playing")) {
						last_box.classList.remove("playing");
					}
				}
				audioPlayer.currentSubBeat = (audioPlayer.currentSubBeat + 1) % audioPlayer.table[0].length;

				setTimeout(function() {audioPlayer.loopFunction(audioPlayer)}, audioPlayer.subBeatLength);
			}
		},
		pause: function(audioPlayer) {
			audioPlayer.playing = false
			clearInterval(audioPlayer.loop)
		},
		stop: function(audioPlayer) {
			audioPlayer.pause(audioPlayer);
			var i;
			for(i = 0; i < audioPlayer.table.length; i++) {
				/*	The -1 is because the sub beat is incremented as the last thing in the loop	*/
				var id = i + "-" + ((this.currentSubBeat + audioPlayer.table[0].length - 1) % audioPlayer.table[0].length);
				var box = document.getElementById(id);
				if(box.classList.contains("playing")) {
					box.classList.remove("playing");
				}
			}
			audioPlayer.currentSubBeat = 0;
		}
	};
	return audioPlayer;
}

function addHighlighter(numerator, denominator) {
	var highlighterContainer = document.createElement("div");
	highlighterContainer.setAttribute("id","highlighter-container");

	var beatContainer = document.getElementById("beat-container");
	beatContainer.insertBefore(highlighterContainer, beatContainer.children[1]);

	var numBoxes = numerator * denominatorToSubdivisions(denominator);
	console.log(numBoxes);

	if(numerator % 6 == 0) {
		console.log("in 3")
		var numHighlights = numBoxes / 6;
	} else {
		var numHighlights = numBoxes / 4;
	}
	console.log(numHighlights);
	var i;
	for(i = 0; i < numHighlights; i++) {
		var highlight = document.createElement("div");
		var width = 100 / numHighlights;
		highlight.setAttribute("class","highlight");
		highlight.textContent = i + 1;
		highlight.style.width = width + "%";
		
		highlighterContainer.appendChild(highlight);
	}
	
}

function makeRow(timeTable, numBoxes, soundName, rowNumber) {
	var row = document.createElement("div");
	row.setAttribute("class","row")

	var label = document.createElement("div");
	label.textContent = soundName + ":";
	row.appendChild(label);

	var boxes = document.createElement("div");
	boxes.setAttribute("class","boxes");

	var i;
	var innerTimeTable = [];
	for(i = 0; i < numBoxes; i++) {
		var newBox = createBoxObject(timeTable, rowNumber, i);
		var id = rowNumber + "-" + i;
		newBox.DOMElement.setAttribute("id", id);
		boxes.appendChild(newBox.DOMElement);
		innerTimeTable.push(newBox.activated);
	}
	timeTable.push(innerTimeTable);

	row.appendChild(boxes);

	document.getElementById("beat-container").appendChild(row);
}

function createBoxObject(timeTable, rowNumber, columnNumber) {
	var box = document.createElement("div");
	box.setAttribute("class","box off");

	var boxObject = {
		table:timeTable,
		row:rowNumber,
		col:columnNumber,
		DOMElement:box,
		activated:false,
		turnOff:function() {
			this.DOMElement.setAttribute("class","box off");
			this.activated = !this.activated;
		},
		turnOn:function() {
			this.DOMElement.setAttribute("class","box on");
			this.activated = !this.activated;
		},
		toggle:function() {
			if(this.activated) {
				this.turnOff();
			} else {
				this.turnOn();
			}
		},
		clickListener:null
	}

	box.clickListener = boxObject.DOMElement.addEventListener("click", function() { boxClick(boxObject) });

	return boxObject;
}

function boxClick(boxObject) {
	boxObject.toggle();
	boxObject.table[boxObject.row][boxObject.col] = boxObject.activated;
}

/*	Shit happens */

audioSetUp();

/*
var i = 100;

function incI() {
	console.log(i);
	i += 100;
	setTimeout(incI, i);
}

var timer = setTimeout(incI, i)
*/

