(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5544920068762";
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("#menu-principal");
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMenu = (restoreFocus = false) => {
    if (!menu || !menuToggle) return;

    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");

    if (restoreFocus) menuToggle.focus();
  };

  if (menu && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const willOpen = !menu.classList.contains("open");

      menu.classList.toggle("open", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
      document.body.classList.toggle("menu-open", willOpen);
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu(true);
      }
    });

    const desktop = window.matchMedia("(min-width: 821px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });

    const menuLinks = [...menu.querySelectorAll('a[href^="#"]')]
      .map((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window) {
      const visibleSections = new Map();
      const updateActiveLink = () => {
        const active = [...visibleSections.entries()]
          .filter(([, isVisible]) => isVisible)
          .map(([section]) => section)
          .sort(
            (a, b) =>
              Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.3) -
              Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.3),
          )[0];

        menuLinks.forEach(({ link, section }) => {
          if (section === active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => visibleSections.set(entry.target, entry.isIntersecting));
          updateActiveLink();
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
      );

      menuLinks.forEach(({ section }) => observer.observe(section));
    }
  }

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    const phone = contactForm.querySelector("#contact-phone");
    const message = contactForm.querySelector("#contact-message");
    const counter = contactForm.querySelector("#message-counter");
    const status = contactForm.querySelector(".form-status");

    const formatBrazilianPhone = (value) => {
      const digits = value.replace(/\D/g, "").slice(0, 11);

      if (!digits) return "";
      if (digits.length <= 2) return `(${digits}`;

      const areaCode = digits.slice(0, 2);
      const localNumber = digits.slice(2);
      const prefixLength = digits.length === 11 ? 5 : 4;
      const prefix = localNumber.slice(0, prefixLength);
      const suffix = localNumber.slice(prefixLength);

      return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ""}`;
    };

    const getCaretAfterDigit = (value, digitCount) => {
      if (digitCount <= 0) return value ? 1 : 0;

      let digitsFound = 0;

      for (let index = 0; index < value.length; index += 1) {
        if (/\d/.test(value[index])) digitsFound += 1;
        if (digitsFound === digitCount) return index + 1;
      }

      return value.length;
    };

    phone.addEventListener("input", () => {
      const originalValue = phone.value;
      const originalCaret = phone.selectionStart ?? originalValue.length;
      const digitsBeforeCaret = originalValue
        .slice(0, originalCaret)
        .replace(/\D/g, "").length;

      phone.value = formatBrazilianPhone(originalValue);

      const nextCaret = getCaretAfterDigit(phone.value, digitsBeforeCaret);
      phone.setSelectionRange(nextCaret, nextCaret);
    });

    const updateCounter = () => {
      counter.textContent = `${message.value.length}/${message.maxLength}`;
    };

    message.addEventListener("input", updateCounter);
    updateCounter();

    contactForm.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        field.removeAttribute("aria-invalid");
        status.textContent = "";
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidFields = [...contactForm.elements].filter((field) => {
        if (typeof field.checkValidity !== "function") return false;

        const value = typeof field.value === "string" ? field.value.trim() : "";
        const tooShort =
          field.minLength > 0 && value.length > 0 && value.length < field.minLength;
        const phoneTooShort =
          field.id === "contact-phone" &&
          value.replace(/\D/g, "").length < 8;

        return !field.checkValidity() || tooShort || phoneTooShort;
      });

      if (invalidFields.length > 0) {

        invalidFields.forEach((field) => field.setAttribute("aria-invalid", "true"));
        status.textContent =
          "Revise os campos indicados. Suas informações foram mantidas.";
        invalidFields[0]?.focus();
        return;
      }

      const data = new FormData(contactForm);
      const userMessage = String(data.get("message")).trim();
      const formattedMessage = /[.!?]$/.test(userMessage)
        ? userMessage
        : `${userMessage}.`;
      const text = [
        `Olá! Meu nome é ${data.get("name")}.`,
        "",
        `Empresa ou segmento: ${data.get("company")}.`,
        "",
        `Tipo de projeto: ${data.get("project")}.`,
        "",
        `Mensagem: ${formattedMessage}`,
      ].join("\n");

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      const whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (!whatsappWindow) window.location.href = url;

      status.textContent =
        "Mensagem organizada. Revise e envie na conversa do WhatsApp.";
    });
  }
})();
