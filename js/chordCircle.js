function chordCircle() {
	
	var context = {
		chordRad: 800, // radius of main chord circle
		noteRad: 10,   // radius of note circles
		octaveGap: 40	// radial gap between notes separated by an octave
	};

	var data,
		player;

	var notes;

	var rootG,
		notesG;

	var playedNotes = []; // an array of all notes, with indices marked true when that note is played
	var chord = []; // an array of just the currently played notes

	var NOTE_ANGLE = Math.PI / 6.0;
	var HALF_PI = Math.PI * .5;

	var majorKey = [ true, false, true, false, true, true, false, true, false, true, false, true ];

	var currentKey = majorKey;
	var keyIndex = 1;


	context.init = function(parent, chordData, chordPlayer) {
		data = chordData;
		player = chordPlayer;
		notes = data.getNotes();

		rootG = parent.append('g')
					.attr('transform', 'translate(' + chordRad + ', ' + chordRad + ')');
		context.rootElem = rootG;

		notesG = rootG.append('g');

		renderNotes();
	}


	function renderNotes() {
		var noteSel = notesG.selectAll('g').data(notes);

		noteSel.enter().append('g')
			.append('circle')
				.attr('r', context.noteRad)
				.attr('cx', function(d) { return noteX(d); })
				.attr('cy', function(d) { return noteY(d); });

		noteSel.classed('noteInKey', noteInKey)
				.classed('noteOffKey', noteOffKey)
				.on('click', function(d, i) {
					playedNotes[i] = !playedNotes[i];
					d3.select(this).classed("notePlayed", playedNotes[i]);
					updateChord();
					playChord();
				});
	}

	function noteRadius(note) {
		return context.chordRad - (context.octaveGap / 12) * note.index;
	}
	function noteX(note) { // note is relative to tonic
	  return noteRadius(note) * Math.cos(NOTE_ANGLE * note.index - HALF_PI);
	}
	function noteY(note) { // note is relative to tonic
	  return noteRadius(note) * Math.sin(NOTE_ANGLE * note.index - HALF_PI);
	}

	function noteInKey(note) {
		return currentKey[(note.index + keyIndex) % 12];
	}
	function noteOffKey(note) { return !noteInKey(note); }

	function updateChord() {
		chord = [];
		for (var i=0; i < playedNotes.length; i++) {
			if (playedNotes[i])
				chord.push(notes[i]);
		}
	}
	function playChord() {
		player.playChord(chord);
	}

	return context;
}