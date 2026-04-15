# ============================================================
# app.py
# Streamlit web app for real-time password strength analysis.
#
# Responsibilities:
#   - Accept user password input via a secure text field
#   - Evaluate password length and character variety
#   - Calculate Shannon entropy to estimate brute-force resistance
#   - Assign one of five strength categories (Very Weak → Very Strong)
#   - Provide specific, actionable improvement feedback
#   - Display results immediately in the Streamlit UI
#
# Sections:
#   1) IMPORTS
#   2) PAGE SETUP + PASSWORD INPUT
#   3) STRENGTH ANALYSIS FUNCTION
#   4) RESULTS DISPLAY
#
# Cleanup notes:
#   - Simplified redundant `elif len(password) >= 8 and len(password) < 12`
#     to `elif len(password) < 12` (>= 8 is guaranteed at that branch).
#   - Collapsed two-branch entropy assignment into a single inline expression.
# ============================================================


# ============================================================
# 1) IMPORTS
# ============================================================

import math
import re

import streamlit as st


# ============================================================
# 2) PAGE SETUP + PASSWORD INPUT
# ============================================================

st.title("🔐 Password Strength Checker/Feedback")
st.write("Check how secure your password really is — and learn how to make it stronger!")

password = st.text_input("Enter a password:", type="password")


# ============================================================
# 3) STRENGTH ANALYSIS FUNCTION
# ============================================================

def check_strength(password):
    """
    Evaluate password strength based on length, character variety, and entropy.

    Scoring:
        - Length:           0–2 points (< 8 chars = 0, 8–11 = 1, 12+ = 2)
        - Uppercase:        +1 point
        - Lowercase:        +1 point
        - Digits:           +1 point
        - Special chars:    +1 point

    Entropy (bits) = len(password) × log2(charset_size), where charset_size
    reflects which character classes are present.

    Returns:
        category (str):      Emoji-labeled strength tier
        feedback (list[str]): Actionable tips and pass/fail indicators
    """
    feedback = []
    strength_points = 0

    # --- Length check ---
    if len(password) < 8:
        feedback.append("❌ Too short — use at least 8 characters.")
    elif len(password) < 12:
        strength_points += 1
        feedback.append("⚠️ Consider using 12+ characters for better security.")
    else:
        strength_points += 2
        feedback.append("✅ Good length.")

    # --- Character variety checks ---
    if re.search(r"[A-Z]", password):
        strength_points += 1
    else:
        feedback.append("❌ Add uppercase letters (A–Z).")

    if re.search(r"[a-z]", password):
        strength_points += 1
    else:
        feedback.append("❌ Add lowercase letters (a–z).")

    if re.search(r"[0-9]", password):
        strength_points += 1
    else:
        feedback.append("❌ Add digits (0–9).")

    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        strength_points += 1
    else:
        feedback.append("❌ Add special characters (!@#$%^&* etc).")

    # --- Entropy calculation ---
    # Charset size grows as more character classes are used.
    charset_size = 0
    if re.search(r"[a-z]", password): charset_size += 26
    if re.search(r"[A-Z]", password): charset_size += 26
    if re.search(r"[0-9]", password): charset_size += 10
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): charset_size += 32

    entropy_bits = len(password) * math.log2(charset_size) if charset_size > 0 else 0

    # --- Strength category based on entropy thresholds ---
    if entropy_bits < 28:
        category = "🔴 Very Weak"
    elif entropy_bits < 36:
        category = "🟠 Weak"
    elif entropy_bits < 60:
        category = "🟡 Moderate"
    elif entropy_bits < 90:
        category = "🟢 Strong"
    else:
        category = "🔵 Very Strong 💪"

    # --- Category-specific feedback ---
    if category == "🔵 Very Strong 💪":
        feedback.append("✅ Difficult to brute-force. Good job!")
    elif category in ["🟡 Moderate", "🟢 Strong"]:
        feedback.append("💡 To reach 'Very Strong', add more unique symbols or length.")

    return category, feedback


# ============================================================
# 4) RESULTS DISPLAY
# ============================================================

if password:
    category, feedback = check_strength(password)
    st.markdown(f"### Strength: {category}")
    st.markdown("**Feedback:**")
    for tip in feedback:
        st.write(tip)
