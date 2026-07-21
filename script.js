const elements = document.querySelectorAll(
  ".badge, .hero h1, .hero-text > p, .hero-actions, .hero-card"
);

elements.forEach((element, index) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(24px)";
  element.style.transition = `
    opacity 0.7s ease ${index * 0.12}s,
    transform 0.7s ease ${index * 0.12}s
  `;
});

window.addEventListener("load", () => {
  elements.forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
  });
});