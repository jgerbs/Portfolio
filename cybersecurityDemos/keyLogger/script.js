/* ============================================================
   File:    keyLogger/script.js
   Purpose: Drives the educational keylogger demo — capturing and
            displaying keystrokes typed inside the consent-gated
            textarea, entirely within the browser.

   Responsibilities:
   - Guards all logging behind an explicit user-consent button
   - Attaches and detaches a keydown listener on the demo textarea
   - Appends structured log entries (time, key, code, event type)
   - Masks keys from password-type inputs to illustrate safe handling
   - Toggles the LED recording indicator in the nav bar
   - Allows the user to clear the log or download it as a .txt file
   - Cleans up the listener on page unload

   Sections:
   1) DOM REFERENCES + STATE
   2) INDICATOR TOGGLE
   3) LOG ENTRY RENDERING
   4) START / STOP DEMO
   5) EVENT LISTENERS + INITIALIZATION

   Cleanup notes:
   - Removed unused `const status` reference (element does not exist
     in the HTML; the variable was never read).
   ============================================================ */

(function () {

    /* ============================================================
       1) DOM REFERENCES + STATE
       ============================================================ */

    const startBtn       = document.getElementById('start-btn');
    const stopBtn        = document.getElementById('stop-btn');
    const demoInput      = document.getElementById('demo-input');
    const liveLog        = document.getElementById('live-log');
    const clearBtn       = document.getElementById('clear-log');
    const downloadBtn    = document.getElementById('download-sample');
    const indicator      = document.getElementById('indicator');
    const indicatorLabel = document.getElementById('indicator-label');

    let active   = false;   // whether logging is currently running
    let listener = null;    // reference to the active keydown handler
    let log      = [];      // array of captured keystroke entry objects


    /* ============================================================
       2) INDICATOR TOGGLE
       ============================================================ */

    /* Updates the LED light and its text label based on logging state. */
    function setIndicator(on) {
        if (on) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-label', 'Logging is on');
            indicatorLabel.textContent = 'Logging: on';
        } else {
            indicator.classList.remove('active');
            indicator.setAttribute('aria-label', 'Logging is off');
            indicatorLabel.textContent = 'Logging: off';
        }
    }


    /* ============================================================
       3) LOG ENTRY RENDERING
       ============================================================ */

    function formatTime(d) {
        return d.toLocaleTimeString();
    }

    /* Pushes an entry to the in-memory log and appends a row to the UI. */
    function addLogEntry(obj) {
        log.push(obj);

        const el = document.createElement('div');
        el.className = 'log-line';

        const key = obj.masked ? '[MASKED]' : obj.key;
        el.textContent = `${obj.time} — key: ${key} — code: ${obj.code} — type: ${obj.type}`;

        liveLog.appendChild(el);
        liveLog.scrollTop = liveLog.scrollHeight;
    }


    /* ============================================================
       4) START / STOP DEMO
       ============================================================ */

    function startDemo() {
        if (active) return;
        active = true;
        startBtn.disabled = true;
        stopBtn.disabled  = false;
        setIndicator(true);

        /* Reset log and UI before attaching the listener. */
        log = [];
        liveLog.innerHTML = '';

        listener = function (e) {
            const isPassword = e.target && e.target.type === 'password';
            const entry = {
                time:   formatTime(new Date()),
                key:    isPassword ? null : e.key,
                code:   e.code,
                type:   e.type,
                masked: isPassword
            };
            addLogEntry(entry);
        };

        demoInput.addEventListener('keydown', listener);
        demoInput.focus();
    }

    function stopDemo() {
        if (!active) return;
        active = false;
        startBtn.disabled = false;
        stopBtn.disabled  = true;
        setIndicator(false);

        if (listener) demoInput.removeEventListener('keydown', listener);
        listener = null;
    }


    /* ============================================================
       5) EVENT LISTENERS + INITIALIZATION
       ============================================================ */

    startBtn.addEventListener('click', startDemo);
    stopBtn.addEventListener('click', stopDemo);

    clearBtn.addEventListener('click', () => {
        log = [];
        liveLog.innerHTML = '';
    });

    downloadBtn.addEventListener('click', () => {
        if (log.length === 0) {
            alert('No log to download. Start the demo and type something to generate a sample.');
            return;
        }

        const lines = log.map(l =>
            `${l.time}\t${l.masked ? '[MASKED]' : l.key}\t${l.code}\t${l.type}`
        );
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');

        a.href = url;
        a.download = 'sample-demo-log.txt';
        document.body.appendChild(a);
        a.click();

        /* Clean up the object URL after the download has started. */
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 3000);
    });

    /* Remove the keydown listener if the user navigates away mid-demo. */
    window.addEventListener('beforeunload', stopDemo);

    /* Initialize indicator to off state on page load. */
    setIndicator(false);

})();
