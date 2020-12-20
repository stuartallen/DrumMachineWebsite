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
	document.getElementById("play-button").addEventListener("click", function() { audioPlayer.beginLoop(audioPlayer) });
	document.getElementById("pause-button").addEventListener("click", function() { audioPlayer.pause(audioPlayer) });
	document.getElementById("stop-button").addEventListener("click", function() { audioPlayer.stop(audioPlayer) });
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
		subBeatLength: (60 * 1000) / (document.getElementById("bpm-input").value * 8),
		updateSubBeatLength: function(audioPlayer) {
			audioPlayer.subBeatLength = (60 * 1000) / (document.getElementById("bpm-input").value * 8);
		},
		beginLoop: function(audioPlayer) {
			if(!audioPlayer.playing) {
				audioPlayer.playing = true;
				audioPlayer.updateSubBeatLength(audioPlayer);
				audioPlayer.loopFunction(audioPlayer);
			}
		},
		loopFunction: function(audioPlayer) {
			audioPlayer.updateSubBeatLength(audioPlayer);
			setTimeout(function() {
				if(audioPlayer.playing) {
					audioPlayer.updateSubBeatLength(audioPlayer);

					var i;		
					for(i = 0; i < audioPlayer.table.length; i++) {
						if(audioPlayer.table[i][audioPlayer.currentSubBeat]) {
							audioPlayer.samples[i].currentTime = 0;
							audioPlayer.samples[i].play();
						}
						var id = i + "-" + audioPlayer.currentSubBeat;
						var last_id = i + "-" + ((audioPlayer.currentSubBeat + 15) % 16);
						document.getElementById(id).classList.add("playing");

						var last_box = document.getElementById(last_id);
						if(last_box.classList.contains("playing")) {
							last_box.classList.remove("playing");
						}
					}
					audioPlayer.currentSubBeat = (audioPlayer.currentSubBeat + 1) % audioPlayer.table[0].length;

					setTimeout(function() {audioPlayer.loopFunction(audioPlayer)}, audioPlayer.subBeatLength);
				}
			}, audioPlayer.subBeatLength);
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
				var id = i + "-" + ((this.currentSubBeat + 15) % 16);
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