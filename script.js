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

if (menu && menuToggle) {
  const menuSectionLinks = Array.from(
    menu.querySelectorAll('a[href^="#"]')
  )
    .map((link) => {
      const targetId = link.getAttribute("href").slice(1);
      const section = document.getElementById(targetId);

      if (!section || !section.matches("main section[id]")) {
        return null;
      }

      return { link, section };
    })
    .filter(Boolean);

  const setActiveMenuLink = (activeSection) => {
    menuSectionLinks.forEach(({ link, section }) => {
      const isActive = section === activeSection;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const closeMenu = (restoreFocus = false) => {
    menu.classList.remove("open");
    menuToggle.textContent = "☰";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      menuToggle.focus();
    }
  };

  if ("IntersectionObserver" in window && menuSectionLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (firstEntry, secondEntry) =>
              Math.abs(
                firstEntry.boundingClientRect.top - window.innerHeight * 0.25
              ) -
              Math.abs(
                secondEntry.boundingClientRect.top - window.innerHeight * 0.25
              )
          )[0];

        if (visibleEntry) {
          setActiveMenuLink(visibleEntry.target);
        }
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0,
      }
    );

    menuSectionLinks.forEach(({ section }) => {
      sectionObserver.observe(section);
    });
  }

  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");

    if (menu.classList.contains("open")) {
      menuToggle.textContent = "✕";
      menuToggle.setAttribute("aria-label", "Fechar menu");
      menuToggle.setAttribute("aria-expanded", "true");
    } else {
      closeMenu();
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
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
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      closeMenu(true);
    }
  });

  const desktopMediaQuery = window.matchMedia("(min-width: 901px)");

  desktopMediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const messageInput = contactForm.querySelector("#contact-message");
  const messageCounter = contactForm.querySelector(".message-counter");

  const updateMessageCounter = () => {
    if (messageInput && messageCounter) {
      messageCounter.textContent =
        `${messageInput.value.length}/${messageInput.maxLength} caracteres`;
    }
  };

  if (messageInput && messageCounter) {
    messageInput.addEventListener("input", updateMessageCounter);
    updateMessageCounter();
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const statusMessage = contactForm.querySelector(".form-status");
    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    statusMessage.textContent = "";
    statusMessage.classList.remove("is-success", "is-error");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar o formulário.");
      }

      contactForm.reset();
      updateMessageCounter();
      statusMessage.textContent =
        "Mensagem enviada com sucesso! Entraremos em contato em breve.";
      statusMessage.classList.add("is-success");
    } catch (error) {
      statusMessage.textContent =
        error.name === "AbortError"
          ? "O envio demorou mais que o esperado. Tente novamente."
          : "Não foi possível enviar a mensagem. Tente novamente ou envie um e-mail.";
      statusMessage.classList.add("is-error");
    } finally {
      window.clearTimeout(timeoutId);
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}
