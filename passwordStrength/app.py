import re
import streamlit as st
import math

st.title("🔐 Password Strength Checker/Feedback")
st.write("Check how secure your password really is — and learn how to make it stronger!")

password = st.text_input("Enter a password:", type="password")

def check_strength(password):
    feedback = []
    strength_points = 0

    # Length check
    if len(password) < 8:
        feedback.append("❌ Too short — use at least 8 characters.")
    elif len(password) >= 8 and len(password) < 12:
        strength_points += 1
        feedback.append("⚠️ Consider using 12+ characters for better security.")
    else:
        strength_points += 2
        feedback.append("✅ Good length.")

    # Character variety
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


    charset_size = 0
    if re.search(r"[a-z]", password): charset_size += 26
    if re.search(r"[A-Z]", password): charset_size += 26
    if re.search(r"[0-9]", password): charset_size += 10
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): charset_size += 32

    if charset_size > 0:
        entropy_bits = len(password) * math.log2(charset_size)
    else:
        entropy_bits = 0

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

    if category == "🔵 Very Strong 💪":
        feedback.append("✅ Difficult to brute-force. Good job!")
    elif category in ["🟡 Moderate", "🟢 Strong"]:
        feedback.append("💡 To reach 'Very Strong', add more unique symbols or length.")

    return category, feedback


if password:
    category, feedback = check_strength(password)
    st.markdown(f"### Strength: {category}")
    st.markdown("**Feedback:**")
    for tip in feedback:
        st.write(tip)
