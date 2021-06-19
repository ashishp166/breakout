const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreDisplay = document.querySelector(".high-score");
const reset = document.querySelector(".reset");
var drawInterval,x,myMusic,overSound,chompSound,nopress;
const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
canvas.width = innerWidth * .8
canvas.height = innerHeight * .8

let rightKey = false
let leftKey = false
let spaceKey = false
let highScore = parseInt(localStorage.getItem("highScore"))
let score = 0
let resume = true
var modalGame = document.getElementById("myModal");

document.addEventListener("keydown", keyDownHandler)
document.addEventListener("keyup", keyUpHandler)

let value = document.getElementById('maxScore').textContent.split(" ")
var points = Number.parseInt(value[value.length-1])
let atmp = document.getElementById('Attempts').textContent.split(" ")
var attemptsNum = Number.parseInt(atmp[atmp.length-1])
console.log(attemptsNum)


function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightKey = true
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftKey = true
    } else if (e.key == " " || e.key == "Spacebar") {
        spaceKey = true
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightKey = false
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftKey = false
    } else if (e.key == " " || e.key == "Spacebar") {
        spaceKey = false 
    }
}

if(isNaN(highScore)) {
    highScore = 0
}
window.onload = function() {
    //scoreDisplay.innerHTML = `Local High Score: ${highScore}`
    reset.addEventListener("click", () => {
        localStorage.setItem("highScore", "0")
        score = 0
        //scoreDisplay.innerHTML = `Local High Score: 0`
        drawBricks()
    })
}
function drawScore() {
    c.font = "16px Arial";
    c.fillStyle = "#230c33";
    c.fillText("Score: " + score, 8, 20);
}

const playerColor = 'LightPink'
const playerRadius = 10
let speed = 3

let Player = {
    x: canvas.width / 2 - playerRadius / 2,
    y: canvas.height - 75,
    dx: speed,
    dy: -speed + 1,
    radius: playerRadius,
    color: playerColor,
    draw: function() {
        c.beginPath() 
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}
const boardHeight = 20
const boardWidth = 100
const boardColor = 'CadetBlue'
let Board = {
    height: boardHeight,
    width: boardWidth,
    x: canvas.width / 2 - (boardWidth / 2),
    y: canvas.height - 50 + boardHeight,
    color: boardColor,
    draw: function() {
        c.beginPath()
        c.rect(this.x, this.y, this.width, this.height)
        c.fillStyle = this.color
        c.fill()
    }
}


var blockRow = 3
var blockCol = 8
var blockWidth = canvas.width / (blockCol + 2)
var blockHeight = 20
var blockSpacing = (canvas.width - (blockWidth * blockCol) )/ (blockCol + 1)
var blockTop = 30
var blockLeft = blockSpacing 

var blocks = []

function generateBlocks() {
    for(let i = 0; i < blockCol; i++) {
        blocks[i] = []
        for(let j = 0; j < blockRow; j++) {
            blocks[i][j] = {x: 0, y: 0, status: 1}
        }
    }
    openModalButtons.forEach(button => {
        button.addEventListener("click", () => {
            let modal = document.querySelector(button.dataset.modalTarget)
            openModal(modal);
            nopress = true;
        });
    });
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            let modal = button.closest('.modal');
            closeModal(modal);
            nopress = false;
        });
    });
}

function drawBricks() {
    for(let co = 0; co < blockCol; co++){
        for(let r = 0; r < blockRow; r++) {
            if(blocks[co][r].status === 1) {
                let blockX = co * (blockWidth + blockSpacing) + blockLeft
                let blockY = r * (blockHeight + blockSpacing) + blockTop
                blocks[co][r].x = blockX
                blocks[co][r].y = blockY
                c.rect(blockX, blockY, blockWidth, blockHeight)
                c.fillStyle = 'CadetBlue'
                c.fill()
            }
        }
    }
}

function collision() {
    for (let co = 0; co < blockCol; co++) {
        for (let r = 0; r < blockRow; r++) {
            let b = blocks[co][r]
            if (
                b.status == 1 && 
                Player.x >= b.x - Player.radius &&
                Player.x <= b.x + blockWidth + Player.radius&&
                Player.y >= b.y - Player.radius && 
                Player.y <= b.y + blockHeight + Player.radius
            ) {
                Player.dy *= -1
                b.status = 0
                score++
            }
        }
    }
}

function nextLevel() {
    if (score % 15 == 0 && score != 0) {
        if (Player.y > canvas.height / 2) {
            generateBlocks();
        }
        if (gameLevelUp) {
            if (Player.dy > 0) {
                Player.dy += 1;
                gameLevelUp = false;
            } else {
                Player.dy -= 1;
                gameLevelUp = false;
            }
        console.log(Player.dy);
        }
    }
    
    if (score % 15 != 0) {
        gameLevelUp = true;
    }
}

function movePaddle() {
    if(rightKey) {
        Board.x += 7
        if(Board.x + Board.width > canvas.width) {
            Board.x = canvas.width - Board.width
        } 
    } else if (leftKey) {
        Board.x -= 7
        if(Board.x < 0) {
            Board.x = 0
        }
    }
}

function wait() {
    if(!spaceKey) {
        console.log('by')
        resume = false
        modalGame.style.display = "block";
        Player.x = Board.x + Board.width / 2 - Player.radius / 2
        Player.y = canvas.height - 40
        Player.draw()
        Board.draw()
    } else {
        modalGame.style.display = "none";
        resume = true
        console.log('hi')
    }
}

function updateDB(s, a) {
    let profile = document.getElementById('profile');
    if (profile) {
        let username = profile.textContent.split(" ")
        username = username[username.length-1]
        console.log('username', username, 'attempts', attemptsNum, a)
        $.post('/update', { username: username, score: s , attempts: a});
    }
};




function openModal(modal) {
    if (modal == null) {
        console.log("modal not found")
        return;
    }
    let modals = document.querySelectorAll('.modal.active');
    modals.forEach(modalt => closeModal(modalt));
    modal.classList.add('active');
    overlay.classList.add('active');
};

function closeModal(modal) {
    if (modal == null) {
        console.log("modal not found")
        return;
    }    
    modal.classList.remove('active');
    overlay.classList.remove('active');
};

function play() {
    if(resume) {
        c.clearRect(0, 0, canvas.width, canvas.height)
        drawBricks()
        Player.draw()
        Board.draw()
        movePaddle()
        collision()
        nextLevel()
        drawScore()
        
        Player.x += Player.dx
        Player.y += Player.dy
        if(Player.x + Player.radius > canvas.width || Player.x - Player.radius < 0) {
            Player.dx *= -1
        }
        if(Player.y + Player.radius > canvas.height || Player.y - Player.radius < 0) {
            Player.dy *= -1
        }
    
        if (Player.y + Player.radius > canvas.height) {
            console.log(Player.y)
            if (score > parseInt(localStorage.getItem("highScore"))) {
                localStorage.setItem("highScore", score.toString())
                scoreDisplay.innerHTML = `Local High Score: ${score}`
            }
            if(score > points) {
                console.log(score)
                console.log('points', points)
                let maxScore = document.getElementById("maxScore");
                maxScore.textContent = `User High Score: ${score}`;
            }
            attemptsNum += 1
            updateDB(score, attemptsNum)
            let Attempts = document.getElementById("Attempts")
            Attempts.textContent = `User Attempts: ${attemptsNum}` 
            console.log(attemptsNum)
            score = 0
            generateBlocks()
            c.clearRect(0, 0, canvas.width, canvas.height)
            drawBricks()
            wait()
            Player.dy *= -1
        }
    
        if(
            Player.y + Player.radius >= canvas.height - Board.height* 1.5&&
            Player.x >= Board.x && 
            Player.x <= Board.x + Board.width
        ) {
            Player.dy *= -1
        }
    } else {
        wait()
    }
    
    requestAnimationFrame(play)
}

generateBlocks()
play()