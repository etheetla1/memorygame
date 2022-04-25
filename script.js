// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = []
var progress = 0;
var gamePlaying = false;

var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;

var mistakeCounter = 0;
var clueHoldTime = 1000; //how long to hold each clue's light/sound

var patternSize;

function easy() {
  patternSize = 6;
  generatePattern(6);
}

function medium() {
  patternSize = 8;
  clueHoldTime = clueHoldTime - 200;
  generatePattern(8);
}

function hard() {
  patternSize = 10;
  clueHoldTime = clueHoldTime - 400;
  generatePattern(10);
}

function generatePattern(size) {
  
  for(var i = 0; i < size; i++) {
    
    var number = Math.floor(Math.random() * 6) + 1;
    pattern.push(number);
    console.log(pattern);
  }
}

function startGame() {
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 550,
  6: 630,
  7: 700,
  8: 800
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

// Functions to light up the buttons when sound is playing
function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  //context.resume()
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  
  //TO change game speed every round
  clueHoldTime = clueHoldTime - 80;
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost");
  document.location.reload();
}

function winGame() {
  stopGame();
  alert("Game Over. You win");
  document.location.reload();
}

function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }
  if (pattern[guessCounter] == btn) {
    //Correct Guess

    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        //You Win!
        winGame();
      } else {
        //The pattern is correct, go to next segment
        progress++;
        playClueSequence();
      }
    } else {
      //Check next guess
      guessCounter++;
    }
  } else {
    //You lose.
    mistakeCounter++;
    if(mistakeCounter == 3) {
      loseGame();
    }
    
    else if(mistakeCounter == 2) {
      alert("Last chance");
      playClueSequence();
    }
    
    else {
      alert("Wrong try again")
      playClueSequence();
    }
  }
}