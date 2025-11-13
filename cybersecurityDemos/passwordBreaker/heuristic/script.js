let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let queue = [];
let interval = null;

const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const pinInput = document.getElementById("pin-input");
const randomBtn = document.getElementById("random-pin");

const attemptsLabel = document.getElementById("attempts");
const timeLabel = document.getElementById("time");
const statusLabel = document.getElementById("status-label");
const logBox = document.getElementById("log-box");

const indicator = document.getElementById("indicator");
const indicatorLabel = document.getElementById("indicator-label");

// LOGGING
function log(type, pin) {
    const el = document.createElement("div");
    el.className = "log-line";
    el.textContent = `[${type}] Testing ${pin}`;
    logBox.appendChild(el);
    logBox.scrollTop = logBox.scrollHeight;
}

// RANDOM PIN BUTTON
function randomPIN() {
    const pin = Math.floor(Math.random() * 10000)
        .toString().padStart(4, "0");
    pinInput.value = pin;
}
randomBtn.addEventListener("click", randomPIN);

// -------------------------------------------------------------
//  BUILD ADVANCED HEURISTIC QUEUE
// -------------------------------------------------------------
function buildQueue() {
    const q = [];

    // 1. Top COMMON PINs (highest probability)
    const common = [
        "1234", "1111", "0000", "1342", "1212", "2222", "4444", "1122", "1986", "2020",
        "7777", "5555", "1989", "9999", "6969", "2004", "1010", "4321", "6666", "1984",
        "1987", "1985", "8888", "2000", "1980", "1988", "1982", "2580", "1313", "1990",
        "1991", "1983", "1978", "1979", "1995", "1994", "1977", "1981", "3333", "1992",
        "1975", "2005", "1993", "1976", "1996", "2002", "1973", "2468", "1998", "1974"
    ];
    common.forEach(pin => q.push({ type: "COMMON", pin }));

    // 2. Repetition patterns (AAAA, ABAB, ABBA, etc.)
    // AAAA
    for (let d = 0; d <= 9; d++) {
        q.push({ type: "AAAA", pin: `${d}${d}${d}${d}` });
    }

    // AAAB, AABA, ABAA, BAAA + reversed
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
        }
    }

    // AABB, ABBA, BAAB, BBAA, ABAB, BABA
    for (let a = 0; a <= 9; a++) {
        for (let b = 0; b <= 9; b++) {
            if (a === b) continue;
            q.push({ type: "PATTERNS", pin: `${a}${a}${b}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${b}${a}${a}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${b}${a}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${a}${b}${a}${b}` });
            q.push({ type: "PATTERNS", pin: `${b}${a}${b}${a}` });
        }
    }

    // 3. Sequential (0123, 1234, ..., 9876)
    const seqUp = [];
    const seqDown = [];

    // UP
    for (let i = 0; i < 7; i++) {
        const a = i, b = i + 1, c = i + 2, d = i + 3;
        seqUp.push(`${a}${b}${c}${d}`);
    }
    // DOWN
    for (let i = 9; i > 2; i--) {
        const a = i, b = i - 1, c = i - 2, d = i - 3;
        seqDown.push(`${a}${b}${c}${d}`);
    }

    seqUp.forEach(p => q.push({ type: "SEQUENCE-UP", pin: p }));
    seqDown.forEach(p => q.push({ type: "SEQUENCE-DOWN", pin: p }));

    // 4. Keyboard patterns (numeric keypad + QWERTY adjacent)
    const keypad = [
        "8520", // keyboard vertical
        "0258", // keyboard vertical
        "7530", // keyboard diagonal
        "0357", // keyboard diagonal reverse
        "1590", // phone keypad diagonal
        "9510", // phone keypad diagonal reverse
        "2580", // phone keypad vertical
        "0852", // phone keypad vertical reverse
    ];
    keypad.forEach(p => q.push({ type: "KEYPAD", pin: p }));

    // 5. Birth years 1950–2025
    for (let y = 1950; y <= 2025; y++) {
        q.push({ type: "BIRTH-YEAR", pin: y.toString() });
    }

    // 6. Final brute force fallback
    for (let i = 0; i <= 9999; i++) {
        q.push({ type: "FALLBACK", pin: i.toString().padStart(4, "0") });
    }

    // REMOVE DUPLICATES
    const seen = new Set();
    const finalQueue = [];

    for (const item of q) {
        if (!seen.has(item.pin)) {
            seen.add(item.pin);
            finalQueue.push(item);
        }
    }

    return finalQueue;
}

// -------------------------------------------------------------
// MAIN LOOP
// -------------------------------------------------------------
function loop() {
    if (!running) return;

    const elapsed = (performance.now() - startTime) / 1000;
    timeLabel.textContent = elapsed.toFixed(3) + "s";

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
    const attempt = item.pin;

    document.getElementById("current-attempt").textContent = `${attempt} (${item.type})`;

    log(item.type, attempt);

    attempts++;
    attemptsLabel.textContent = attempts;

    if (attempt === correctPIN) {
        statusLabel.textContent = "PIN Found!";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        clearInterval(interval);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        return;
    }
}

// -------------------------------------------------------------
// START / STOP HANDLERS
// -------------------------------------------------------------
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
