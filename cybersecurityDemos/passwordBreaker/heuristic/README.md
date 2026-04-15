# Heuristic PIN Attack Demo

A browser-based simulation of a human-behavior-informed PIN search strategy that combines multiple pattern categories into a single priority-ordered queue with a brute force fallback.

## Overview

The heuristic attack goes beyond a fixed dictionary by generating candidates from categories that reflect how people actually choose PINs: common values, repeated digits, structural patterns, sequential runs, keypad shapes, and birth years. Candidates are deduplicated so each PIN is checked at most once, and the queue always ends with a full brute force sweep to guarantee coverage. The log labels every attempt with its source category, making the prioritization logic fully visible as the search runs.

## How It Works

On start, the demo builds a priority queue in seven phases and deduplicates it before the first attempt is made:

| Phase | Category | Examples |
|---|---|---|
| 1 | Top 50 common PINs (breach data) | `1234`, `0000`, `1111` |
| 2 | All-same-digit | `0000`–`9999` (each digit repeated) |
| 3 | Repetition patterns | `AAAB`, `AABB`, `ABBA`, `ABAB`, etc. |
| 4 | Sequential ascending / descending | `1234`, `5678`, `9876`, `3210` |
| 5 | Keypad / phone-pad shapes | `8520`, `2580`, `7530`, `0357` |
| 6 | Birth years 1950–2025 | `1987`, `2001`, `1995` |
| 7 | Full brute force fallback | `0000`–`9999` (all remaining) |

A `setInterval` loop consumes the queue one item per tick. Each log entry shows `[CATEGORY] Testing XXXX`, so the viewer can see exactly which phase is active at any point. The search stops as soon as the target PIN is found.

## Educational Purpose

Real password-cracking tools don't just guess randomly or sequentially — they exploit knowledge of human psychology and common behavior patterns. This demo teaches:

- Why pattern-based guessing is far more efficient than uniform random or sequential search for human-chosen credentials
- How structural patterns in PINs (repetition, sequences, keypad paths, year-based choices) create predictable clusters that attackers exploit
- Why security recommendations specifically warn against exactly these pattern types
- How layering multiple heuristic categories into a single ordered queue maximizes early-hit probability while still guaranteeing full coverage

## Tech Stack

- HTML5
- CSS3 (shared `../../style.css`)
- Vanilla JavaScript — `setInterval`, `performance.now()`, `Set` (for deduplication)

No frameworks, no build tools, no external requests.

## Running Locally

```
open passwordBreaker/heuristic/index.html
```

No server or installation required.

## Usage

1. Enter a four-digit PIN or click **Random** to generate one
2. Click **Start** — the queue begins consuming phase by phase
3. Read the log labels to see which category each attempt belongs to
4. Try PINs that match known patterns (e.g., a birth year like `1995`, or a keypad path like `2580`) to see them found early
5. Try a truly arbitrary PIN (e.g., `4713`) to watch the search work through all phases before reaching the brute force fallback

Compare the attempt count against the brute force and dictionary demos for the same PIN to see the efficiency gains and losses in context.

## Ethical Use Notice

This demo runs entirely within the browser against a PIN value you enter yourself. The heuristic queue is generated from general knowledge about PIN patterns and publicly available breach statistics — no real credentials, systems, or authentication endpoints are involved.

The category labels in the log are intended to make the algorithm's decision-making transparent for learning purposes, not to provide a reusable attack tool.

## Limitations

- The seven-phase queue is generated fresh on each run — there is no persistence or adaptive learning between sessions
- Birth year coverage runs from 1950 to 2025 only
- Scoped to four-digit numeric PINs; the same heuristic logic applied to longer or alphanumeric credentials would require a substantially different implementation
- The 10 ms interval is a UI pacing choice — the full queue including fallback contains several thousand entries, so some PINs in the fallback phase will take time to reach

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
