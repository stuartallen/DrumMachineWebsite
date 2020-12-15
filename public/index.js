var boxList = [];
var curSubBeat = 0;

makeRow(16, "Sound 1");
var audio = makeAudioPlayer("audio/bonk-3.wav", boxList);
audio.playLoop();

function makeRow(numBoxes, soundName) {
	var i;

	var row = document.createElement("div");
	row.setAttribute("class","row")

	var label = document.createElement("div");
	label.textContent = soundName + ":";
	row.appendChild(label);

	var boxes = document.createElement("div");
	boxes.setAttribute("class","boxes");

	for(i = 0; i < numBoxes; i++) {
		var newBox = createBoxObject();
		boxes.appendChild(newBox.DOMElement);
		boxList.push(newBox);
	}

	row.appendChild(boxes);

	document.getElementById("beat-container").appendChild(row);
}

function createBoxObject() {
	var box = document.createElement("div");
	box.setAttribute("class","box off");

	var boxObject = {
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
}

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
			this.loop = setInterval(this.play, 500);
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