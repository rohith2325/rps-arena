// =====================================
// RPS ARENA - VERSION 3.0
// =====================================

let userScore = 0;
let computerScore = 0;
let roundCount = 0;
let winStreak = 0;
let matchOver = false;
let soundEnabled = true;
let difficulty = "easy";

const winningScore = 3;
const choices = ["rock", "paper", "scissors"];

const emojis = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// =====================================
// HTML ELEMENTS
// =====================================

const choiceButtons = document.querySelectorAll(".choice");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const userScoreDisplay = document.getElementById("userScore");
const computerScoreDisplay = document.getElementById("computerScore");

const userMove = document.getElementById("userMove");
const computerMove = document.getElementById("computerMove");

const result = document.getElementById("result");
const resultIcon = document.getElementById("resultIcon");
const resultMessage = document.getElementById("resultMessage");

const roundNumber = document.getElementById("roundNumber");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const winStreakDisplay = document.getElementById("winStreak");
const matchWinsDisplay = document.getElementById("matchWins");
const totalRoundsDisplay = document.getElementById("totalRounds");

const historyList = document.getElementById("historyList");
const leaderboardList = document.getElementById("leaderboardList");

const resetBtn = document.getElementById("resetBtn");
const soundBtn = document.getElementById("soundBtn");

const winRateDisplay = document.getElementById("winRate");

const playerNameInput = document.getElementById("playerNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const profileName = document.getElementById("profileName");

const winnerModal = document.getElementById("winnerModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerDescription = document.getElementById("winnerDescription");

const finalUserScore = document.getElementById("finalUserScore");
const finalComputerScore = document.getElementById("finalComputerScore");

const playAgainBtn = document.getElementById("playAgainBtn");
const closeWinnerBtn = document.getElementById("closeWinnerBtn");

let playerName = localStorage.getItem("rpsPlayerName") || "PLAYER";

// =====================================
// LOCAL STORAGE
// =====================================

function loadStorage(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        return fallback;
    }
}

let savedStats = {
    matchWins: 0,
    totalRounds: 0,
    matchesPlayed: 0,
    ...loadStorage("rpsArenaStats", {})
};

let leaderboard = loadStorage("rpsLeaderboard", []);

let history = [];

// =====================================
// SAVE STATISTICS
// =====================================

function saveStats() {
    localStorage.setItem(
        "rpsArenaStats",
        JSON.stringify(savedStats)
    );

    updateStats();
}

function updateStats() {
    matchWinsDisplay.textContent = savedStats.matchWins;
    totalRoundsDisplay.textContent = savedStats.totalRounds;
    winStreakDisplay.textContent = winStreak;

    const winRate = savedStats.matchesPlayed > 0
        ? Math.round(
            (savedStats.matchWins / savedStats.matchesPlayed) * 100
        )
        : 0;

    winRateDisplay.textContent = winRate + "%";
}

// =====================================
// SOUND EFFECTS
// =====================================

function playSound(frequency, duration = 150) {
    if (!soundEnabled) return;

    try {
        const audioContext = new (
            window.AudioContext || window.webkitAudioContext
        )();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.12,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration / 1000
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration / 1000
        );

        oscillator.onended = () => audioContext.close();

    } catch (error) {
        console.log("Sound is not supported.");
    }
}

// =====================================
// COMPUTER DIFFICULTY
// =====================================

function getComputerChoice(userChoice) {

    // EASY: Completely random
    if (difficulty === "easy") {
        return choices[
            Math.floor(Math.random() * choices.length)
        ];
    }

    // MEDIUM: 50% chance of countering the player
    if (difficulty === "medium") {

        if (Math.random() < 0.5) {
            return getWinningMove(userChoice);
        }

        return choices[
            Math.floor(Math.random() * choices.length)
        ];
    }

    // HARD: Always chooses a winning move
    if (difficulty === "hard") {
        return getWinningMove(userChoice);
    }

}

function getWinningMove(choice) {

    const winningMoves = {
        rock: "paper",
        paper: "scissors",
        scissors: "rock"
    };

    return winningMoves[choice];
}

// =====================================
// MAIN GAME
// =====================================

function playGame(userChoice) {

    if (matchOver) return;

    const computerChoice = getComputerChoice(userChoice);

    roundCount++;
    savedStats.totalRounds++;

    userMove.textContent = emojis[userChoice];
    computerMove.textContent = emojis[computerChoice];

    choiceButtons.forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.choice === userChoice
        );
    });

    let roundResult;

    if (userChoice === computerChoice) {

        roundResult = "draw";

        result.textContent = "DRAW!";
        resultMessage.textContent = "Nobody wins this round.";
        resultIcon.textContent = "🤝";

        winStreak = 0;

        playSound(350);

    } else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "paper" && computerChoice === "rock") ||
        (userChoice === "scissors" && computerChoice === "paper")
    ) {

        roundResult = "win";

        userScore++;
        winStreak++;

        result.textContent = "YOU WIN!";
        resultMessage.textContent = "Amazing move! Keep going!";
        resultIcon.textContent = "🏆";

        playSound(700, 250);

    } else {

        roundResult = "lose";

        computerScore++;
        winStreak = 0;

        result.textContent = "YOU LOSE!";
        resultMessage.textContent = "The computer wins this round.";
        resultIcon.textContent = "💻";

        playSound(200, 300);
    }

    result.className = roundResult;

    userScoreDisplay.textContent = userScore;
    computerScoreDisplay.textContent = computerScore;

    updateStats();
    saveStats();

    updateProgress();

    addHistory(userChoice, computerChoice, roundResult);

    checkMatchWinner();
}

// =====================================
// PROGRESS
// =====================================

function updateProgress() {

    roundNumber.textContent =
        `ROUND ${Math.min(roundCount + 1, 5)}`;

    progressText.textContent =
        `${roundCount} / 5 ROUNDS`;

    progressBar.style.width =
        `${(roundCount / 5) * 100}%`;
}

// =====================================
// CHECK MATCH WINNER
// =====================================

function checkMatchWinner() {

    if (userScore === winningScore) {

        matchOver = true;

        result.textContent = "CHAMPION!";
        resultMessage.textContent =
            "Congratulations! You won the match!";

        resultIcon.textContent = "👑";
        result.className = "win";

        savedStats.matchWins++;

        saveLeaderboard(playerName, userScore);

        launchConfetti();

        playSound(900, 500);

        showWinnerModal(true);

    } else if (computerScore === winningScore) {

        matchOver = true;

        result.textContent = "MATCH LOST!";
        resultMessage.textContent =
            "The computer won this match. Try again!";

        resultIcon.textContent = "🤖";
        result.className = "lose";

        playSound(150, 500);

        showWinnerModal(false);
    }

    if (matchOver) {

        savedStats.matchesPlayed++;

        choiceButtons.forEach(button => {
            button.disabled = true;
        });

        resultMessage.textContent +=
            " Start a new match to play again.";

        saveStats();
    }
}

// =====================================
// GAME HISTORY
// =====================================

function addHistory(userChoice, computerChoice, roundResult) {

    history.unshift({
        userChoice,
        computerChoice,
        roundResult,
        round: roundCount
    });

    history = history.slice(0, 5);

    renderHistory();
}

function renderHistory() {

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML =
            '<p class="empty-history">Your battle history will appear here.</p>';

        return;
    }

    history.forEach(item => {

        const historyItem = document.createElement("div");

        historyItem.className = "history-item";

        const round = document.createElement("span");
        round.textContent = `ROUND ${item.round}`;

        const moves = document.createElement("span");

        moves.textContent =
            `${emojis[item.userChoice]} vs ${emojis[item.computerChoice]}`;

        const outcome = document.createElement("span");

        outcome.className =
            `history-result ${item.roundResult}`;

        outcome.textContent =
            item.roundResult.toUpperCase();

        historyItem.append(round, moves, outcome);

        historyList.appendChild(historyItem);
    });
}

// =====================================
// LEADERBOARD
// =====================================

function saveLeaderboard(name, score) {

    leaderboard.push({
        name: name,
        score: score,
        date: new Date().toLocaleDateString()
    });

    leaderboard.sort((a, b) => b.score - a.score);

    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem(
        "rpsLeaderboard",
        JSON.stringify(leaderboard)
    );

    renderLeaderboard();
}

function renderLeaderboard() {

    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {

        leaderboardList.innerHTML =
            '<p class="empty-history">No match records yet.</p>';

        return;
    }

    leaderboard.forEach((item, index) => {

        const row = document.createElement("div");

        row.className = "leaderboard-item";

        const rank = document.createElement("span");
        rank.textContent = `#${index + 1} ${item.name}`;

        const score = document.createElement("strong");
        score.textContent = `${item.score} WINS`;

        row.append(rank, score);

        leaderboardList.appendChild(row);
    });
}

// =====================================
// CONFETTI EFFECT
// =====================================

function launchConfetti() {

    const colors = [
        "#9b5cff",
        "#ed5bff",
        "#36e6a0",
        "#ffd166",
        "#ffffff"
    ];

    for (let i = 0; i < 100; i++) {

        const piece = document.createElement("div");

        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";

        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        piece.style.animationDuration =
            2 + Math.random() * 2 + "s";

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 4500);
    }
}

// =====================================
// DIFFICULTY BUTTONS
// =====================================

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (roundCount > 0 && !matchOver) {
            result.textContent = "FINISH THE MATCH!";
            resultMessage.textContent =
                "Start a new match to change difficulty.";
            return;
        }

        difficulty = button.dataset.level;

        difficultyButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        result.textContent = "READY?";
        resultMessage.textContent =
            `${difficulty.toUpperCase()} MODE SELECTED`;

        result.className = "";

        playSound(500);
    });
});

// =====================================
// CHOICE BUTTONS
// =====================================

choiceButtons.forEach(button => {

    button.addEventListener("click", () => {
        playGame(button.dataset.choice);
    });

});

// =====================================
// RESET MATCH
// =====================================

function resetGame() {

    userScore = 0;
    computerScore = 0;
    roundCount = 0;
    winStreak = 0;
    matchOver = false;

    userScoreDisplay.textContent = 0;
    computerScoreDisplay.textContent = 0;

    userMove.textContent = "❔";
    computerMove.textContent = "❔";

    result.textContent = "READY?";
    result.className = "";

    resultIcon.textContent = "⚡";

    resultMessage.textContent =
        "The battle starts with you!";

    history = [];

    renderHistory();

    choiceButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove("selected");
    });

    updateProgress();
    updateStats();

    playSound(500);
}

// =====================================
// RESET BUTTON
// =====================================

resetBtn.addEventListener("click", resetGame);

// =====================================
// SOUND CONTROL
// =====================================

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    soundBtn.textContent = soundEnabled
        ? "🔊 SOUND ON"
        : "🔇 SOUND OFF";

    if (soundEnabled) {
        playSound(500);
    }
});

// =====================================
// INITIALIZE
// =====================================

updateStats();
renderHistory();
renderLeaderboard();
updateProgress();

// PLAYER PROFILE

function updatePlayerName() {
    profileName.textContent = playerName;
    playerNameInput.value = playerName === "PLAYER" ? "" : playerName;
}

saveNameBtn.addEventListener("click", () => {

    const enteredName = playerNameInput.value.trim();

    if (!enteredName) {
        alert("Please enter your player name.");
        return;
    }

    playerName = enteredName.toUpperCase();

    localStorage.setItem("rpsPlayerName", playerName);

    updatePlayerName();
});

playerNameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        saveNameBtn.click();
    }
});


// WINNER MODAL

function showWinnerModal(won) {

    finalUserScore.textContent = userScore;
    finalComputerScore.textContent = computerScore;

    if (won) {
        winnerTitle.textContent = "YOU ARE THE CHAMPION!";
        winnerDescription.textContent =
            `${playerName}, incredible performance!`;
    } else {
        winnerTitle.textContent = "MATCH LOST!";
        winnerDescription.textContent =
            "The computer won this time. Come back stronger!";
    }

    winnerModal.classList.add("show");
}

playAgainBtn.addEventListener("click", () => {
    winnerModal.classList.remove("show");
    resetGame();
});

closeWinnerBtn.addEventListener("click", () => {
    winnerModal.classList.remove("show");
});


// INITIALIZE PROFILE

updatePlayerName();
updateStats();

// BACKGROUND MUSIC
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggleBtn = document.getElementById("musicToggleBtn");

let musicEnabled = true;

backgroundMusic.volume = 0.25;

function startBackgroundMusic() {
    if (musicEnabled) {
        backgroundMusic.play().catch(error => {
            console.log("Music will start after user interaction.");
        });
    }
}

document.addEventListener("click", startBackgroundMusic, { once: true });

musicToggleBtn.addEventListener("click", () => {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
        backgroundMusic.play();
        musicToggleBtn.textContent = "🎵 MUSIC: ON";
    } else {
        backgroundMusic.pause();
        musicToggleBtn.textContent = "🔇 MUSIC: OFF";
    }
});