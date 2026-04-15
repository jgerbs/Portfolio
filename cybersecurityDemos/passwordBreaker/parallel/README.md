# Parallel Heuristic PIN Attack Demo

A browser-based demonstration of concurrent search using the Web Workers API — the same heuristic strategy as the single-threaded demo, split across four parallel threads.

## Overview

This demo applies the same seven-phase heuristic queue from the heuristic demo, but divides it into four equal chunks and runs each chunk on a separate Web Worker simultaneously. All four workers search their portion of the list at the same time. The moment any worker finds the target PIN, it broadcasts the result and all threads are immediately terminated. The UI shows which thread made the match, the total combined attempt count across all threads, and a color-coded log that distinguishes entries by thread ID.

The goal is to show, concretely, how parallelism changes search performance — not just in theory, but visibly in the browser.

## How It Works

On start, the full heuristic list is built in the main thread (same seven phases, same deduplication as the single-threaded version), then sliced into four equal chunks. One Web Worker is spawned per chunk via `new Worker("worker.js")`. Each worker receives its assigned slice and the target PIN via `postMessage`.

Workers iterate their slice independently and post three message types back to the main thread:

| Message type | Meaning |
|---|---|
| `attempt` | Periodic progress update (every 30 items) — updates the UI log |
| `found` | The worker's slice contained the target PIN — triggers immediate termination of all workers |
| `done` | The worker exhausted its slice without a match |

The main thread aggregates `attempt` counts from all workers into a single total. A `requestAnimationFrame` loop updates the elapsed timer smoothly without blocking the UI.

## Educational Purpose

Parallelism is a fundamental technique for accelerating computationally intensive tasks. This demo teaches:

- How the Web Workers API enables true background thread execution in the browser, separate from the main UI thread
- Why dividing a search space across multiple workers reduces wall-clock time even when total work stays the same
- How threads communicate via message passing rather than shared memory in the browser's worker model
- Why real-world cracking tools exploit multi-core hardware for exactly this reason — and why strong credentials and hardware security keys resist it

## Tech Stack

- HTML5
- CSS3 (shared `../../style.css`)
- Vanilla JavaScript (main thread) — `Worker`, `postMessage`, `requestAnimationFrame`, `performance.now()`, `Set`
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — `worker.js` runs on a separate thread

No frameworks, no build tools, no external requests.

## Running Locally

> **A local HTTP server is required.** Browsers block Web Workers loaded from `file://` URLs due to security restrictions. Opening `index.html` directly will result in a worker load error.

Serve the project with any static file server from the repository root:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx, no install needed)
npx serve .
```

Then open:

```
http://localhost:8080/cybersecurityDemos/passwordBreaker/parallel/index.html
```

## Usage

1. Enter a four-digit PIN or click **Random**
2. Click **Start** — four workers launch simultaneously
3. Watch the color-coded log: each thread's entries are styled differently
4. The thread count display confirms four active workers
5. When a match is found, the status reports which thread found it and all workers stop
6. Compare the attempt count and elapsed time against the single-threaded heuristic demo on the same PIN to observe the parallel speedup

## Ethical Use Notice

This demo runs entirely within your browser. The four workers search only the PIN value you supply in the input field — they do not communicate with any external system, server, or authentication endpoint. All computation is local and discarded when the page is closed.

The parallel architecture is demonstrated for educational purposes: to show how concurrency applies to search problems and why it matters for understanding both attack performance and the importance of strong credential policies.

## Limitations

- Requires a local HTTP server — does not work when opened directly as a `file://` URL
- The speedup from four workers depends on the browser's available CPU cores; on single-core environments the benefit is minimal
- Workers communicate via message passing with a `reportEvery: 30` throttle, so attempt counts in the UI are approximate aggregates rather than exact per-attempt tallies
- Scoped to four-digit numeric PINs only
- The number of workers is hardcoded to 4 — there is no UI control to change thread count

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
