// emailModal.js — inline contact form with custom validation + button states
document.addEventListener("DOMContentLoaded", () => {
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

    Object.values(fields).forEach((field) => {
        if (!field) return;

        field.addEventListener("input", () => {
            validateField(field, true);
        });

        field.addEventListener("blur", () => {
            validateField(field);
        });
    });

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

    function isValidEmail(value) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    }

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

            default:
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
                break;
        }
    }
});