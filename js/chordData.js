function chordData() {
	
	var data = {};

	var notes = [];


	data.init = function() {
		createNotes();
	}



	function createNotes() {
		var names = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
		for (var i=0; i < 25; i++) {
			var octave = 2 + Math.floor(i/12);
			var note = {
				octave: octave,
				name: names[i % names.length],
				index: i,
				octaveIndex: i % 12,
				audioSource: 'audio/piano/' + octave + names[i % names.length] + '.mp3'
			};
			notes.push(note);
		}
	}

	data.getNotes = function() { return notes; }

	return data;
}