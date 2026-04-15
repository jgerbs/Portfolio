/* ============================================================
   parallel/script.js
   Parallel heuristic PIN attack — splits the search across 4 Web Workers.

   Responsibilities:
   - Builds a unified heuristic list (common PINs, patterns, sequences, birth years,
     full brute force fallback) and deduplicates it
   - Divides the list into equal chunks and spawns one Worker per chunk
   - Aggregates attempt counts, live log entries, and timer via rAF
   - Terminates all workers immediately when any one finds the correct PIN
   - Handles start/stop button state and random PIN generation

   Sections:
   1) STATE + DOM REFERENCES
   2) HEURISTIC LIST BUILDER
   3) LOG HELPER + RANDOM PIN
   4) WORKER MANAGEMENT — START + STOP
   5) HEURISTIC PHASE ORCHESTRATION
   6) TIMER + STATUS LED
   ============================================================ */

/* ============================================================
   1) STATE + DOM REFERENCES
   ============================================================ */
let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let workers = [];
const workerCount = 4;

const startBtn          = document.getElementById("start-btn");
const stopBtn           = document.getElementById("stop-btn");
const pinInput          = document.getElementById("pin-input");
const randomBtn         = document.getElementById("random-pin");

const attemptsLabel     = document.getElementById("attempts");
const timeLabel         = document.getElementById("time");
const statusLabel       = document.getElementById("status-label");
const currentAttemptLbl = document.getElementById("current-attempt");
const threadCountLbl    = document.getElementById("thread-count");
const logBox            = document.getElementById("log-box");
const indicator         = document.getElementById("indicator");
const indicatorLabel    = document.getElementById("indicator-label");

/* ============================================================
   2) HEURISTIC LIST BUILDER
   Priority: COMMON → AAAA → PATTERNS → SEQUENCE → KEYPAD → BIRTH-YEAR → BRUTEFORCE
   Deduplicates so each PIN is only searched once across all threads.
   ============================================================ */
function buildHeuristicList() {
    const q = [];

    /* Phase 1 — Top 50 most common PINs */
    const common = [
        "1234", "1111", "0000", "1342", "1212", "2222", "4444", "1122", "1986", "2020",
        "7777", "5555", "1989", "9999", "6969", "2004", "1010", "4321", "6666", "1984",
        "1987", "1985", "8888", "2000", "1980", "1988", "1982", "2580", "1313", "1990",
        "1991", "1983", "1978", "1979", "1995", "1994", "1977", "1981", "3333", "1992",
        "1975", "2005", "1993", "1976", "1996", "2002", "1973", "2468", "1998", "1974"
    ];
    common.forEach(pin => q.push({ type: "COMMON", pin }));

    /* Phase 2 — AAAA (all same digit) */
    for (let d = 0; d <= 9; d++) {
        q.push({ type: "AAAA", pin: `${d}${d}${d}${d}` });
    }

    /* Phase 3 — ABAB / AABB / ABBA repetition patterns */
    for (let a = 0; a <= 9; a++) {
        for (let b = 0; b <= 9; b++) {
            if (a === b) continue;
            q.push({ type: "PATTERNS", pin: `${a}${a}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${a}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${a}${b}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${b}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${b}${a}` });
        }
    }

    /* Phase 4 — Sequential up/down */
    for (let i = 0; i < 7; i++) {
        q.push({ type: "SEQUENCE-UP",   pin: `${i}${i+1}${i+2}${i+3}` });
    }
    for (let i = 9; i > 2; i--) {
        q.push({ type: "SEQUENCE-DOWN", pin: `${i}${i-1}${i-2}${i-3}` });
    }

    /* Phase 5 — Keypad patterns */
    ["8520", "0258", "7530", "0357", "1590", "9510", "2580", "0852"]
        .forEach(p => q.push({ type: "KEYPAD", pin: p }));

    /* Phase 6 — Birth years 1950–2025 */
    for (let y = 1950; y <= 2025; y++) {
        q.push({ type: "BIRTH-YEAR", pin: y.toString() });
    }

    /* Phase 7 — Full brute force fallback */
    for (let i = 0; i <= 9999; i++) {
        q.push({ type: "BRUTEFORCE", pin: i.toString().padStart(4, "0") });
    }

    /* Deduplicate */
    const seen = new Set();
    return q.filter(item => {
        if (seen.has(item.pin)) return false;
        seen.add(item.pin);
        return true;
    });
}

/* ============================================================
   3) LOG HELPER + RANDOM PIN
   ============================================================ */
function log(text) {
    const el = document.createElement("div");
    el.className = "log-line";
    el.textContent = text;
    logBox.appendChild(el);
    logBox.scrollTop = logBox.scrollHeight;
}

function randomPIN() {
    pinInput.value = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
}

randomBtn.addEventListener("click", randomPIN);

/* ============================================================
   4) WORKER MANAGEMENT — START + STOP
   ============================================================ */
function stopAllWorkers() {
    running = false;
    workers.forEach(w => w.terminate());
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

/* ============================================================
   5) HEURISTIC PHASE ORCHESTRATION
   Splits the list into equal chunks, spawns one Worker per chunk.
   Workers report "attempt" (periodic), "found", or "done" messages.
   ============================================================ */
function startHeuristicPhase(chunks) {
    workers = [];
    threadCountLbl.textContent = chunks.length;

    let finished = 0;

    for (let i = 0; i < chunks.length; i++) {
        const worker = new Worker("worker.js");

        worker.postMessage({
            mode: "heuristic",
            id: i + 1,
            correctPIN,
            list: chunks[i],
            reportEvery: 30
        });

        worker.onmessage = (msg) => {
            const d = msg.data;

            if (d.type === "attempt") {
                attempts++;
                attemptsLabel.textContent = attempts;
                currentAttemptLbl.textContent = `${d.pin} (${d.category})`;

                const el = document.createElement("div");
                el.className = "log-line thread-" + d.id;
                el.textContent = `[Thread ${d.id}] Testing ${d.pin} (${d.category})`;
                logBox.appendChild(el);
                logBox.scrollTop = logBox.scrollHeight;
            }

            if (d.type === "found") {
                running = false;
                currentAttemptLbl.textContent = `${d.pin} (${d.category})`;
                statusLabel.textContent = `PIN Found by Thread ${d.id}!`;

                const el = document.createElement("div");
                el.className = "log-line thread-" + d.id;
                el.textContent = `[Thread ${d.id}] MATCH FOUND: ${d.pin}`;
                logBox.appendChild(el);
                logBox.scrollTop = logBox.scrollHeight;

                indicator.classList.remove("active");
                indicatorLabel.textContent = "Done";
                stopAllWorkers();
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }

            if (d.type === "done") {
                finished++;
                /* All heuristic threads exhausted — this shouldn't happen since the
                   list includes a full brute force fallback, but handle gracefully */
                if (finished === chunks.length && running) {
                    statusLabel.textContent = "Exhausted all threads";
                    stopAllWorkers();
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                }
            }
        };

        workers.push(worker);
    }
}

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
    statusLabel.textContent = "Heuristic phase...";
    indicator.classList.add("active");
    indicatorLabel.textContent = "Running";
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startTime = performance.now();

    const heuristics = buildHeuristicList();
    const chunkSize = Math.ceil(heuristics.length / workerCount);
    const chunks = [];
    for (let i = 0; i < workerCount; i++) {
        chunks.push(heuristics.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    startHeuristicPhase(chunks);
    requestAnimationFrame(updateTime);
});

/* ============================================================
   6) TIMER + STATUS LED
   ============================================================ */
function updateTime() {
    if (!running) return;
    timeLabel.textContent = ((performance.now() - startTime) / 1000).toFixed(3) + "s";
    requestAnimationFrame(updateTime);
}
