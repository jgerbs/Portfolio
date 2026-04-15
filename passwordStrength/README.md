# Password Strength Checker

An educational Streamlit web app that evaluates password strength in real time using length checks, character variety analysis, and Shannon entropy — and explains exactly what needs to improve.

## Overview

This demo accepts a password input and immediately scores it across five strength tiers from Very Weak to Very Strong. Rather than returning a single pass/fail result, it provides specific, actionable feedback for each criterion that the password fails — making it clear not just whether a password is weak, but why.

It is an educational tool, not a production authentication system. Its purpose is to make the principles behind password strength concrete and interactive.

## Purpose

Weak passwords are one of the most persistent vulnerabilities in real-world systems. Most people understand that passwords should be "strong" but have little intuition for what that means in practice. This demo makes the evaluation criteria visible: you can see exactly which rules a password satisfies, watch your entropy score change as you add characters, and understand the gap between a password that feels strong and one that actually resists brute-force attempts.

## How It Works

Password strength is evaluated on two dimensions: a point-based criteria check and a Shannon entropy calculation.

**Point-based scoring (0–6 points)**

| Criterion | Points |
|---|---|
| Length 8–11 characters | 1 |
| Length 12+ characters | 2 |
| Contains uppercase letters (A–Z) | +1 |
| Contains lowercase letters (a–z) | +1 |
| Contains digits (0–9) | +1 |
| Contains special characters (!@#$%^&* etc.) | +1 |

**Shannon entropy**

Entropy is calculated as `len(password) × log₂(charset_size)`, where `charset_size` accumulates based on which character classes are present (26 lowercase + 26 uppercase + 10 digits + 32 special characters). Entropy, measured in bits, reflects how many guesses an attacker would need to exhaust all possibilities at a given password length and character set.

**Strength tiers (entropy-based)**

| Tier | Entropy threshold |
|---|---|
| Very Weak | < 28 bits |
| Weak | 28–35 bits |
| Moderate | 36–59 bits |
| Strong | 60–89 bits |
| Very Strong | 90+ bits |

Each evaluation run produces a strength tier and a list of feedback items — pass indicators (✅) for criteria met, warnings (⚠️) for borderline cases, and failure indicators (❌) for missing requirements.

## Features

- Real-time evaluation as the user types, with results displayed instantly
- Five strength tiers with color-coded emoji labels
- Per-criterion feedback: each missing character class or length threshold generates a specific tip
- Shannon entropy score calculated from actual character set composition
- Masked password input — the entered value is not displayed in plaintext
- Single-dependency setup — only Streamlit is required

## Tech Stack

- [Python 3](https://www.python.org/)
- [Streamlit](https://streamlit.io/) — web UI and input handling
- `re` (Python standard library) — character class detection via regex
- `math` (Python standard library) — `log2` for entropy calculation

## Running Locally

**Prerequisites:** Python 3.7+ and pip

```bash
# Install the dependency
pip install -r requirements.txt

# Start the app
streamlit run app.py
```

Streamlit will open the app automatically at `http://localhost:8501`.

## Usage

1. Open the app in your browser
2. Type a password into the input field — the field masks the input by default
3. The strength tier and feedback list appear immediately below
4. Read each feedback item to understand which criteria your password satisfies and which it misses
5. Modify the password and watch the tier and entropy score change in real time

**Example interactions (safe test values):**

- `abc` → Very Weak: too short, missing uppercase, digits, and special characters
- `Password1` → Weak or Moderate: meets length and variety minimums but entropy is limited
- `T!g3r#Maple92` → Strong or Very Strong: length, all four character classes, high entropy

## Security Concepts Demonstrated

**Why length matters more than complexity alone**
Entropy scales with both length and charset size. A 16-character lowercase-only password has significantly more entropy than an 8-character password with all four character classes. Adding characters always increases entropy; adding a new character class only helps once.

**Why character variety still matters**
Using only lowercase letters limits `charset_size` to 26. Adding uppercase, digits, and special characters expands the effective search space an attacker must cover, multiplying the cost of an exhaustive guess.

**Common patterns that feel strong but are not**
Simple substitutions (`p@ssw0rd`) and dictionary words with appended digits satisfy the character variety rules but still score poorly on entropy because they are short. A password that checks every box but uses only 8–9 characters will remain in the Moderate or Weak tier.

**What entropy actually measures**
Shannon entropy here estimates worst-case brute-force cost assuming uniform random character selection. Real passwords are not random, and attackers use dictionaries and pattern rules first — so the entropy score is an upper bound on resistance, not a guarantee.

## Ethical Use Notice

This app is for educational purposes only. It does not transmit, store, log, or retain any password entered into it — all evaluation happens locally in the running Python process and is discarded when the session ends.

It is not a substitute for real-world password security practices, which include proper hashing (bcrypt, Argon2), breach database checks, rate limiting, multi-factor authentication, and session management. Nothing in this demo should be used as the basis for an authentication system.

## Limitations

- Entropy is calculated from character class composition only, not from the actual distribution of characters in the password — it does not penalize repeated characters, dictionary words, or predictable patterns like `aaaaB1!`
- The special character set recognized by the regex is fixed (`!@#$%^&*(),.?\":{}|<>`) and does not cover all possible symbols
- Strength tiers are based on entropy thresholds that are reasonable approximations, not a standardized specification
- There is no breached password check (e.g., against HaveIBeenPwned) — a password that scores Very Strong here may still be compromised if it has appeared in a data breach
- Single-page, single-input interface — no history, no comparison, no export

## Future Improvements

- Check the entered password against a known-breached password database (e.g., via the HaveIBeenPwned k-anonymity API)
- Penalize common patterns: dictionary words, keyboard walks (`qwerty`), repeated characters, and simple substitutions
- Display a visual entropy meter alongside the tier label
- Add a password generator that produces examples meeting the Very Strong threshold
- Show an estimated brute-force time alongside the entropy score for additional context

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
