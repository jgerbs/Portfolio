# Educational Keylogger Demo

A browser-based demonstration of how keystroke logging works, built to make the concept visible and understandable in a fully controlled, consent-gated environment.

## Overview

This demo simulates the behavior of a software keylogger — a program that captures keyboard input — using only browser-native JavaScript. It is not a real keylogger and cannot interact with anything outside the page. Its purpose is to show, concretely, what a keylogger records and why that information is sensitive, while also walking through the defenses that reduce exposure to the real thing.

## How It Works

When the user clicks **Start Demo (I consent)**, a `keydown` event listener is attached to a designated textarea on the page. Each keystroke is captured and displayed as a structured log entry showing the timestamp, key value, key code, and event type. Keys typed into password-type inputs are masked and recorded as `[MASKED]` rather than their actual value.

Logging runs until the user clicks **Stop Demo**, at which point the listener is detached. A **Clear Log** button wipes the in-memory log and the display. A **Download Sample** button exports the current session log as a `.txt` file using the `Blob` API. The listener is also removed automatically if the user navigates away mid-session.

A LED indicator in the nav bar changes state and label (`Logging: on` / `Logging: off`) to make the active state unambiguous at a glance.

## Educational Purpose

Keyloggers are one of the most common forms of credential-harvesting malware. This demo teaches:

- What data a keylogger actually collects (key names, codes, timing)
- Why password fields alone do not protect against keylogging at the OS or browser level
- How legitimate monitoring tools use the same underlying browser APIs that malicious software can exploit
- What defenses apply: keeping software updated, avoiding untrusted browser extensions, using MFA, and monitoring for unusual background processes

## Tech Stack

- HTML5
- CSS3 (shared `../style.css`)
- Vanilla JavaScript (ES6+) — `addEventListener`, `Blob`, `URL.createObjectURL`

No frameworks, no build tools, no external requests.

## Running Locally

Open the file directly in a browser:

```
open keyLogger/index.html
```

Or double-click `index.html` from your file manager. No server or installation is required.

## Usage

1. Open the demo page
2. Read the explanation panels on both sides
3. Click **Start Demo (I consent)** to activate logging
4. Type anything into the textarea
5. Observe the live log entries in the right panel — each shows time, key, code, and event type
6. Click **Stop Demo** to end the session
7. Optionally download the log as a `.txt` file to inspect the output format
8. Click **Clear Log** to reset

## Ethical Use Notice

This demo captures keystrokes typed **only inside the designated textarea on this page**, and **only after explicit user consent**. It does not read input from any other element, tab, application, or system. No data is stored, transmitted, or persisted in any way — all captured entries exist only in the page's JavaScript memory and are discarded when the tab is closed.

This demo exists to build awareness of keylogging as an attack category and to support defensive education. It should not be adapted to capture input outside of a clearly consented, sandboxed context.

## Limitations

- Captures keystrokes only within the demo textarea — it does not demonstrate system-level or browser-extension-level keylogging, which operate outside the web sandbox
- Password masking is illustrative: real password fields would show `[MASKED]` entries, but the demo textarea is a plain `textarea`, not a `type="password"` input
- The downloaded log is a plain `.txt` file — not representative of the encrypted or network-exfiltrated formats used by real keyloggers
- All state is lost on page refresh or tab close

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
