function chordControls() {
	var controls = {};

	var data, viz; // Yup, directly binding to the viz because events are more work :)

	var modeNames = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'];
	var keyIndices = [0, 5, 1, 2, 3, 4, 6];

	controls.init = function(chordData, chordCircle) {
		data = chordData;
		viz = chordCircle;

		// $('select[name=rootSelect]').change(rootChange);

		$('#chordBlock .tonicBtn').on('click', function(event) {
			var tonic = $(this).data('tonic');
			var chord = [];
			chord.push(data.keyNote(tonic - 1));
			chord.push(data.keyNote(tonic + 1));
			chord.push(data.keyNote(tonic + 3));
			chordCircle.setChord(chord);
		});
	}

	function rootChange(event) {
		var ki = $('select[name=rootSelect] option:selected').val();
		data.keyIndex(parseInt(ki));
	}

	function tonicClicked(tonic) {

	}

	return controls;
}