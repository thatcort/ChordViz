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
		gapG,
		gapLinesG,
		gapLowestG,
		radialG,
		spiralG,
		labelG;

	var playedNotes = []; // an array of all notes, with indices marked true when that note is played
	var chord = []; // an array of just the currently played notes

	var NOTE_ANGLE = Math.PI / 6.0;
	var HALF_PI = Math.PI * .5;

	var majorKey = [ true, false, true, false, true, true, false, true, false, true, false, true ];

	var currentKey = majorKey;
	var keyIndex = 0;

	var gapRadius,
		labelRadius;


	context.init = function(parent, chordData, chordPlayer) {
		data = chordData;
		player = chordPlayer;
		notes = data.getNotes();

		gapRadius = noteRadius(notes.length-1) - context.noteRad*2;
		labelRadius = context.chordRad + context.noteRad*2;

		rootG = parent.append('g')
					.attr('transform', 'translate(' + chordRad + ', ' + chordRad + ')');
		context.rootElem = rootG;

		radialG = rootG.append('g');
		spiralG = rootG.append('g');
		notesG = rootG.append('g');
		gapG = rootG.append('g').classed("gaps", true);
		gapLinesG = gapG.append('g');
		gapLowestG = gapG.append('g');

		labelG = rootG.append('g');

		drawRadials();
		drawSpiral();
		drawNotes();
		drawLabels();

		rootG.append('circle')
			.classed('gapCircle', true)
			.attr('r', gapRadius)
			.on('click', playChord);
	}

	var keyDrag = d3.behavior.drag()
					.on('drag', function(d) {
						var startAngle = noteAngle(d);
						var angle = Math.atan2(d3.event.y, d3.event.x);
						keyIndex = Math.round((angle - startAngle)/NOTE_ANGLE);
						if (keyIndex < 0)
							keyIndex += 12;
						else if (keyIndex > 11)
							keyIndex -= 12;
						setKeyIndex(keyIndex);
					});

	function setKeyIndex(index) {
		radialG.selectAll('line')
				.classed('keyNote', function(d, i) { return i === keyIndex; });
		notesG.selectAll('circle')
				.classed('noteInKey', noteInKey)
				.classed('noteOffKey', noteOffKey);
	}

	function drawSpiral() {
		var cpFactor = .25;
		var x0 = noteX(0);
		var y0 = noteY(0);
		var d = "M " + x0 + ',' + y0;
		for (var i=1; i < notes.length; i++) {
			var x1 = noteX(i);
			var y1 = noteY(i);
			var cpAngle = noteAngle(i) - NOTE_ANGLE*.5;
			var cpRadius = noteRadius(i-1) * 1.02;
			var cpX = cpRadius * Math.cos(cpAngle);
			var cpY = cpRadius * Math.sin(cpAngle);
			d += ' Q' + cpX + ',' + cpY + ' ' + x1 + ',' + y1
			x0 = x1;
			y0 = y1;
		}
		var path = spiralG.append('path')
					.classed('noteSpiral', true)
					.attr('d', d);
	}

	function drawRadials() {
		var radials = radialG.selectAll('line').data(d3.range(12));
		radials.enter().append('line')
			.classed('radial', true)
			.attr('x1', function(i) { return gapX(i); })
			.attr('y1', function(i) { return gapY(i); })
			.call(keyDrag);

		radials.classed('keyNote', function(d, i) { return i === keyIndex; })
			.attr('x2', function(i) { return noteX(i); })
			.attr('y2', function(i) { return noteY(i); });
	}

	function drawLabels() {
		var labelSel = labelG.selectAll("text").data(notes.slice(0,12));
		labelSel.enter().append("text")
			// .attr("transform", function(d,i) { return 'translate(' + labelRadius*Math.cos(noteAngle(i)) + ',' + labelRadius*Math.sin(noteAngle(i)) + ')'; })
			.attr("transform", function(d,i) {
				var rad = noteRadius(i) + context.noteRad*2;
				var ang = noteAngle(i);
				return 'translate(' + rad*Math.cos(ang) + ',' + rad*Math.sin(ang) + ')';
			})
			.classed('noteName', true)
			.attr('text-anchor', function(d,i) {
				if (i === 0 || i === 6) {
					return 'middle';
				} else if (i < 6) {
					return 'start';
				} else {
					return 'end';
				}
			})
			.attr('dominant-baseline', function(d,i) {
				if (i === 3 || i === 9) {
					return 'middle';
				} else if (i < 3 || i > 9) {
					return 'text-after-edge';
				} else {
					return 'text-before-edge';
				}
			})
			.text(function(d) { return d.name; });
	}

	function drawNotes() {
		var noteSel = notesG.selectAll('circle').data(notes);

		noteSel.enter() // .append('g')
			.append('circle')
				.attr('r', context.noteRad)
				.attr('cx', 0)
				.attr('cy', -context.chordRad)
				.classed('noteInKey', noteInKey)
				.classed('noteOffKey', noteOffKey)
				.on('click', function(d, i) {
					playedNotes[i] = !playedNotes[i];
					d3.select(this).classed("notePlayed", playedNotes[i]);
					updateChord();
					drawGaps();
					playChord();
				});;

		function radiusInterpolator(d, i) {
			var startRad = context.chordRad;
			var endRad = noteRadius(i);
			return d3.interpolateNumber(startRad, endRad);
		}
		function angleInterpolator(d, i) {
			var startAngle = -HALF_PI;
			var endAngle = noteAngle(i);
			return d3.interpolateNumber(startAngle, endAngle);
		}
		function tweenSpiralX(d, i) {
			var ri = radiusInterpolator(d, i);
			var ai = angleInterpolator(d, i);
			return function(t) {
				return ri(t) * Math.cos(ai(t));
			}
		}
		function tweenSpiralY(d, i) {
		var ri = radiusInterpolator(d, i);
			var ai = angleInterpolator(d, i);
			return function(t) {
				return ri(t) * Math.sin(ai(t));
			}	
		}
		var noteDuration = 100;
		noteSel.transition()
			.duration(function(d, i) { return i * noteDuration; })
			.ease('linear')
			.attrTween('cx', tweenSpiralX)
			.attrTween('cy', tweenSpiralY)
			.each('end', function(d) { player.playNote(d); });
	}

	function noteRadius(index) {
		return context.chordRad - (context.octaveGap / 12) * index;
	}
	function noteX(index) { // note is relative to tonic
	  return noteRadius(index) * Math.cos(noteAngle(index));
	}
	function noteY(index) { // note is relative to tonic
	  return noteRadius(index) * Math.sin(noteAngle(index));
	}
	function noteAngle(index) {
		return NOTE_ANGLE * index - HALF_PI;
	}

	function noteInKey(note) {
		return currentKey[(note.index - keyIndex) % 12];
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
		var lowestNote = null;
		for (var i=0; i < playedNotes.length; i++) {
			playedOctave[i%12] |= playedOctave[i%12] || playedNotes[i];
			if (lowestNote == null && playedNotes[i]) {
				lowestNote = i;
			}
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

		var gapLines = gapLinesG.selectAll("line").data(gapData);

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
				.attr("y2", function(d) { return gapY(d[1]); })
				;
				// .attr("stroke-opacity", .7);
		
		if (gapData.length > 0) {
			var lowSel = gapLowestG.selectAll('circle').data([lowestNote]);
			lowSel.enter().append('circle')
				.classed('lowestNote', true)
				.attr('r', 5);
			lowSel.attr('cx', gapX)
				.attr('cy', gapY);
		} else {
			gapLowestG.selectAll('circle').remove();
		}
	}



	return context;
}