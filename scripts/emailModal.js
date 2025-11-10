// emailModal.js — polished version with validation + status UI
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("emailModal");
  const openBtn = document.getElementById("emailButton");
  const closeBtn = modal?.querySelector(".close");
  const form = document.getElementById("emailForm");

  if (!modal || !openBtn || !closeBtn || !form) return;

  const statusMsg = document.createElement("p");
  statusMsg.className = "status-message";
  form.appendChild(statusMsg);

  /* ---------- OPEN / CLOSE MODAL ---------- */
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
    statusMsg.textContent = "";
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  /* ---------- FORM SUBMIT ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "";
    statusMsg.className = "status-message";

    const name = form.name.value.trim();
    const company = form.company.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // ---- Validation ----
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!name || !email || !message) {
      showStatus("Please fill in all required fields.", "error");
      return;
    }
    if (!emailRegex.test(email)) {
      showStatus("Please enter a valid email address.", "error");
      return;
    }

    // ---- Sending ----
    showStatus("Sending message...", "sending");

    try {
      await emailjs.send("service_rq8f16l", "template_pk40ijl", {
        name,
        company,
        email,
        message,
      });

      showStatus("Message sent successfully!", "success");
      form.reset();

      // fade out success message then close
      setTimeout(() => {
        modal.style.display = "none";
        statusMsg.textContent = "";
      }, 1500);
    } catch (err) {
      console.error("Email send failed:", err);
      showStatus("Something went wrong. Please try again later.", "error");
    }
  });

  /* ---------- Helper ---------- */
  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-message ${type}`;
  }
});
