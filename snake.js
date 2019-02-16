let STARTX = 9;
let STARTY = 9;
let STARTLINGER = 1;
let STARTDIR = 3;
let headX = STARTX;
let headY = STARTY;
let boardXSize = 20;
let boardYSize = 20;
let grid = [];

let framesPerTick = 25;
let linger = STARTLINGER; // The amount of time (ticks) that a tail block will linger on the screen
let dir = STARTDIR;
let dirMap = [moveRight, moveLeft, moveDown, moveUp];
let newFoodScore = 0;

let gameStartTime = 0;

// common size for blocks
let blockWidth = 20;
let blockHeight= 20;

let gridXStart = blockWidth * 1;
let gridYStart = blockHeight * 1;

let running = false;

// The time that it takes for the next frame to be created
let frametime = 1;

//  Used for making sure the user can't kill themselves by accident using controls that shouldn't be allowed
let controlTimeout = 20;

let framesDone = 0;

// This could use some adjustment for gameplay experience but generally fine
let CHANGEDIRTIME = framesPerTick;
let dirCountdown = CHANGEDIRTIME;

// Canvases
let gridC = document.getElementById("grid").getContext("2d");
let thisBlockC = document.getElementById("currentblock").getContext("2d");
let backgroundC = document.getElementById("background").getContext("2d");
// Size of the black background
let blackBackX = blockWidth * boardXSize;
let blackBackY = blockHeight * boardYSize;
// Size of the gray background
let grayBackX = blockWidth * (boardXSize + 2);
let grayBackY = blockHeight * (boardYSize + 2);

let slowified = 0;
let fastified = 0;

// All the different types of powers
let powers = [0, 1, 2];

let powersToColors = ["red", "blue", "yellow"];

let powersToFunctions = [makeFast, makeSlow, noOp];

function noOp() {}

function makeSlow() {
    fastified = 0;
    framesPerTick = 50;
    slowified = 20;
}

function makeFast() {
    slowified = 0;
    framesPerTick = 12;
    fastified = 20;
}

function BodyCell(inX, inY, timeout, inPower) {
    this.x = inX;
    this.y = inY;
    this.timeLeft = timeout;
    this.power = inPower;
}

let bodyCells = [];
let foodCells = [];

// Initialize the grid to be of the right size, filled with zeros
function constructEmptyGrid() {
    grid = [];
    for (let i = 0; i < boardXSize; i++) {
        let col = [];
        for(let j = 0; j < boardYSize; j++) {
            col.push(0);
        }
        grid.push(col);
    }
}

// Move character right, including looping to the left side if necessary
function moveRight() {
    if (headX + 1 === boardXSize) {
        headX = 0;
    } else {
        headX = headX + 1;
    }
}

// Move character left, including looping to the right side if necessary
function moveLeft() {
    if (headX - 1 < 0) {
        headX = boardXSize - 1;
    } else {
        headX = headX - 1;
    }
}

// Move character down, including looping to the top side if necessary
function moveDown() {
    if (headY + 1 === boardYSize) {
        headY = 0;
    } else {
        headY = headY + 1;
    }
}

// Move character up, including looping to the bottom side if necessary
function moveUp() {
    if (headY - 1 < 0) {
        headY = boardYSize - 1;
    } else {
        headY = headY - 1;
    }
}

function doMovement() {
    dirMap[dir]();
}

function setDir(newDir) {
    dir = newDir;
}

// Puts self onto board, then sets something to remove it from the board in a set amount of time
function materializeSelf(x, y) {
    let block = new BodyCell(x, y, linger);
    grid[block.x][block.y] = 1;
    bodyCells.push(block);
}

function drawBackground() {
    backgroundC.fillStyle = "gray";
    backgroundC.fillRect(0, 0, grayBackX, grayBackY);
    backgroundC.fillStyle = "black";
    backgroundC.fillRect(blockWidth, blockHeight, blackBackX, blackBackY);
}

// TEST FUNCTION?
function drawHead() {
    drawBlock(headX, headY, "green");
}

function drawBody() {
    for (let i = 0; i < bodyCells.length; i++) {
        drawBlock(bodyCells[i].x, bodyCells[i].y, "green");
    }
}

function drawFood() {
    for (let i = 0; i < foodCells.length; i++) {
        drawBlock(foodCells[i].x, foodCells[i].y, powersToColors[foodCells[i].power]);
    }
}

// Draws a single block on the grid, given coordinates and a main color
function drawBlock(x, y, mainColor) {
    thisBlockC.fillStyle = "white";
    thisBlockC.fillRect(gridXStart + (x * blockWidth), gridYStart  + (y * blockHeight), blockWidth, blockHeight);
    thisBlockC.fillStyle = mainColor;
    thisBlockC.fillRect(gridXStart + (x * blockWidth) + 1, gridYStart  + (y * blockHeight) + 1, blockWidth - 2, blockHeight - 2);
}

function makeBody() {
    materializeSelf(headX, headY);
}

function isBodyCollide() {
    for (let i = 0; i < bodyCells.length; i++) {
        if (bodyCells[i].x === headX && bodyCells[i].y === headY) {
            return true;
        }
    }
    return false;
}

function isFoodCollide() {
    for (let i = 0; i < foodCells.length; i++) {
        if (foodCells[i].x === headX && foodCells[i].y === headY) {
            return foodCells[i];
        }
    }
    return false;
}

function setOriginalCSS() {

    let up = document.getElementById("up");
    let down = document.getElementById("down");
    let left = document.getElementById("left");
    let right = document.getElementById("right");
    let start = document.getElementById("start");

    start.style.display = "";

    up.classList.remove("invisiblebutton")
    down.classList.remove("invisiblebutton")
    left.classList.remove("invisiblebutton")
    right.classList.remove("invisiblebutton")

    up.classList.add("gamebuton");
    down.classList.add("gamebuton");
    left.classList.add("gamebuton");
    right.classList.add("gamebuton");

    up.classList.add("upcolor");
    down.classList.add("downcolor");
    left.classList.add("leftcolor");
    right.classList.add("rightcolor");
}

function setGameplayCSS() {
    let up = document.getElementById("up");
    let down = document.getElementById("down");
    let left = document.getElementById("left");
    let right = document.getElementById("right");
    let start = document.getElementById("start");

    up.classList.remove("gamebuton");
    down.classList.remove("gamebuton");
    left.classList.remove("gamebuton");
    right.classList.remove("gamebuton");

    up.classList.remove("upcolor");
    down.classList.remove("downcolor");
    left.classList.remove("leftcolor");
    right.classList.remove("rightcolor");


    up.classList.add("invisiblebutton")
    down.classList.add("invisiblebutton")
    left.classList.add("invisiblebutton")
    right.classList.add("invisiblebutton")

    start.style.display = "none";
}

function gameOver() {
    running = false;
    document.getElementById("score").innerText = 0;
    headX = STARTX;
    headY = STARTY;
    linger = STARTLINGER;
    dir = STARTDIR;
    slowified = 0;
    fastified = 0;
    framesPerTick = 25;
    foodCells = [];
    bodyCells = [];
    thisBlockC.clearRect(0, 0, thisBlockC.canvas.width, thisBlockC.canvas.height);
    setOriginalCSS();
    constructEmptyGrid();
    setLocalHighScore();
    newFoodScore = 0;
}

function setLocalHighScore() {
    let localFoodScore = localStorage.getItem("newFoodScore");
    if (localFoodScore !== null) {
        if (localFoodScore < newFoodScore) {
            localStorage.setItem("newFoodScore", newFoodScore);
            document.getElementById("highscore").innerText = newFoodScore;
        }
    } else {
        localStorage.setItem("newFoodScore", newFoodScore);
        document.getElementById("highscore").innerText = newFoodScore;
    }

    let newTimeScore = ((new Date).getTime() - gameStartTime) / 1000;

    let localTimeScore = localStorage.getItem("timeScore");
    if (localTimeScore !== null) {
        if (localTimeScore < newTimeScore) {
            localStorage.setItem("timeScore", newTimeScore);
            document.getElementById("besttime").innerText = newTimeScore;

        }
    } else {
        localStorage.setItem("timeScore", newTimeScore);
        document.getElementById("besttime").innerText = newTimeScore;
    }

}


function spawnNewFood() {
    // Get every coordinate that doesn't already have an element in it
    let allCoords = [];

    // Choose the correct power to give this food
    let chosenPower = powers[Math.floor(Math.random() * powers.length)];

    let cellsToAvoid = [];
    for (let i = 0; i < bodyCells.length; i++) {
        cellsToAvoid.push(new BodyCell(bodyCells[i].x, bodyCells[i].y, 0));
    }
    cellsToAvoid.push(new BodyCell(headX, headY, 0));

    for (let i = 0; i < boardXSize; i++) {
        for (let j = 0; j < boardYSize; j++) {
            allCoords.push(new BodyCell(i, j, 0, chosenPower));
        }
    }

    allCoords = allCoords.filter((item) => {
            for (let i = 0; i < cellsToAvoid.length; i++) {
                if (item.x === cellsToAvoid[i].x && item.y === cellsToAvoid[i].y) {
                    return false;
                }
            }
            return true;
        }
    );
    // Randomly choose one of them for adding the food to
    foodCells.push(allCoords[Math.floor(Math.random() * allCoords.length)]);
}

let SLEEPMAGIC = 1;

window.onkeydown = function(e) {
    if (e.code === "ArrowUp" || e.code === "KeyW") { // up
        if (dir !== 2) {
            setDir(3);
        }
    } else if (e.code === "ArrowDown" || e.code === "KeyS") { // down
        if (dir !== 3) {
            setDir(2);
        }
    } else if (e.code === "ArrowRight" || e.code === "KeyD") { // right
        if (dir !== 1) {
            setDir(0);
        }
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") { // left
        if (dir !== 0) {
            setDir(1);
        }
    }
};

// change the direction of the player, keeping in mind that
// the change shouldn't happen immediately after another one
function setDir(newDir) {
    if (dirCountdown <= 0) {
        dir = newDir;
        dirCountdown = CHANGEDIRTIME;
    }
}

window.onload = function() {
    constructEmptyGrid();
    drawBackground();
    document.getElementById("right").onclick = function() {if (dir !== 1) {setDir(0)}};
    document.getElementById("left").onclick = function() {if (dir !== 0) {setDir(1)}};
    document.getElementById("down").onclick = function() {if (dir !== 3) {setDir(2)}};
    document.getElementById("up").onclick = function() {if (dir !== 2) {setDir(3)}};
    document.getElementById("start").onclick = function() {running = true; setGameplayCSS(); gameStartTime = (new Date).getTime()};
    let localFoodScore = localStorage.getItem("newFoodScore");
    if (localFoodScore !== null) {
        document.getElementById("highscore").innerText = localFoodScore;
    } else {
        document.getElementById("highscore").innerText = 0;
    }
    let highTimeScore = localStorage.getItem("timeScore");
    if (localFoodScore !== null) {
        document.getElementById("besttime").innerText = highTimeScore;
    } else {
        document.getElementById("besttime").innerText = "0.0";
    }
    setInterval(function() {
        if (running) {
            dirCountdown -= 1;
            framesDone += 1;
            if (framesDone === framesPerTick) {
                if (foodCells.length === 0) {
                    spawnNewFood();
                }

                if (fastified > 0) {
                    fastified--;
                    if (fastified === 0) {
                        framesPerTick = 25;
                    }
                }

                if (slowified > 0) {
                    slowified--;
                    if (slowified === 0) {
                        framesPerTick = 25;
                    }
                }

                framesDone = 0;
                makeBody();
                doMovement();
                let cellsToKill = [];
                for (let i = 0; i < bodyCells.length; i++) {
                    bodyCells[i].timeLeft = bodyCells[i].timeLeft - 1;
                    if (bodyCells[i].timeLeft === 0) {
                        cellsToKill.push(bodyCells[i]);
                        grid[bodyCells[i].x][bodyCells[i].y] = 0;
                    }
                }
                bodyCells = bodyCells.filter((item) => !cellsToKill.includes(item));

                if (isBodyCollide()) {
                    gameOver();
                    return;
                }
                let colFood = isFoodCollide();
                if (colFood !== false) {
                    powersToFunctions[colFood.power]();
                    newFoodScore++;
                    document.getElementById("score").innerText = newFoodScore;
                    linger++;
                    foodCells = foodCells.filter((item) => item !== colFood);
                    spawnNewFood();
                }

                thisBlockC.clearRect(0, 0, thisBlockC.canvas.width, thisBlockC.canvas.height);
                drawHead();
                drawBody();
                drawFood();
            }
        }
    }, frametime);
};