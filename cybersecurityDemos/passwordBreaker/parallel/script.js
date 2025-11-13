let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let workers = [];
let workerCount = 4;

const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const pinInput = document.getElementById("pin-input");
const randomBtn = document.getElementById("random-pin");

const attemptsLabel = document.getElementById("attempts");
const timeLabel = document.getElementById("time");
const statusLabel = document.getElementById("status-label");
const currentAttemptLbl = document.getElementById("current-attempt");
const threadCountLbl = document.getElementById("thread-count");
const logBox = document.getElementById("log-box");

const indicator = document.getElementById("indicator");
const indicatorLabel = document.getElementById("indicator-label");

// LOGGING
function log(text) {
  const el = document.createElement("div");
  el.className = "log-line";
  el.textContent = text;
  logBox.appendChild(el);
  logBox.scrollTop = logBox.scrollHeight;
}

function randomPIN() {
  const pin = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  pinInput.value = pin;
}
randomBtn.addEventListener("click", randomPIN);

// ----------------------------------------------------------------
// START PARALLEL ATTACK
// ----------------------------------------------------------------
startBtn.addEventListener("click", () => {
    correctPIN = pinInput.value.trim();

    if (!/^\d{4}$/.test(correctPIN)) {
        alert("Enter a valid 4-digit PIN.");
        return;
    }

    running = true;
    attempts = 0;
    logBox.innerHTML = "";
    attemptsLabel.textContent = "0";
    timeLabel.textContent = "0.000s";
    currentAttemptLbl.textContent = "None";

    statusLabel.textContent = "Running...";
    indicator.classList.add("active");
    indicatorLabel.textContent = "Running";

    startBtn.disabled = true;
    stopBtn.disabled = false;

    startTime = performance.now();

    // THREAD SPLIT
    workers = [];
    const ranges = [
        [0, 2499],
        [2500, 4999],
        [5000, 7499],
        [7500, 9999],
    ];

    threadCountLbl.textContent = ranges.length;

    for (let i = 0; i < ranges.length; i++) {
        const worker = new Worker("worker.js");

        worker.postMessage({
        correctPIN,
        start: ranges[i][0],
        end: ranges[i][1],
        id: i + 1,
        });

        worker.onmessage = (msg) => {
        const data = msg.data;

            if (data.type === "attempt") {
                attempts++;
                attemptsLabel.textContent = attempts;

                currentAttemptLbl.textContent = `${data.pin} (Thread ${data.id})`;

                // CREATE COLORED LOG LINE
                const el = document.createElement("div");
                el.className = "log-line thread-" + data.id;   // <-- COLOR CLASS
                el.textContent = `[Thread ${data.id}] Testing ${data.pin}`;
                logBox.appendChild(el);
                logBox.scrollTop = logBox.scrollHeight;
            }

            if (data.type === "found") {
                statusLabel.textContent = `PIN Found by Thread ${data.id}!`;

                indicator.classList.remove("active");
                indicatorLabel.textContent = "Done";

                stopAllWorkers();

                startBtn.disabled = false;
                stopBtn.disabled = true;

                currentAttemptLbl.textContent = "—";
            }
        };

        workers.push(worker);
    }

    requestAnimationFrame(updateTime);
});

// ----------------------------------------------------------------
// TIMER UPDATER
// ----------------------------------------------------------------
function updateTime() {
    if (!running) return;
    const elapsed = (performance.now() - startTime) / 1000;
    timeLabel.textContent = elapsed.toFixed(3) + "s";
    requestAnimationFrame(updateTime);
}

// ----------------------------------------------------------------
// STOP PARALLEL ATTACK
// ----------------------------------------------------------------
function stopAllWorkers() {
    running = false;

    for (const w of workers) w.terminate();

    workers = [];
    threadCountLbl.textContent = "0";
}

stopBtn.addEventListener("click", () => {
    stopAllWorkers();

    indicator.classList.remove("active");
    indicatorLabel.textContent = "Stopped";
    statusLabel.textContent = "Stopped";

    startBtn.disabled = false;
    stopBtn.disabled = true;
});
