/* ============================================================
   bruteForce/script.js
   Naive brute force attack demo — checks every PIN from 0000 to 9999.

   Responsibilities:
   - Manages run state and iterates sequentially through all 10,000 PINs
   - Updates the attempt log, counter, timer, and status label each tick
   - Handles start/stop button state and random PIN generation
   - Runs via setInterval so the browser UI stays responsive

   Sections:
   1) STATE + DOM REFERENCES
   2) LOG HELPER
   3) RANDOM PIN GENERATOR
   4) MAIN BRUTE FORCE LOOP
   5) START / STOP HANDLERS
   ============================================================ */

/* ============================================================
   1) STATE + DOM REFERENCES
   ============================================================ */
let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let interval = null;

const startBtn       = document.getElementById("start-btn");
const stopBtn        = document.getElementById("stop-btn");
const pinInput       = document.getElementById("pin-input");
const randomBtn      = document.getElementById("random-pin");

const attemptsLabel  = document.getElementById("attempts");
const timeLabel      = document.getElementById("time");
const statusLabel    = document.getElementById("status-label");
const logBox         = document.getElementById("log-box");
const indicator      = document.getElementById("indicator");
const indicatorLabel = document.getElementById("indicator-label");

/* ============================================================
   2) LOG HELPER
   ============================================================ */
function log(text) {
    const div = document.createElement("div");
    div.className = "log-line";
    div.textContent = text;
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
}

/* ============================================================
   3) RANDOM PIN GENERATOR
   ============================================================ */
function randomPIN() {
    pinInput.value = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
}

randomBtn.addEventListener("click", randomPIN);

/* ============================================================
   4) MAIN BRUTE FORCE LOOP
   ============================================================ */
function bruteForceLoop() {
    if (!running) return;

    timeLabel.textContent = ((performance.now() - startTime) / 1000).toFixed(3) + "s";

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

/* ============================================================
   5) START / STOP HANDLERS
   ============================================================ */
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
