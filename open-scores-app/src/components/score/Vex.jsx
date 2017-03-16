import React, {Component} from 'react';
import Vex from 'vexflow/releases/vexflow-min';
// import jQuery from '../../vendor/jquery-3.1.1.min.js';

class VFDisplay extends Component {

  // wait for page load to bring in VexFlow
  componentDidMount() {
    const VF = Vex.Flow;

    // Create an SVG renderer and attach it to the DIV element named "vfDisplay".
    const vfDisplay = document.getElementById('vfDisplay');
    let renderer = new VF.Renderer(vfDisplay, VF.Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(1220, 500);
    let context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    let duration = '4';

    let noteVals = [];
    function setLibrary() {
      let c4 = new VF.StaveNote({keys: ['C/4'], duration: duration});
      noteVals.push(c4);
      let cs4 = new VF.StaveNote({keys: ['C#/4'], duration: duration}).addAccidental(0, new VF.Accidental('#'));
      noteVals.push(cs4);
      let d4 = new VF.StaveNote({keys: ['D/4'], duration: duration});
      noteVals.push(d4);
      let ds4 = new VF.StaveNote({keys: ['D#/4'], duration: duration}).addAccidental(0, new VF.Accidental('#'));
      noteVals.push(ds4);
      let e4 = new VF.StaveNote({keys: ['E/4'], duration: duration});
      noteVals.push(e4);
    }
    setLibrary();

    // you can set default note/chord values
    let C7 = new VF.StaveNote({
      keys: [
        'C/4', 'E/4', 'G/4', 'Bb/4'
      ],
      duration: duration
    });

    // declaration of base score values
    let barCount = 1;
    let beatCount = 4;
    let beatValue = 4;
    // let defaultMeasure = {
    //   notes: []
    // }
    let octaves = [3, 4, 5];
    let notes = [];
    let selectedNote = null;
    let staveX = 10;
    let staveY = 40;
    let staveWidth = 300;
    let staveBars = [];
    let voice = new VF.Voice({num_beats: beatCount, beat_value: beatValue});

    // create default measure notes, push those into defaultMeasure.notes, push defaultMeasure.notes into notes.
    // draw canvas should render notes[i] instead of all notes
    // need to revisit how i'm grabbing parameters, so that each index in notes is a measure's notes
    // should have a new voice for each bar so that draw canvase uses staveBars[i], voices[i], and notes[i]
    notes[0] = new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q"});
    notes[1] = new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q"});
    notes[2] = new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q"});
    notes[3] = new VF.StaveNote({clef: "treble", keys: ["c/4"], duration: "q"});
    drawScore();

    // draw a bar for each measure to the canvas
    function drawScore() {
      // clear anything on the canvas
      context.clear();

      for (let i = 0; i < barCount; i++) {
        if (i === 0) {
          // Create a stave of width 300 at position 10, 40 on the canvas.
          staveBars[i] = new VF.Stave(staveX, staveY, staveWidth);

          // Add a clef and time signature to first bar.
          staveBars[i].addClef("treble").addTimeSignature("4/4");
        } else {
          staveBars[i] = new VF.Stave(staveBars[i - 1].width + staveBars[i - 1].x, staveY, staveWidth);
        }

        // notes[i] = [];
        // Connect it to the rendering context and draw
        staveBars[i].setContext(context).draw();

        // Assign notes to a voice
        voice.addTickables(notes);

        // Render voice
        VF.Formatter.FormatAndDraw(context, staveBars[i], notes);
      }
      // Creating consistency in VF generated note element ids for selection later
      let allNotes = document.querySelectorAll('.vf-stavenote');
      for (let i = 0; i < allNotes.length; i++) {
        allNotes[i].id = `note${i}`;
      }
      bindEvents();
    }

    function bindEvents() {
      let allNotes = document.querySelectorAll('.vf-stavenote');
      allNotes.forEach((note) => {
        // select a note by id on click
        note.addEventListener('click', function() {
          getNoteById(this);
        });
      });

      document.querySelector('.add-measure-btn').addEventListener('click', () => {
        addMeasure();
      });

      // keypresses
      document.onkeydown = checkKey;
    }

    // check which key was pressed
    function checkKey(e) {
      e = e || window.event;

      if (selectedNote) {
        if (e.keyCode === 38) {
          // up arrow
          e.preventDefault();
          changePitch('up');
        } else if (e.keyCode === 40) {
          // down arrow
          e.preventDefault();
          changePitch('down');
        } else if (e.keyCode === 37) {
          // left arrow
          e.preventDefault();
          changeSelection('left');
        } else if (e.keyCode === 39) {
          // right arrow
          e.preventDefault();
          changeSelection('right');
        } else if (e.keyCode === 27) {
          // escape key
          e.preventDefault();
          unselectNote();
        }
      }
    }

    // inserts a measure at the end of the score
    function addMeasure() {
      // barCount++;
      // beatCount += 4;
      console.log(beatCount);

      // start a new line every 5 measures
      // if (barCount % 5 === 0) {
      //   staveY += 80;
      // }
      resetCanvas();
    }

    // increase note value on up arrow
    function changePitch(key) {
      let currentPitch;
      let newPitch;
      noteVals.forEach((note) => {
        if (note.keys[0].toLowerCase() === selectedNote.keys[0].toLowerCase()) {
          currentPitch = noteVals.indexOf(note);
        }
      });

      if (currentPitch === noteVals.length - 1 && key === 'up') {
        newPitch = noteVals[0];
      } else if (currentPitch === 0 && key === 'down') {
        newPitch = noteVals[noteVals.length - 1];
      } else {
        key === 'up' ? newPitch = noteVals[currentPitch + 1] : newPitch = noteVals[currentPitch - 1];
      }

      notes[notes.indexOf(selectedNote)] = newPitch;
      selectedNote = newPitch;
      resetCanvas();
      highlightNote();
    }

    // change selected note with left and right arrow keys
    function changeSelection(key) {
      let currentId = selectedNote.attrs.el.id;
      currentId = parseInt(currentId.substr(4, 10));
      if (key === 'right') {
        let nextId;
        if (document.getElementById(`note${currentId + 1}`)) {
          nextId = document.getElementById(`note${currentId + 1}`);
        } else {
          nextId = document.querySelector('.vf-stavenote:first-of-type');
        }
        getNoteById(nextId);
      } else {
        let prevId;
        if (document.getElementById(`note${currentId - 1}`)) {
          prevId = document.getElementById(`note${currentId - 1}`);
        } else {
          prevId = document.querySelector('.vf-stavenote:last-of-type');
        }
        getNoteById(prevId);
      }
    }

    // sets selected note
    function getNoteById(note) {
      let selected = note;
      let voiceNotes = voice.tickables;
      for (let i = 0; i < voiceNotes.length; i++) {
        if (voiceNotes[i].attrs.el.id === selected.id) {
          selectedNote = voiceNotes[i];
        }
      }
      // add visual representation of selection
      highlightNote();
    }

    // mark a note as highlighted
    function highlightNote() {
      const blueAccent = "#41A2EB";
      // remove highlight from notes that aren't selected
      notes.forEach((note) => {
        if (selectedNote.attrs.el.id !== note.attrs.el.id) {
          note.setStyle({fillStyle: 'black', strokeStyle: 'black'});
        }
      });

      let highlightedNote = notes[notes.indexOf(selectedNote)];
      highlightedNote.setStyle({fillStyle: blueAccent, strokeStyle: blueAccent});
      resetCanvas();
    }

    // reset library with new note and voice instances
    function resetCanvas() {
      voice = new VF.Voice({num_beats: beatCount, beat_value: beatValue});
      setLibrary();
      drawScore();
    }

    // unselect a note
    function unselectNote() {
      selectedNote = null;
      notes.forEach((note) => {
        note.setStyle({fillStyle: 'black', strokeStyle: 'black'});
      });
      resetCanvas();
    }

    // // Create notes
    // for (let i = 0; i < barCount; i++) {
    //   // initial declaration of chords
    //   for (let measure = 0; measure < barCount; measure++) {
    //     notes[i].push(new VF.StaveNote({clef:"treble", keys: ["c/3"], duration: "q"}));
    //     // notes[i][measure].stem.hide = true;
    //
    //     // how many notes to add
    //     let octave = 3;
    //     let count = 0;
    //     while (octave <= 5) {
    //       for (let k = 0; k < noteVals.length; k++) {
    //         notes[i][measure].keys[count] = `${noteVals[k]}/${octave}`;
    //         count++;
    //       }
    //       octave++;
    //     }
    //   }
    //   // console.log(notes[i]);
    //   // console.log(staveBars[i]);
    //
    //   VF.Formatter.FormatAndDraw(context, staveBars[i], notes[i]);
    // }
  }

  render() {

    return (
      <div id="vfDisplay"></div>
    );
  }
}

export default VFDisplay;
