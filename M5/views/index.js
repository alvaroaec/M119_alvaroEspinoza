const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "forestgreen";
const paddle1Color = "lightblue";
const paddle2Color = "red";
const paddleBorder = "black";
const ballColor = "yellow";
const ballBorderColor = "black";
const ballRadius = 12.5;
const paddleSpeed = 50;
let intervalID;
let ballSpeed;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score = 0;
let player2Score = 0;
let paddle1 = {
    width: 25,
    height: 100,
    x: 0,
    y: 0
};
let paddle2 = {
    width: 25,
    height: 100,
    x: gameWidth - 25,
    y: gameHeight - 100
};
const SERVERADDRESS = "http://127.0.0.1:3000"
let xmlhttp = new XMLHttpRequest()
let  sensorValue1_x = NaN
let  sensorValue1_y = NaN
let  sensorValue1_z = NaN
let  sensorValue2_x = NaN
let  sensorValue2_y = NaN
let  sensorValue2_z = NaN
const PaddleState = {
    UP: "0",
    DOWN: "1",
    STOP: "2"
};
let movePaddle1 = NaN
let movePaddle2 = NaN


window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

gameStart();

function gameStart(){
    createBall();
    nextTick();
};
function nextTick(){
    intervalID = setTimeout(() => {
        clearBoard();
        drawPaddles();
        moveBall();
        drawBall(ballX, ballY);
        checkCollision();
        nextTick();
    }, 10)
};
function clearBoard(){
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};
function drawPaddles(){
    ctx.strokeStyle = paddleBorder;

    ctx.fillStyle = paddle1Color;
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

    ctx.fillStyle = paddle2Color;
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
};
function createBall(){
    ballSpeed = 1;
    if(Math.round(Math.random()) == 1){
        ballXDirection =  1; 
    }
    else{
        ballXDirection = -1; 
    }
    if(Math.round(Math.random()) == 1){
        ballYDirection = Math.random() * 1; //more random directions
    }
    else{
        ballYDirection = Math.random() * -1; //more random directions
    }
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
};
function moveBall(){
    ballX += (ballSpeed * ballXDirection);
    ballY += (ballSpeed * ballYDirection);
};
function drawBall(ballX, ballY){
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
};
function checkCollision(){
    if(ballY <= 0 + ballRadius){
        ballYDirection *= -1;
    }
    if(ballY >= gameHeight - ballRadius){
        ballYDirection *= -1;
    }
    if(ballX <= 0){
        player2Score+=1;
        updateScore();
        createBall();
        return;
    }
    if(ballX >= gameWidth){
        player1Score+=1;
        updateScore();
        createBall();
        return;
    }
    if(ballX <= (paddle1.x + paddle1.width + ballRadius)){
        if(ballY > paddle1.y && ballY < paddle1.y + paddle1.height){
            ballX = (paddle1.x + paddle1.width) + ballRadius; // if ball gets stuck
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    if(ballX >= (paddle2.x - ballRadius)){
        if(ballY > paddle2.y && ballY < paddle2.y + paddle2.height){
            ballX = paddle2.x - ballRadius; // if ball gets stuck
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
};
function changeDirection(){
    switch(movePaddle1){
        case(UP):
            if(paddle1.y > 0){
                paddle1.y -= paddleSpeed;
            }
            break;
        case(DOWN):
            if(paddle1.y < gameHeight - paddle1.height){
                paddle1.y += paddleSpeed;
            }
            break;
        case(STOP):
            paddle1.y = paddle1.y;
            break;
    }
    switch(movePaddle2){
        case(UP):
            if(paddle2.y > 0){
                paddle2.y -= paddleSpeed;
            }
        break;
        case(DOWN):
            if(paddle2.y < gameHeight - paddle2.height){
                paddle2.y += paddleSpeed;
            }
        break;
        case(STOP) :
            paddle2.y = paddle2.y;
        break;
    }
};
function updateScore(){
    scoreText.textContent = `${player1Score} : ${player2Score}`;
};
function resetGame(){
    player1Score = 0;
    player2Score = 0;
    paddle1 = {
        width: 25,
        height: 100,
        x: 0,
        y: 0
    };
    paddle2 = {
        width: 25,
        height: 100,
        x: gameWidth - 25,
        y: gameHeight - 100
    };
    ballSpeed = 1;
    ballX = 0;
    ballY = 0;
    ballXDirection = 0;
    ballYDirection = 0;
    updateScore();
    clearInterval(intervalID);
    gameStart();
};
function transferFunction(sensorValue_y, sensorValue_x){
    if(sensorValue_y < -0.8){
        return UP;
    }
    else if(sensorValue_y > 0.8){
        return DOWN;
    }
    else if(sensorValue_x >0.5 || sensorValue_x < -0.5){
        return STOP;
    }
}
xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let responseText = xmlhttp.responseText
        sensorValue1_x = parseFloat(JSON.parse(responseText).sensorValue1_x)
        sensorValue1_y = parseFloat(JSON.parse(responseText).sensorValue1_y)
        sensorValue1_z = parseFloat(JSON.parse(responseText).sensorValue1_z)
        movePaddle1 = transferFunction(sensorValue1_y, sensorValue1_z);
        movePaddle2 = transferFunction(sensorValue2_y, sensorValue2_z);
    }
}
// periodically grab data
let getData = () => {
    xmlhttp.open("POST", SERVERADDRESS, true)
    xmlhttp.setRequestHeader("Content-type", "application/json")
    xmlhttp.send("")
    setTimeout(() => {
        getData()
    }, 10)
}
getData()