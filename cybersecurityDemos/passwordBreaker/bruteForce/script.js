// VARIABLES
let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let interval = null;

// BUTTONS & ELEMENTS
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const pinInput = document.getElementById("pin-input");
const randomBtn = document.getElementById("random-pin");

// LABELS & LOG
const attemptsLabel = document.getElementById("attempts");
const timeLabel = document.getElementById("time");
const statusLabel = document.getElementById("status-label");
const logBox = document.getElementById("log-box");
const indicator = document.getElementById("indicator");
const indicatorLabel = document.getElementById("indicator-label");

// LOG FUNCTION 
function log(text) {
    const div = document.createElement("div");
    div.className = "log-line";
    div.textContent = text;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
}

// RANDOM PIN GENERATOR
function randomPIN() {
    const pin = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    pinInput.value = pin;
}

// EVENT LISTENER
randomBtn.addEventListener("click", randomPIN);

// MAIN LOOP
function bruteForceLoop() {
    if (!running) return;

    const elapsed = (performance.now() - startTime) / 1000;
    timeLabel.textContent = elapsed.toFixed(3) + "s";

    const attemptPIN = attempts.toString().padStart(4, "0");
    log(`Tried ${attemptPIN}`);

    if (attemptPIN === correctPIN) {
        statusLabel.textContent = "PIN Found!";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearInterval(interval);
        return;
    }

    attempts++;
    attemptsLabel.textContent = attempts;

    if (attempts >= 10000) {
        statusLabel.textContent = "Not Found (???)";
        running = false;

        clearInterval(interval);
    }
}

startBtn.addEventListener("click", () => {
    correctPIN = pinInput.value.trim();

    if (!/^\d{4}$/.test(correctPIN)) {
        alert("Enter a valid 4-digit PIN");
        return;
    }

    running = true;
    attempts = 0;
    logBox.innerHTML = "";
    attemptsLabel.textContent = "0";
    statusLabel.textContent = "Running...";
    indicator.classList.add("active");
    indicatorLabel.textContent = "Running";
    startTime = performance.now();

    startBtn.disabled = true;
    stopBtn.disabled = false;

    interval = setInterval(bruteForceLoop, 10);
});

stopBtn.addEventListener("click", () => {
    running = false;
    clearInterval(interval);
    indicator.classList.remove("active");
    indicatorLabel.textContent = "Stopped";
    statusLabel.textContent = "Stopped";
    startBtn.disabled = false;
    stopBtn.disabled = true;
});
