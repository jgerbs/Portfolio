// scrollAnimations.js

// --- Scroll reveal animation ---
const faders = document.querySelectorAll(".fade-in, .fade-left, .fade-right");
const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
faders.forEach((el) => observer.observe(el));

// --- Animate skill bars ---
const bars = document.querySelectorAll(".skill-bar .fill");
const skillsObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.style.width;
        fill.style.setProperty("--target-width", width);
        fill.style.width = "0";
        setTimeout(() => fill.classList.add("show"), 100);
        obs.unobserve(fill);
      }
    });
  },
  { threshold: 0.4 }
);
bars.forEach((b) => skillsObserver.observe(b));
