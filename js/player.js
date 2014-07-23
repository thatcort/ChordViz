function chordPlayer() {
	
	var player = {};

	var audios = [];

	function init() {
		var names = ['C', 'C%23', 'D', 'D%23', 'E', 'F', 'F%23', 'G', 'G%23', 'A', 'A%23', 'B'];
		var sources = [];
		for (var i=0; i < 25; i++) {
			var octave = 2 + Math.floor(i/12);
			var audioSource = 'audio/piano/' + octave + names[i % names.length] + '.mp3'
			sources.push(audioSource);
		}
		var parent = d3.select("#audios");
		var audioSel = parent.selectAll("audio").data(sources);
		audioSel.enter().append("audio")
			.attr("src", function(d) { return d; });
		audioSel.each(function(d) { audios.push(this); });
	}
	

	player.playChord = function(notes) {
		for (var i=0; i < notes.length; i++) {
			var note = notes[i];
			var audio = audios[note.index];
			if (!audio.ended) {
				audio.pause();
			}
			audio.currentTime = 0;
			audio.play();
		}
	}

	init();
	return player;
}