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
		notesG,
		gapG;

	var playedNotes = []; // an array of all notes, with indices marked true when that note is played
	var chord = []; // an array of just the currently played notes

	var NOTE_ANGLE = Math.PI / 6.0;
	var HALF_PI = Math.PI * .5;

	var majorKey = [ true, false, true, false, true, true, false, true, false, true, false, true ];

	var currentKey = majorKey;
	var keyIndex = 0;

	var gapRadius;


	context.init = function(parent, chordData, chordPlayer) {
		data = chordData;
		player = chordPlayer;
		notes = data.getNotes();

		gapRadius = noteRadius(notes[notes.length-1]) - context.noteRad*2;

		rootG = parent.append('g')
					.attr('transform', 'translate(' + chordRad + ', ' + chordRad + ')');
		context.rootElem = rootG;

		notesG = rootG.append('g');
		gapG = rootG.append('g');

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
					drawGaps();
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



	function gapX(index) { // note is relative to tonic
	  return gapRadius * Math.cos(NOTE_ANGLE * index - HALF_PI);
	}
	function gapY(index) { // note is relative to tonic
	  return gapRadius * Math.sin(NOTE_ANGLE * index - HALF_PI);
	}

	function drawGaps(chord) {
		var playedOctave = [];
		for (var i=0; i < playedNotes.length; i++) {
			playedOctave[i%12] |= playedOctave[i%12] || playedNotes[i];
		}

		var gapData = [];
		for (var i=0; i < 12; i++) {
			if (playedOctave[i]) {
				for (var j=i+1; j < 12; j++) {
					if (playedOctave[j]) {
						var gap = j - i;
						if (gap > 6)
							gap = 12 - gap;
						gap--;
						gapData.push([i, j, gap]);
					}
				}
			}
		}

		var gapLines = gapG.selectAll("line").data(gapData);

		gapLines.enter().append("line");

		gapLines.exit().remove();

		gapLines.classed("gap1", function(d) { return d[2] === 0; })
				.classed("gap2", function(d) { return d[2] === 1; })
				.classed("gap3", function(d) { return d[2] === 2; })
				.classed("gap4", function(d) { return d[2] === 3; })
				.classed("gap5", function(d) { return d[2] === 4; })
				.classed("gap6", function(d) { return d[2] === 5; })
				.attr("x1", function(d) { return gapX(d[0]); })
				.attr("y1", function(d) { return gapY(d[0]); })
				.attr("x2", function(d) { return gapX(d[1]); })
				.attr("y2", function(d) { return gapY(d[1]); });
	}



	return context;
}