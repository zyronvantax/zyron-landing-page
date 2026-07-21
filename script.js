const elements = document.querySelectorAll(
  ".hero .badge, .hero h1, .hero-text > p, .hero-actions, .hero-card"
);

const revealElements = document.querySelectorAll(
  ".section-heading, .service-card, .about-text, .about-card div, .project-card, .contact-box"
);

const showRevealElements = () => {
  revealElements.forEach((element) => {
    element.classList.remove("reveal");
    element.classList.add("show");
    element.style.removeProperty("transition-delay");
  });
};

try {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion) {
    elements.forEach((element, index) => {
      const delay = Math.min(index * 75, 300);

      element.style.opacity = "0";
      element.style.transform = "translateY(24px)";
      element.style.transition = `
        opacity 0.7s ease ${delay}ms,
        transform 0.7s ease ${delay}ms
      `;
    });

    window.addEventListener("load", () => {
      elements.forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      });
    });

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
        }
      );

      const sectionDelayIndexes = new Map();

      revealElements.forEach((element) => {
        const section = element.closest("section");
        const sectionIndex = sectionDelayIndexes.get(section) || 0;
        const delay = Math.min(sectionIndex * 100, 300);

        element.classList.add("reveal");
        element.style.transitionDelay = `${delay}ms`;
        revealObserver.observe(element);

        sectionDelayIndexes.set(section, sectionIndex + 1);
      });
    } else {
      showRevealElements();
    }
  }
} catch {
  elements.forEach((element) => {
    element.style.transition = "none";
    element.style.opacity = "1";
    element.style.transform = "none";
  });

  showRevealElements();
}

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("open");

  if (menu.classList.contains("open")) {
    menuToggle.textContent = "✕";
    menuToggle.setAttribute("aria-label", "Fechar menu");
    menuToggle.setAttribute("aria-expanded", "true");
  } else {
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
document.addEventListener("click", (event) => {
  const clickedInsideMenu = menu.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (
    menu.classList.contains("open") &&
    !clickedInsideMenu &&
    !clickedToggle
  ) {
    menu.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    menu.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.focus();
  }
});

const desktopMediaQuery = window.matchMedia("(min-width: 901px)");

desktopMediaQuery.addEventListener("change", (event) => {
  if (event.matches) {
    menu.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
