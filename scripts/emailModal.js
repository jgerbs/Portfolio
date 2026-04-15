/* ============================================================
   emailModal.js
   Inline contact form with real-time field validation and
   multi-state submit button feedback via EmailJS.

   Responsibilities:
   - Smooth-scrolls to the contact section when the email CTA is clicked
   - Validates name, email, and message fields on input and blur
   - Submits the form through EmailJS and handles success / error states
   - Manages five distinct button states: idle, sending, success, error, invalid
   - Clears all field errors and resets to idle after each outcome

   Section index:
   1. DOM references
   2. CTA scroll handler
   3. Real-time field validation
   4. Form submit handler
   5. Validation helpers
   6. Button state machine
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    /* ============================================================
       1. DOM REFERENCES
       ============================================================ */
    const openBtn = document.getElementById("emailButton");
    const contactSection = document.getElementById("contact");
    const form = document.getElementById("emailForm");

    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    const fields = {
        name: form.querySelector("#name"),
        email: form.querySelector("#email"),
        message: form.querySelector("#message")
    };

    /* ============================================================
       2. CTA SCROLL HANDLER
       ============================================================ */
    if (openBtn && contactSection) {
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            contactSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => {
                form.querySelector("input, textarea")?.focus();
            }, 500);
        });
    }

    /* ============================================================
       3. REAL-TIME FIELD VALIDATION
       ============================================================ */
    Object.values(fields).forEach((field) => {
        if (!field) return;

        /* Soft validation on input: only clears errors, never adds them */
        field.addEventListener("input", () => {
            validateField(field, true);
        });

        /* Strict validation on blur: shows errors on empty/invalid */
        field.addEventListener("blur", () => {
            validateField(field);
        });
    });

    /* ============================================================
       4. FORM SUBMIT HANDLER
       ============================================================ */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearAllErrors();

        const name = fields.name.value.trim();
        const company = form.company.value.trim();
        const email = fields.email.value.trim();
        const message = fields.message.value.trim();

        let hasError = false;

        if (!name) {
            setFieldError(fields.name);
            hasError = true;
        }

        if (!email || !isValidEmail(email)) {
            setFieldError(fields.email);
            hasError = true;
        }

        if (!message) {
            setFieldError(fields.message);
            hasError = true;
        }

        if (hasError) {
            setButtonState("invalid");
            return;
        }

        setButtonState("sending");

        try {
            await emailjs.send("service_rq8f16l", "template_pk40ijl", {
                name,
                company,
                email,
                message
            });

            form.reset();
            clearAllErrors();
            setButtonState("success");

            setTimeout(() => {
                setButtonState("idle");
            }, 1800);
        } catch (err) {
            console.error("Email send failed:", err);
            setButtonState("error");

            setTimeout(() => {
                setButtonState("idle");
            }, 2200);
        }
    });

    /* ============================================================
       5. VALIDATION HELPERS
       ============================================================ */
    function isValidEmail(value) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    }

    /* soft=true: clear errors only (used on "input"); soft=false: set errors too (used on "blur") */
    function validateField(field, soft = false) {
        const value = field.value.trim();

        if (field.hasAttribute("required") && !value) {
            if (!soft) setFieldError(field);
            else clearFieldError(field);
            return false;
        }

        if (field.type === "email" && value && !isValidEmail(value)) {
            setFieldError(field);
            return false;
        }

        clearFieldError(field);
        return true;
    }

    function setFieldError(field) {
        field.classList.add("field-error");
        field.setAttribute("aria-invalid", "true");
    }

    function clearFieldError(field) {
        field.classList.remove("field-error");
        field.removeAttribute("aria-invalid");
    }

    function clearAllErrors() {
        form.querySelectorAll(".field-error").forEach((field) => {
            field.classList.remove("field-error");
            field.removeAttribute("aria-invalid");
        });
    }

    /* ============================================================
       6. BUTTON STATE MACHINE
       ============================================================ */
    function setButtonState(state) {
        if (!submitBtn) return;

        submitBtn.classList.remove("is-sending", "is-success", "is-error", "is-invalid");

        switch (state) {
            case "sending":
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
                submitBtn.classList.add("is-sending");
                break;

            case "success":
                submitBtn.disabled = true;
                submitBtn.textContent = "Sent!";
                submitBtn.classList.add("is-success");
                break;

            case "error":
                submitBtn.disabled = false;
                submitBtn.textContent = "Try Again";
                submitBtn.classList.add("is-error");
                break;

            case "invalid":
                submitBtn.disabled = false;
                submitBtn.textContent = "Please Fill Required Fields";
                submitBtn.classList.add("is-invalid");

                setTimeout(() => {
                    if (submitBtn.classList.contains("is-invalid")) {
                        setButtonState("idle");
                    }
                }, 1800);
                break;

            default: // "idle"
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
                break;
        }
    }
});
