let running = false;
let correctPIN = "0000";
let attempts = 0;
let startTime = 0;
let index = 0;
let interval = null;

// This list comes from CNBC's Tom Huddleston Jr.'s research on the most common 4-digit PINs
// "These are the 50 most common four-digit PINs leaked on the dark web—make sure none of them are yours"
const dictionary = [
    "1234", "1111", "0000", "1342", "1212", "2222", "4444", "1122", "1986", "2020",
    "7777", "5555", "1989", "9999", "6969", "2004", "1010", "4321", "6666", "1984",
    "1987", "1985", "8888", "2000", "1980", "1988", "1982", "2580", "1313", "1990",
    "1991", "1983", "1978", "1979", "1995", "1994", "1977", "1981", "3333", "1992",
    "1975", "2005", "1993", "1976", "1996", "2002", "1973", "2468", "1998", "1974"
];


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

function log(text) {
    const el = document.createElement("div");
    el.className = "log-line";
    el.textContent = text;
    logBox.appendChild(el);
    logBox.scrollTop = logBox.scrollHeight;
}

function randomPIN() {
    const pin = Math.floor(Math.random() * 10000)
        .toString().padStart(4, "0");
    pinInput.value = pin;
}

randomBtn.addEventListener("click", randomPIN);

// MAIN LOOP
function dictionaryLoop() {
    if (!running) return;

    const elapsed = (performance.now() - startTime) / 1000;
    timeLabel.textContent = elapsed.toFixed(3) + "s";

    if (index >= dictionary.length) {
        statusLabel.textContent = "Not found in dictionary";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearInterval(interval);
        return;
    }

    const attempt = dictionary[index];
    log(`Checking ${attempt}`);

    attempts++;
    attemptsLabel.textContent = attempts;

    if (attempt === correctPIN) {
        statusLabel.textContent = "PIN Found!";
        indicator.classList.remove("active");
        indicatorLabel.textContent = "Done";
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearInterval(interval);
        return;
    }

    index++;
}

startBtn.addEventListener("click", () => {

    correctPIN = pinInput.value.trim();
    if (!/^\d{4}$/.test(correctPIN)) {
        alert("Enter a valid 4-digit PIN");
        return;
    }

    running = true;
    attempts = 0;
    index = 0;

    logBox.innerHTML = "";
    attemptsLabel.textContent = "0";
    timeLabel.textContent = "0.000s";

    statusLabel.textContent = "Running...";
    indicator.classList.add("active");
    indicatorLabel.textContent = "Running";

    startBtn.disabled = true;
    stopBtn.disabled = false;

    startTime = performance.now();
    interval = setInterval(dictionaryLoop, 50);
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
