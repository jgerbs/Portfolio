# Cybersecurity Algorithm Demonstrations

A browser-based educational lab that demonstrates core cybersecurity attack concepts through interactive, fully client-side simulations. Every demo runs entirely in the browser — no server, no data transmitted, no external dependencies.

## Overview

This project is a collection of seven standalone demos covering keystroke logging, PIN-cracking strategies, and a full ransomware attack simulation with incident reporting. Each demo is designed to make abstract attack mechanics visible and understandable, and pairs the simulation with defensive guidance and real-world context.

The goal is educational: to show how these attack categories work at an algorithmic level, why certain approaches are more effective than others, and what defenses apply in each case. This is not a toolkit — none of the demos interact with real systems, credentials, or networks.

## Purpose

- Demonstrate attack concepts in a safe, controlled, and transparent environment
- Visualize algorithm behavior (sequential search vs. priority queues vs. parallel threads)
- Practice reading simulated SIEM logs and applying incident response frameworks
- Showcase the defensive recommendations that follow from understanding each attack

## Demos

### Keystroke Logger
Simulates how software keyloggers capture input. The demo is consent-gated — logging only begins after the user clicks **Start Demo (I consent)** and only captures keystrokes typed inside a designated textarea on the page. Keys from password-type inputs are masked. Captured entries display timestamp, key value, key code, and event type. The user can download the session log as a `.txt` file. No data leaves the browser.

### Brute Force PIN Attack
Iterates every four-digit PIN from `0000` to `9999` sequentially. Shows attempt count and elapsed time, illustrating why exhaustive search is the slowest and most predictable approach and why it serves as a baseline for comparing smarter methods.

### Dictionary Attack
Tests a curated list of the 50 most common four-digit PINs sourced from published breach statistics (CNBC). Demonstrates how frequency-based priority dramatically reduces the expected number of attempts for weak PINs compared to sequential brute force.

### Heuristic Attack
Builds a de-duplicated priority queue that works through candidate categories in order before falling back to full brute force:

1. Top 50 most common PINs (breach data)
2. All-same-digit patterns (`AAAA`)
3. Repetition patterns (`AAAB`, `AABB`, `ABBA`, `ABAB`, etc.)
4. Sequential ascending and descending runs (`1234`, `9876`)
5. Numeric keypad and phone-pad shapes (`8520`, `2580`, etc.)
6. Birth years 1950–2025
7. Full brute force fallback (0000–9999)

Each attempt is labelled by category in the log, making the prioritization logic visible.

### Parallel Heuristic Attack
Applies the same heuristic list as above, but splits it into four equal chunks and runs each chunk on a separate [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), processing them concurrently. All workers are terminated the moment any one finds the correct PIN. The UI shows which thread found the match and the total attempt count across all threads.

### Ransomware Attack Simulation
An interactive three-pane simulation of a ransomware infection:

- **Left pane** — A simulated browser showing a fake search engine ("Foogle") and a deceptive software download page that delivers a malicious executable (`UnapprovedApp.exe`)
- **Center pane** — A simulated file system (`Documents`, `Pictures`, `Downloads`) that updates in real time as files are downloaded, then encrypted one by one with a `.jackcrypt` extension
- **Right pane** — A Splunk-style SOC log viewer that receives Sysmon-formatted events as the attack progresses, with severity tagging (`INFO`, `WARNING`, `CRITICAL`) and searchable, expandable JSON event details

After encryption completes, a ransom modal displays a preview of the obfuscated file contents. A simulated payment button reverses the encryption and restores all files.

### Ransomware Incident Breakdown
A structured post-mortem report covering the same simulated attack:

- Executive summary
- Attack overview (initial access → execution → discovery → impact → recovery inhibition)
- Reconstructed timeline table from Sysmon log timestamps
- Evidence carousel — 11 annotated screenshots from the simulation
- Indicators of Compromise (IOC) table: file hashes, process paths, suspicious commands, encrypted file extension
- MITRE ATT&CK mapping (T1189, T1204.002, T1083, T1486, T1490)
- Embedded Figma attack flow diagram
- Root cause analysis
- Remediation recommendations (application allow-listing, EDR, web filtering, immutable backups, Sysmon + SIEM, user training)

The report structure follows NIST 800-61, CompTIA Security+, and Google Cybersecurity Certificate frameworks.

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (shared `style.css` + per-demo stylesheets) |
| Logic | Vanilla JavaScript (ES6+) |
| Concurrency | [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) |
| Diagrams | Figma (embedded via iframe) |
| Build tools | None — no bundler, no framework, no dependencies |

## Project Structure

```
cybersecurityDemos/
├── index.html                      — Demo hub / landing page
├── style.css                       — Shared styles across all demos
│
├── keyLogger/
│   ├── index.html
│   └── script.js
│
├── passwordBreaker/
│   ├── bruteForce/
│   │   ├── index.html
│   │   └── script.js
│   ├── dictionary/
│   │   ├── index.html
│   │   └── script.js
│   ├── heuristic/
│   │   ├── index.html
│   │   └── script.js
│   └── parallel/
│       ├── index.html
│       ├── script.js
│       └── worker.js               — Web Worker for parallel search
│
└── ransomwareDemo/
    ├── demo/
    │   ├── index.html
    │   ├── demo.css
    │   └── script.js
    └── breakdown/
        ├── index.html
        ├── report.css
        └── script.js               — Evidence carousel logic
```

## Running Locally

Most demos open directly in a browser:

```
open cybersecurityDemos/index.html
```

Or double-click `index.html` in your file manager.

**The parallel heuristic demo requires a local HTTP server.** Web Workers cannot be loaded from `file://` URLs in most browsers due to security restrictions. Serve the project with any static file server:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then navigate to `http://localhost:8080/cybersecurityDemos/`.

All other demos (keylogger, brute force, dictionary, heuristic, ransomware simulation, incident report) work from the filesystem without a server.

## Usage

Open `index.html` to reach the demo hub. Each card links to an individual demo. Navigate back to the hub at any time using the home button in the top-left of each demo page.

Each demo is self-contained and includes:
- An explanation of the concept being demonstrated
- A live interactive simulation
- Educational context on why the technique is effective or dangerous
- Defensive recommendations

No login, no setup, and no configuration is required.

## Ethical Use

All demos in this project are confined to the browser sandbox. Specifically:

- **No data is transmitted or stored.** All processing happens in memory in the current browser tab and is discarded when the page is closed.
- **The keylogger only captures input inside the designated demo textarea**, and only after the user explicitly clicks a consent button.
- **The ransomware simulation operates on a fictitious in-memory file system.** No real files are read, written, encrypted, or deleted at any point.
- **The password attack demos operate on a user-supplied test PIN entered on the demo page.** They do not interface with any real authentication system.
- **None of these demos provide mechanisms to target external systems, real credentials, or live networks.**

This project is intended for learning, portfolio demonstration, and building defensive intuition. It should not be adapted or repurposed to interact with real systems outside of an authorized testing context.

## Known Limitations

- The parallel heuristic demo requires a local HTTP server due to browser restrictions on loading Web Workers from `file://` URLs.
- PIN attack demos are scoped to four-digit numeric PINs only. They are not representative of attacks against longer passwords, passphrases, or hashed credential stores.
- The ransomware simulation's "encryption" uses `btoa` with a reversal — it is visually illustrative, not cryptographically representative of real ransomware.
- The Splunk-style log viewer simulates Sysmon output format. It is not connected to a real SIEM and does not ingest actual system events.
- The evidence carousel in the incident report relies on static screenshot images included with the project.

## Future Improvements

- Add a hash-cracking demo (MD5/SHA-1 collision visualization)
- Expand the password attack demos to alphanumeric inputs
- Add a phishing simulation module with form-based credential capture explanation
- Add a network packet inspection demo (simulated, browser-side)
- Extend the ransomware incident report with a simulated remediation walkthrough

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
