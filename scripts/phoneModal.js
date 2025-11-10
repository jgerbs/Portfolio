// phoneModal.js
const modal = document.getElementById("phoneModal");
const btn =
  document.getElementById("phoneButton") ||
  document.querySelector('a[title="Call Jack Gerber"]');
const closeBtn = document.querySelector(".close");

if (btn && modal && closeBtn) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}
