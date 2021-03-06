var audioSampleNames = [
	"kick.wav",
	"snare.wav",
	"closed_hh.wav"
];

function betterAudioSetUp() {
	for(sample of audioSampleNames) {
		var newSoundLabel = document.createElement("div");
		newSoundLabel.textContent = sample;
		newSoundLabel.setAttribute("class","row pads");
		document.getElementById("sound-labels-container").appendChild(newSoundLabel);
	}
	var timeTable = timeSigChange();
	var sampleList = generateAudioSamples(audioSampleNames);
	var audioPlayer = generateAudioPlayer(sampleList, timeTable);

	document.getElementById("play-button").addEventListener("click", function() { 
		console.log("click play");
		audioPlayer.beginLoop(audioPlayer);
	 });
	var pause_listener = document.getElementById("pause-button").addEventListener("click", function() { 
		console.log("click pause");
		audioPlayer.pause(audioPlayer) ;
	});
	document.getElementById("stop-button").addEventListener("click", function() { 
		console.log("click stop");
		audioPlayer.stop(audioPlayer) 
	});
	$("#numerator-input").change(function() { betterUpdateTimeSignature(audioPlayer) });
	$("#denominator-input").change(function() { betterUpdateTimeSignature(audioPlayer) });
	$("#bpm-input").change(function() { audioPlayer.updateSubBeatLength(audioPlayer) });
	document.addEventListener("keypress", function(e) { 
		if(e.code == "Space") {
			spaceFunction(audioPlayer);
		}
	});

}

function betterUpdateTimeSignature(audioPlayer) {
	if(document.getElementById("numerator-input").value <= 0) {
		document.getElementById("numerator-input").value = 1;
	}
	console.log(document.getElementById("bpm-input").value);
	if(document.getElementById("bpm-input").value <= 0) {
		console.log(document.getElementById("bpm-input").value);
		document.getElementById("bpm-input").value = 1;
	}
	audioPlayer.stop(audioPlayer);
	audioPlayer.table = timeSigChange(audioPlayer);
}

function timeSigChange(audioPlayer) {
	var curbeats = document.getElementById("beats-container").children;
	for(var i = curbeats.length - 1; i > 0; i--) {
		curbeats[i].remove();
	}

	var timeTable = [];	
	var i = 0;
	var numBeats = createBeatDivs();

	var timeTable = [];
	for(sample in audioSampleNames) {
		timeTable.push([]);
	}
	if(document.getElementById("numerator-input").value == 3 || document.getElementById("numerator-input").value % 3 != 0) {
		var subdivisions = denominatorToSubdivisions(document.getElementById("denominator-input").value);
	} else {
		if(document.getElementById("denominator-input").value <= 4) {
			var subdivisions = 6;
		} else {
			var subdivisions = 3;
		}
	}
	for(var i = 0; i < numBeats; i++) {
		var newBeatDiv = document.createElement("div");
		newBeatDiv.setAttribute("class","beat pads");

		for(var j = 0; j < audioSampleNames.length; j++) {
			var newRow = document.createElement("div");
			newRow.setAttribute("class","row pads");
			newRow.setAttribute("id","row-"+i+"-"+j)

			for(var k = 0; k < subdivisions; k++) {
				var newBox = createBoxObject(timeTable,j, i * subdivisions + k);
				newRow.appendChild(newBox.DOMElement);
				timeTable[j].push(newBox.activated);
			}

			newBeatDiv.appendChild(newRow);
		}

		document.getElementById("beats-container").appendChild(newBeatDiv);
	}

	return timeTable;
}

function addBoxes() {
	var innerTimeTable = [];
	for(i = 0; i < numBoxes; i++) {
		var newBox = createBoxObject(timeTable, rowNumber, i);
		var id = rowNumber + "-" + i;
		newBox.DOMElement.setAttribute("id", id);
		boxes.appendChild(newBox.DOMElement);
		innerTimeTable.push(newBox.activated);
	}
	timeTable.push(innerTimeTable);
}

function createBeatDivs() {
	var numerator = document.getElementById("numerator-input").value;
	var denominator = document.getElementById("denominator-input").value;

	var numHighlights;
	if(numerator % 3 == 0 && numerator != 3) {
		numHighlights = numerator / 3;
	} else {
		numHighlights = numerator;
	}
	return numHighlights;
}

function getNumberHighlights(numerator, denominator) {
	var numHighlights;
	if(numerator % 3 == 0 && numerator != 3) {
		numHighlights = numerator / 3;
	} else {
		numHighlights = numerator;
	}
}

function spaceFunction(audioPlayer) {
	console.log("space pressed");
	console.log(audioPlayer.playing);
	if(audioPlayer.playing) {
		audioPlayer.pause(audioPlayer);
	} else {
		audioPlayer.beginLoop(audioPlayer);
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
			if(bpm <= 0) {
				document.getElementById("bpm-input").value = 1;
				bpm = 1;
			}
			var denominator = document.getElementById("denominator-input").value;
			/*	bdr = beats denominator represents */
			/*	(1 min / x quarter notes) * (60 sec / 1 min) * (1000 ms / 1 sec) * (4 quarter notes / z bdr) * (1 bdr / subdivisions) = ms /subdivisions	*/
			audioPlayer.subBeatLength = (60 * 1000 * 4) / (bpm * denominator * denominatorToSubdivisions(denominator));
		},
		beginLoop: function(audioPlayer) {
			console.log("play");
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
			console.log("paused");
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

function makeRow(timeTable, numBoxes, soundName, rowNumber) {
	var row = document.createElement("div");
	row.setAttribute("class","row pads")

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

	document.getElementById("beat-machine-container").appendChild(row);
}

function createBoxObject(timeTable, rowNumber, columnNumber) {
	var box = document.createElement("div");
	box.setAttribute("class","box off");
	box.setAttribute("id",rowNumber+"-"+columnNumber);

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

function updatePadding() {
	// The constant is from it looking like my computer screen
	// P2 = P1*W2*H2/(H1*H2)
	var newPadding = (20 / (1620 * 1080)) * screen.width * screen.height;
	var nodesWithPadding = document.getElementsByClassName("pads");
	console.log(newPadding);
	console.log(nodesWithPadding);

	console.log(document.getElementById("beat-machine-container"));
	console.log(document.getElementById("beat-machine-container").style.padding);
	
	console.log(window.getComputedStyle(document.getElementById("beat-machine-container"), null).getPropertyValue('padding'));

	for(node of nodesWithPadding) {
		window.getComputedStyle(document.getElementById("beat-machine-container"), null).setProperty('padding',newPadding + "px");
	}

	document.getElementById("beat-machine-container").style.padding = 3 * newPadding;
}

//audioSetUp();
console.log(screen.width);
console.log(screen.height)
//updatePadding();

function detectLandscapeMode() {
	if(screen.height > screen.width) {
		if(!document.getElementById("rotate-device")) {
			var rotateNotification = document.createElement("div")
			rotateNotification.setAttribute("id","rotate-device");
			rotateNotification.textContent = "Please rotate your device to landscape mode";
			document.body.appendChild(rotateNotification);
		}
	} else {
		if(document.getElementById("rotate-device")) {
			document.getElementById("rotate-device").remove();
		}
	}
}

setInterval(detectLandscapeMode,100);
betterAudioSetUp();