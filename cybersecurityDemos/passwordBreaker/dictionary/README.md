# Dictionary Attack Demo

A browser-based simulation that demonstrates how attackers use real-world breach data to prioritize guesses, reaching weak PINs far faster than sequential brute force.

## Overview

Rather than checking every possible value in order, a dictionary attack works from a curated list of the most likely candidates first. This demo checks the 50 most commonly used four-digit PINs — sourced from published analysis of leaked credential databases — and stops as soon as a match is found. If the target PIN is not in the list, the demo reports that outcome without falling back to a full search.

Compared directly to the brute force demo, this approach can find a matching PIN in a fraction of the attempts, which illustrates why common passwords and PINs are disproportionately vulnerable even when rate limiting is applied.

## How It Works

On start, the demo iterates through a fixed ordered list of 50 PINs using `setInterval`. Each tick checks the current list entry against the target, logs the attempt, and advances to the next. If the target PIN appears in the list, the search terminates immediately with a match. If the list is exhausted without a match, the demo reports "Not found in dictionary" — it does not continue to brute force.

The dictionary used is sourced from CNBC reporting on PIN patterns extracted from dark web breach data. The list is ordered by real-world frequency, not alphabetically or numerically.

## Educational Purpose

Dictionary attacks exploit the fact that human-chosen credentials are not uniformly random. People gravitate toward predictable values: repeated digits, birth years, ascending sequences. This demo teaches:

- Why "common" passwords and PINs carry outsized risk even against systems with rate limiting
- How frequency-ordered lists dramatically reduce expected attempts for a large portion of real users
- Why security guidance recommends avoiding dictionary-listed values entirely
- The difference between exhaustive search and frequency-biased search as attack strategies

## Tech Stack

- HTML5
- CSS3 (shared `../../style.css`)
- Vanilla JavaScript — `setInterval`, `performance.now()`

No frameworks, no build tools, no external requests.

## Running Locally

```
open passwordBreaker/dictionary/index.html
```

No server or installation required.

## Usage

1. Enter a four-digit PIN or click **Random** to generate one
2. Click **Start** — the demo checks each dictionary entry in frequency order
3. If your PIN is in the top 50 list, it will be found quickly with a small attempt count
4. If your PIN is not in the list, the demo exhausts all 50 entries and reports "Not found in dictionary"
5. Try entering one of the well-known common PINs (e.g., `1234` or `0000`) to see an immediate match, then try a random PIN to see the dictionary fail

Comparing attempt counts between the brute force demo and this one on the same PIN illustrates the efficiency difference.

## Ethical Use Notice

The dictionary list in this demo is drawn from publicly available research on common PIN patterns. This demo runs entirely in the browser against a value you supply. It does not contact any authentication system, API, or external service.

The list is included for educational purposes — to make the real-world frequency distribution of PIN choices concrete — not as an operational attack resource.

## Limitations

- The dictionary contains 50 entries; real-world wordlists used in credential-stuffing attacks can contain millions of entries across full passwords
- This demo does not fall back to brute force if the PIN is not in the dictionary — the point is to show what the dictionary alone covers and where it stops
- Scoped to four-digit numeric PINs only
- The 50 ms interval is a pacing choice for readability, not a reflection of real attack speeds

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
