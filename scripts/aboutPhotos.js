// aboutPhotos.js
const photos = document.querySelectorAll(".photo-stack img");
const aboutText = document.getElementById("aboutPhotoText");
let activeTimeout;

photos.forEach((photo) => {
  photo.addEventListener("click", () => {
    // clear pending animation
    if (activeTimeout) clearTimeout(activeTimeout);

    // deactivate all photos
    photos.forEach((p) => p.classList.remove("active"));
    photo.classList.add("active");

    // fade text out
    aboutText.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    aboutText.style.opacity = "0";
    aboutText.style.transform = "translateY(10px)";

    // update text after short delay
    activeTimeout = setTimeout(() => {
      aboutText.textContent = photo.dataset.text;
      aboutText.style.opacity = "1";
      aboutText.style.transform = "translateY(0)";
    }, 400);
  });
});
