# Brute Force PIN Demo

A browser-based simulation of a naive brute force attack against a four-digit PIN, designed to make the mechanics and limitations of exhaustive search visible in real time.

## Overview

This demo iterates every possible four-digit PIN from `0000` to `9999` in sequential order, logging each attempt and tracking elapsed time until the target PIN is found. It establishes the baseline case for PIN-cracking: the simplest, slowest, and most predictable approach. Understanding why brute force is inefficient motivates the smarter strategies demonstrated in the dictionary, heuristic, and parallel demos.

## How It Works

The user enters a four-digit PIN (or generates one randomly), then clicks **Start**. A `setInterval` loop fires once every 10 milliseconds, incrementing an attempt counter from 0000 upward. Each tick logs the current attempt, updates the attempt count, and measures elapsed time. When the current attempt matches the target PIN, the loop stops and reports success. The user can also stop the search manually at any time.

The UI stays responsive throughout because the loop runs in timed intervals rather than a synchronous block — the browser is free to render updates between ticks.

## Educational Purpose

Brute force is the most fundamental attack strategy: given no knowledge of the target, try everything. This demo teaches:

- What "exhaustive search" means in practice and what its time cost looks like
- Why worst-case performance (PIN near `9999`) is dramatically worse than best-case (PIN near `0000`)
- Why rate limiting, account lockout, and login throttling are effective defenses against brute force
- Why a four-digit PIN offers only 10,000 possibilities — a search space that is trivially small without any throttling in place

## Tech Stack

- HTML5
- CSS3 (shared `../../style.css`)
- Vanilla JavaScript — `setInterval`, `performance.now()`

No frameworks, no build tools, no external requests.

## Running Locally

Open directly in a browser:

```
open passwordBreaker/bruteForce/index.html
```

No installation or server required.

## Usage

1. Enter a four-digit PIN in the input field, or click **Random** to generate one
2. Click **Start** to begin the sequential search
3. Watch the attempt log scroll and the attempt counter increment
4. Note the elapsed time — compare a PIN like `0001` against one like `9998` to see the difference
5. Click **Stop** at any time to halt the search

## Ethical Use Notice

This demo operates entirely within the browser and against a PIN value you supply yourself. It does not communicate with any external system, authentication endpoint, or real credential store. The simulated "attack" has no target other than the value you type into the input field on this page.

The purpose is to demonstrate algorithmic behavior, not to provide a tool for real-world credential testing.

## Limitations

- Scoped to four-digit numeric PINs (0–9) only — not representative of attacks against longer passwords or alphanumeric credentials
- The 10 ms interval is a deliberate UI pacing choice, not a reflection of real-world brute force speeds, which would be orders of magnitude faster against an unprotected target
- No rate limiting or lockout simulation is included in this demo — those concepts are covered in defensive guidance rather than simulated here
- All state resets on page refresh

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
