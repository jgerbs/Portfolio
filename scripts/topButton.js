// topButton.js
const topButton = document.getElementById("topButton");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});