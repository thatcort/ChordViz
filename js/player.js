function chordPlayer() {
	
	var player = {};

	var audios = [];


	player.init = function(loadedCallback) {
		var names = ['C', 'C%23', 'D', 'D%23', 'E', 'F', 'F%23', 'G', 'G%23', 'A', 'A%23', 'B'];
		var sources = [];
		var waitingToLoad = [];
		var numberLoading = 25;
		for (var i=0; i < 25; i++) {
			var octave = 2 + Math.floor(i/12);
			var audioSource = 'audio/piano/' + octave + names[i % names.length] + '.mp3'
			sources.push(audioSource);
			waitingToLoad.push(true);
		}
		var parent = d3.select("#audios");
		var audioSel = parent.selectAll("audio").data(sources);
		function audioReady(index) {
			if (waitingToLoad[index]) {
				waitingToLoad[index] = false;
				numberLoading--;
			}
// console.log('audioReady: ' + index + '; still waiting for ' + numberLoading);
			if (numberLoading <= 0) {
				loadedCallback();
			}
		}
		audioSel.enter().append("audio")
			.on('canplaythrough', function(d, i) { audioReady(i); d3.select(this).on('canplaythrough', null); })
			.each(function(d) { audios.push(this); })
			.attr("src", function(d) { return d; });
	}
	

	player.playChord = function(notes) {
		for (var i=0; i < notes.length; i++) {
			var note = notes[i];
			player.playNote(note);
		}
	}

	player.playNote = function(note) {
		var audio = audios[note.index];
		if (!audio.ended) {
			audio.pause();
		}
		audio.currentTime = 0;
		audio.play();
	}

	return player;
}