const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawScoreEl = document.getElementById("drawScore");

const themeSelector = document.getElementById("themeSelector");
const gameMode = document.getElementById("gameMode");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

let scores = JSON.parse(localStorage.getItem("scores")) || {
    X: 0,
    O: 0,
    D: 0
};

const wins = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

/* ==========================
   INITIALIZATION
========================== */

updateScoreboard();

const savedTheme =
    localStorage.getItem("theme") || "neon";

if(themeSelector){
    themeSelector.value = savedTheme;

    applyTheme(savedTheme);

    themeSelector.addEventListener(
        "change",
        () => {

            applyTheme(
                themeSelector.value
            );

            localStorage.setItem(
                "theme",
                themeSelector.value
            );
        }
    );
}

cells.forEach(cell => {
    cell.addEventListener(
        "click",
        playMove
    );
});

/* ==========================
   GAMEPLAY
========================== */

function playMove(){

    const index = this.dataset.index;

    if(board[index] || !gameActive) return;

    makeMove(index);

    if(!gameActive) return;

    const mode = gameMode.value;

    if(mode !== "multi" && currentPlayer === "O"){

        setTimeout(() => {

            if(mode === "easy"){
                easyAI();
            }

            else if(mode === "medium"){
                mediumAI();
            }

            else if(mode === "impossible"){
                impossibleAI();
            }

        }, 500);
    }
}

function makeMove(index){

    board[index] = currentPlayer;

    cells[index].textContent = currentPlayer;

    if(currentPlayer === "X"){
        cells[index].classList.add("x");
    }else{
        cells[index].classList.add("o");
    }

    checkGame();

    if(gameActive){

        currentPlayer =
            currentPlayer === "X"
            ? "O"
            : "X";

        updateStatus();
    }
}

function easyAI(){

    const empty = board
        .map((v,i)=>v==="" ? i : null)
        .filter(v=>v!==null);

    const move =
        empty[
            Math.floor(
                Math.random()*empty.length
            )
        ];

    makeMove(move);
}

function mediumAI(){

    if(Math.random() < 0.7){

        const move = findWinningMove("O")
            ?? findWinningMove("X");

        if(move !== null){

            makeMove(move);

            return;
        }
    }

    easyAI();
}

function findWinningMove(player){

    for(let combo of wins){

        const [a,b,c] = combo;

        const line = [
            board[a],
            board[b],
            board[c]
        ];

        if(
            line.filter(x=>x===player).length===2 &&
            line.includes("")
        ){

            if(board[a]==="") return a;
            if(board[b]==="") return b;
            if(board[c]==="") return c;
        }
    }

    return null;
}

function impossibleAI(){

    let bestScore = -Infinity;
    let move;

    for(let i=0;i<9;i++){

        if(board[i]===""){

            board[i]="O";

            let score =
                minimax(
                    board,
                    0,
                    false
                );

            board[i]="";

            if(score > bestScore){

                bestScore = score;

                move = i;
            }
        }
    }

    makeMove(move);
}

function minimax(boardState, depth, isMaximizing){

    const result =
        evaluateBoard(boardState);

    if(result !== null){

        return result;
    }

    if(isMaximizing){

        let best = -Infinity;

        for(let i=0;i<9;i++){

            if(boardState[i]===""){

                boardState[i]="O";

                best = Math.max(
                    best,
                    minimax(
                        boardState,
                        depth+1,
                        false
                    )
                );

                boardState[i]="";
            }
        }

        return best;
    }

    else{

        let best = Infinity;

        for(let i=0;i<9;i++){

            if(boardState[i]===""){

                boardState[i]="X";

                best = Math.min(
                    best,
                    minimax(
                        boardState,
                        depth+1,
                        true
                    )
                );

                boardState[i]="";
            }
        }

        return best;
    }
}

function evaluateBoard(state){

    for(let combo of wins){

        const [a,b,c] = combo;

        if(
            state[a] &&
            state[a]===state[b] &&
            state[a]===state[c]
        ){

            return state[a]==="O"
                ? 10
                : -10;
        }
    }

    if(!state.includes("")){

        return 0;
    }

    return null;
}

function updateStatus(){

    if(
        gameMode.value !== "multi" &&
        currentPlayer === "O"
    ){

        statusText.innerHTML =
            "🤖 AI Thinking...";
    }

    else{

        statusText.innerHTML =
            currentPlayer==="X"
            ? "Player ❌ Turn"
            : "Player ⭕ Turn";
    }
}

function checkGame(){

    for(let combo of wins){

        const [a,b,c] = combo;

        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ){

            gameActive = false;

            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");

            if(currentPlayer === "X"){
                scores.X++;
            }else{
                scores.O++;
            }

            updateScoreboard();

            launchConfetti();

            setTimeout(() => {

                popup.classList.add("show");

                popupTitle.innerHTML =
                    "🏆 WINNER!";

                popupText.innerHTML =
                    currentPlayer === "X"
                    ? "🎉 Player ❌ Wins! 🎊"
                    : "🎉 Player ⭕ Wins! 🎊";

            }, 500);

            return;
        }
    }

    if(!board.includes("")){

        gameActive = false;

        scores.D++;

        updateScoreboard();

        setTimeout(() => {

            popup.classList.add("show");

            popupTitle.innerHTML =
                "🤝 DRAW";

            popupText.innerHTML =
                "😅 Nobody Wins! Try Again!";

        }, 400);
    }
}

/* ==========================
   SCOREBOARD
========================== */

function updateScoreboard(){

    if(xScoreEl)
        xScoreEl.textContent =
            scores.X;

    if(oScoreEl)
        oScoreEl.textContent =
            scores.O;

    if(drawScoreEl)
        drawScoreEl.textContent =
            scores.D;

    localStorage.setItem(
        "scores",
        JSON.stringify(scores)
    );
}

/* ==========================
   RESTART
========================== */

function restartGame(){

    board = [
        "","","",
        "","","",
        "","",""
    ];

    currentPlayer = "X";

    gameActive = true;

    updateStatus();

    cells.forEach(cell => {

        cell.textContent = "";

        cell.className = "cell";
    });

    popup.classList.remove("show");
}

function closePopup(){
    restartGame();
}

/* ==========================
   THEMES
========================== */

function applyTheme(theme){

    if(theme === "dark"){

        document.body.style.background =
            "linear-gradient(135deg,#111,#333)";
    }

    else if(theme === "light"){

        document.body.style.background =
            "linear-gradient(135deg,#dfe9f3,#ffffff)";
    }

    else{

        document.body.style.background =
            "linear-gradient(-45deg,#ff0080,#7928ca,#00d4ff,#00ff99)";
    }
}

/* ==========================
   CONFETTI
========================== */

function launchConfetti(){

    const colors = [
        "#ff0080",
        "#00ffff",
        "#00ff99",
        "#ffea00",
        "#ff5500",
        "#7928ca"
    ];

    for(let i=0;i<120;i++){

        const confetti =
            document.createElement("div");

        confetti.classList.add(
            "confetti"
        );

        confetti.style.left =
            Math.random()*100 + "vw";

        confetti.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        confetti.style.width =
        confetti.style.height =
            Math.random()*10 + 5 + "px";

        confetti.style.animationDuration =
            Math.random()*3 + 2 + "s";

        document.body.appendChild(
            confetti
        );

        setTimeout(() => {

            confetti.remove();

        }, 5000);
    }
}

/* ==========================
   START
========================== */

updateStatus();

let deferredPrompt;

const installBtn =
    document.getElementById("installBtn");

window.addEventListener(
    "beforeinstallprompt",
    e => {

        e.preventDefault();

        deferredPrompt = e;

        installBtn.style.display = "inline-block";
    }
);

installBtn.addEventListener(
    "click",
    async () => {

        if(!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installBtn.style.display = "none";
    }
);

if("serviceWorker" in navigator){

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker.register(
                "./service-worker.js"
            )

            .then(() => {

                console.log(
                    "Service Worker Registered"
                );

            })

            .catch(err => {

                console.error(err);

            });
        }
    );
}