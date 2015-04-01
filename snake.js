//////////////////////////// Javascript Snake ////////////////////////////
// An educational project developed for Michigan Hackers' Learn to Hack
// event, an introductory hackathon for high schoolers in Ann Arbor, MI
// to teach programming and project developement skills at a beginner level.

// Written by Andrew Marino with contributions by Sydney Bigelow and Vinay
// Hiremath in March 2015

// Canvas element variables
var CANVAS_ELEMENT;
var CANVAS;

// Aspects of virtual "grid" over canvas
var X_DIM;
var Y_DIM;
var GRID_LENGTH = 20;
var LINK_LENGTH = 19; // Separation between links
var LINK_COLOR = "#00274C"; // Blue
var GRID_COLOR = "#FFFFFF"; // White
var TARGET_COLOR = "#FFCB05"; // Maize

// Speed of gameplay variables
var INTERVAL_ID;
var FPS_INIT = 15;
var FPS = 15;

var SCORE = 0;

// HEAD and TAIL objects have (x,y) position and (x,y) direction
var HEAD = {
  xPos:2, yPos:3, // starting at (2, 3) arbitrarily
  xDir:1, yDir:0 // moving right arbitrarily
};
var TAIL = {
  xPos:2, yPos:3,
  xDir:1, yDir:0
};

// Target object has (x,y) position
var TARGET = {
  xPos: 0, yPos: 0
};

// Arrays and flags for gameplay mechanics
var turnQueue = [];
var linkArray = [];
var recieveInput = true;

// Set given grid position to snake link or target
function setLink(xPos, yPos, target) {
  if (target) CANVAS.fillStyle = TARGET_COLOR;
  else CANVAS.fillStyle = LINK_COLOR;
  CANVAS.fillRect(xPos*GRID_LENGTH, yPos*GRID_LENGTH, LINK_LENGTH, LINK_LENGTH);
}

// Erase given grid position
function removeLink(xPos, yPos) {
  CANVAS.fillStyle = GRID_COLOR;
  CANVAS.fillRect(xPos*GRID_LENGTH, yPos*GRID_LENGTH, LINK_LENGTH, LINK_LENGTH);
}

// On keyboard input, change direction as required
function getKeyInput(event) {
  // Return if already changed direction this cycle and set flag
  if (!recieveInput) return;
  recieveInput = false;

  // Only change direction if not travelling along specified axis
  var changed = true;
  if (event.keyCode == 37 && HEAD.xDir == 0) { // left was pressed
    HEAD.xDir = -1;
    HEAD.yDir = 0;
  }
  else if (event.keyCode == 39 && HEAD.xDir == 0) { // Right was pressed
    HEAD.xDir = 1;
    HEAD.yDir = 0;
  }
  else if (event.keyCode == 38 && HEAD.yDir == 0) { // Up was pressed
    HEAD.xDir = 0;
    HEAD.yDir = -1;
  }
  else if (event.keyCode == 40 && HEAD.yDir == 0) { // Down was pressed
    HEAD.xDir = 0;
    HEAD.yDir = 1;
  }
  else changed = false;
  
  // If changed direction, push position of head to turn queue
  if (changed) {
    var newHead =
      {xPos:HEAD.xPos, yPos:HEAD.yPos, xDir:HEAD.xDir, yDir:HEAD.yDir};
    turnQueue.push(newHead);
  }
}

// Get random grid position and sets target at position
function setTarget() {
  TARGET.xPos = Math.floor(Math.random() * X_DIM);
  TARGET.yPos = Math.floor(Math.random() * Y_DIM);

  // Do not set target on top of snake
  while (linkArray[TARGET.xPos][TARGET.yPos]) {
    TARGET.xPos = Math.floor(Math.random() * X_DIM);
    TARGET.yPos = Math.floor(Math.random() * Y_DIM);
  }

  setLink(TARGET.xPos, TARGET.yPos, true);
}

// Set initial gameboard conditions (canvas and game variables)
function initCanvas() {
  // Get canvas element from DOM
  CANVAS_ELEMENT = document.getElementById("gameboard");
  CANVAS = CANVAS_ELEMENT.getContext("2d");

  // Set dimensions of canvas and gameboard (on virtual "grid")
  CANVAS_ELEMENT.width = GRID_LENGTH *
                          Math.floor(window.innerWidth * 0.65 / GRID_LENGTH);
  CANVAS_ELEMENT.height = GRID_LENGTH *
                          Math.floor(window.innerHeight * 0.7 / GRID_LENGTH);
  X_DIM = CANVAS_ELEMENT.width / GRID_LENGTH;
  Y_DIM = CANVAS_ELEMENT.height / GRID_LENGTH;

  // Set initial position of snake (head and tail variables)
  HEAD.xPos = Math.floor((Math.random() * GRID_LENGTH/2) + GRID_LENGTH/4);
  HEAD.yPos = Math.floor((Math.random() * GRID_LENGTH/2) + GRID_LENGTH/4);
  HEAD.xDir = 1;
  HEAD.yDir = 0;
  TAIL.xPos = HEAD.xPos;
  TAIL.yPos = HEAD.yPos;
  TAIL.xDir = HEAD.xDir;
  TAIL.yDir = HEAD.yDir;

  // Add event listener for keypresses (to get arrow key input)
  window.addEventListener("keydown", getKeyInput);

  // Initialize 2-dimensional link array to all 0s
  for (var i = 0; i < X_DIM; ++i) {
    var columns = [];
    for (var j = 0; j < Y_DIM; ++j) columns[j] = 0;
    linkArray[i] = columns;
  }

  turnQueue = []; // Initialize turn queue to empty

  // Reset score and display
  SCORE = 0;
  document.getElementById("scoreDisplay").innerHTML = SCORE;

  FPS = FPS_INIT; // Set initial speed in FPS

  // Set text and action of button on page
  document.getElementById("playGameButton").innerHTML = "Play Game"
  document.getElementById("playGameButton").onclick = runGame;

  setTarget(); // Set first target (avoid initial blank gameboard)
}

// Reset canvas to initial conditions and starts game
function restartGame() {
  initCanvas();
  runGame();
}

// Set end-of-game text and action for button and stop frames from updating
function gameOver() {
  document.getElementById("playGameButton").innerHTML = "Play Again?";
  document.getElementById("playGameButton").onclick = restartGame;
  document.getElementById("selection").style.visibility = "visible";
  clearInterval(INTERVAL_ID);
}

// Return false if given coordinates are outside of gameboard
function checkBounds(xPos, yPos) {
  if (xPos < 0 || xPos >= X_DIM) return false;
  else if (yPos < 0 || yPos >= Y_DIM) return false;
  else return true;
}

// Update position of head and tail of snake
function moveSnake() {
  // Update head position in direction of motion
  HEAD.xPos += HEAD.xDir;
  HEAD.yPos += HEAD.yDir;

  // Exit if head hits edge of gameboard or hits another link (hits itself)
  if (!checkBounds(HEAD.xPos, HEAD.yPos) || linkArray[HEAD.xPos][HEAD.yPos]) {
    gameOver();
    return;
  }

  // Set head link on canvas and link array
  setLink(HEAD.xPos, HEAD.yPos, false);
  linkArray[HEAD.xPos][HEAD.yPos] = 1;

  // Erase tail link from canvas and link array
  removeLink(TAIL.xPos, TAIL.yPos);
  linkArray[TAIL.xPos][TAIL.yPos] = 0;

  // Update tail position in direction of motion
  TAIL.xPos += TAIL.xDir;
  TAIL.yPos += TAIL.yDir;
}

// On snake eating target, grow snake from tail back and increments score
function growSnake() {
  // Tail grows one link backwards
  TAIL.xPos -= TAIL.xDir;
  TAIL.yPos -= TAIL.yDir;

  // If tail is not out of bounds, set tail link on canvas and array
  if (!(TAIL.xPos < 0 || TAIL.yPos < 0)) {
    linkArray[TAIL.xPos][TAIL.yPos] = 1;
    setTarget();
  }

  // Increment and display score
  SCORE++;
  document.getElementById("scoreDisplay").innerHTML = SCORE;

  // Increment speed every other time score increments
  if (!(SCORE % 2)) {
    FPS += 1; // Increase speed as score goes up!

    // Set new interval for new framerate
    clearInterval(INTERVAL_ID);
    INTERVAL_ID = setInterval(playGame, 1000 / FPS);
  }
}

// Update snake on each frame
function playGame() {
  // If tail is at turning point, set to new direction
  if (turnQueue.length > 0 // Prevent invalid accesses
      && TAIL.xPos == turnQueue[0].xPos && TAIL.yPos == turnQueue[0].yPos) {
    TAIL = turnQueue.shift(); // Set new tail direction and pop off queue
  }

  // If head hits target, grow snake
  if (HEAD.xPos == TARGET.xPos && HEAD.yPos == TARGET.yPos) growSnake();

  moveSnake(HEAD, TAIL); // Move snake each "frame"
  recieveInput = true; // Reset keybpress listener for new "frame"
}

// Initialize snake speed, sets up page for gameplay, and starts framerate
function runGame() {
  // Set FPS to selected speed from radio buttons
  if (document.getElementById("easy").checked) FPS = 10;
  else if (document.getElementById("intermediate").checked) FPS = 15;
  else if (document.getElementById("difficult").checked) FPS = 25;

  // Hide speed selection buttons on page
  document.getElementById("selection").style.visibility = "hidden";

  // Unable to start new "games" in the middle of gameplay
  document.getElementById("playGameButton").onclick = null;

  // Set interval for "frame" updating function
  INTERVAL_ID = setInterval(playGame, 1000 / FPS);
}
