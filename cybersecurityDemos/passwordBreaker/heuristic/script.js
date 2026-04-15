/* ============================================================
   heuristic/script.js
   Heuristic PIN attack — smart queue of likely PINs with brute force fallback.

   Responsibilities:
   - Builds a priority queue: common PINs → repetition patterns → sequences →
     keypad shapes → birth years → full brute force fallback (deduped)
   - Consumes the queue one item per interval tick, logging type and value
   - Updates the attempt counter, timer, current attempt, and status label
   - Handles start/stop button state and random PIN generation

   Sections:
   1) STATE + DOM REFERENCES
   2) LOG HELPER + RANDOM PIN
   3) HEURISTIC QUEUE BUILDER
   4) MAIN LOOP
   5) START / STOP HANDLERS
   ============================================================ */

/* ============================================================
   1) STATE + DOM REFERENCES
   ============================================================ */
let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let queue = [];
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
   2) LOG HELPER + RANDOM PIN
   ============================================================ */
function log(type, pin) {
    const el = document.createElement("div");
    el.className = "log-line";
    el.textContent = `[${type}] Testing ${pin}`;
    logBox.appendChild(el);
    logBox.scrollTop = logBox.scrollHeight;
}

function randomPIN() {
    pinInput.value = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
}

randomBtn.addEventListener("click", randomPIN);

/* ============================================================
   3) HEURISTIC QUEUE BUILDER
   Priority: COMMON → AAAA → PATTERNS → SEQUENCE → KEYPAD → BIRTH-YEAR → FALLBACK
   Duplicate PINs are removed so each candidate is only checked once.
   ============================================================ */
function buildQueue() {
    const q = [];

    /* Phase 1 — Top 50 most common PINs (real breach data) */
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

    /* Phase 3 — Repetition patterns: AAAB/AABA/ABAA/BAAA + AABB/ABBA/ABAB */
    for (let a = 0; a <= 9; a++) {
        for (let b = 0; b <= 9; b++) {
            if (a === b) continue;
            q.push({ type: "PATTERNS", pin: `${a}${a}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${a}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${b}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${b}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${b}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${b}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${a}${b}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${b}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${b}${a}` });
        }
    }

    /* Phase 4 — Sequential ascending and descending */
    for (let i = 0; i < 7; i++) {
        q.push({ type: "SEQUENCE-UP",   pin: `${i}${i+1}${i+2}${i+3}` });
    }
    for (let i = 9; i > 2; i--) {
        q.push({ type: "SEQUENCE-DOWN", pin: `${i}${i-1}${i-2}${i-3}` });
    }

    /* Phase 5 — Numeric keypad / phone keypad shapes */
    const keypad = ["8520", "0258", "7530", "0357", "1590", "9510", "2580", "0852"];
    keypad.forEach(p => q.push({ type: "KEYPAD", pin: p }));

    /* Phase 6 — Birth years 1950–2025 */
    for (let y = 1950; y <= 2025; y++) {
        q.push({ type: "BIRTH-YEAR", pin: y.toString() });
    }

    /* Phase 7 — Full brute force fallback 0000–9999 */
    for (let i = 0; i <= 9999; i++) {
        q.push({ type: "FALLBACK", pin: i.toString().padStart(4, "0") });
    }

    /* Deduplicate — keep first occurrence of each PIN */
    const seen = new Set();
    return q.filter(item => {
        if (seen.has(item.pin)) return false;
        seen.add(item.pin);
        return true;
    });
}

/* ============================================================
   4) MAIN LOOP
   ============================================================ */
function loop() {
    if (!running) return;

    timeLabel.textContent = ((performance.now() - startTime) / 1000).toFixed(3) + "s";

    if (queue.length === 0) {
        statusLabel.textContent = "Exhausted queue";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        clearInterval(interval);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        return;
    }

    const item = queue.shift();
    document.getElementById("current-attempt").textContent = `${item.pin} (${item.type})`;
    log(item.type, item.pin);

    attempts++;
    attemptsLabel.textContent = attempts;

    if (item.pin === correctPIN) {
        statusLabel.textContent = "PIN Found!";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        clearInterval(interval);
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

/* ============================================================
   5) START / STOP HANDLERS
   ============================================================ */
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
    queue = buildQueue();
    statusLabel.textContent = "Running...";
    indicator.classList.add("active");
    indicatorLabel.textContent = "Running";
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startTime = performance.now();

    interval = setInterval(loop, 10);
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
