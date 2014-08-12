function chordData() {
	
	var data = {};

	var dispatch = d3.dispatch('keyIndex');

	var notes = [];

	var majorKey = [ true, false, true, false, true, true, false, true, false, true, false, true ];

	var currentKey = majorKey;
	var keyIndex = 0; // the index of the key (e.g. C=0, C#=1)


	data.init = function() {
		createNotes();
	};

	data.addListener = function(type, ownerName, listener) {
		dispatch.on(type + '.' + ownerName, listener);
	};

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

	data.getNotes = function() { return notes; };


	data.keyIndex = function(_) {
		if (!arguments.length) {
			return keyIndex;
		}
		keyIndex = _;
		dispatch.keyIndex(keyIndex);
	};

	data.noteInKey = function(note) {
		var ki = (note.index - keyIndex) % 12;
		if (ki < 0)
			ki += 12;
		return currentKey[ki];
	}
	data.noteOffKey = function(note) { return !data.noteInKey(note); }

	return data;
}