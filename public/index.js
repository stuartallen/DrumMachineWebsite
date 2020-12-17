var audioSampleNames = [
	"kick.wav",
	"snare.wav"
];

audioSetUp();

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
		beginLoop: function(audioPlayer) {
			audioPlayer.loop = setInterval(function() { audioPlayer.loopFunction(audioPlayer)} , 100);
		},
		loopFunction: function(audioPlayer) {
			var i;		
			
			for(i = 0; i < audioPlayer.table.length; i++) {
				if(audioPlayer.table[i][audioPlayer.currentSubBeat]) {
					audioPlayer.samples[i].currentTime = 0;
					audioPlayer.samples[i].play();
				}
			}
			audioPlayer.currentSubBeat = (this.currentSubBeat + 1) % 16;
		},
		pause: function(audioPlayer) {
			clearInterval(audioPlayer.loop)
		},
		stop: function(audioPlayer) {
			clearInterval(audioPlayer.loop);
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

/*
function makeAudioPlayer(soundSource) {
	var audio = document.createElement("audio");
	var audioSource = document.createElement("source");
	audioSource.setAttribute("src", soundSource);
	audio.appendChild(audioSource);
	document.getElementById("audio-holder").appendChild(audio);

	var audioPlayer = {
		sound: audio,
		loop:null,
		subBeatIndex: 0,
		playLoop:function() {
			this.loop = setInterval(this.play, 100);
		},
		play:function() {
			if(boxList[curSubBeat].activated) {
				audio.play();
			}
			curSubBeat = (curSubBeat + 1) % 16
		},
		clear:function() {
			clearInterval(this.loop);
		}
	}

	return audioPlayer;
}
*/