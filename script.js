document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const ambientLayer =
    document.querySelector(".ambient-layer") || document.createElement("div");
  ambientLayer.classList.add("ambient-layer");
  if (!document.querySelector(".ambient-layer")) {
    document.body.appendChild(ambientLayer);
  }

  const cursorGlow = document.querySelector(".cursor-glow") || document.createElement("div");
  cursorGlow.classList.add("cursor-glow");
  if (!document.querySelector(".cursor-glow")) {
    document.body.appendChild(cursorGlow);
  }

  document.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  const orbCount = 18;
  for (let i = 0; i < orbCount; i += 1) {
    const orb = document.createElement("span");
    orb.className = "orb";
    orb.style.setProperty("--x", `${Math.random() * 100}%`);
    orb.style.setProperty("--y", `${Math.random() * 100}%`);
    orb.style.setProperty("--size", `${Math.random() * 180 + 90}px`);
    orb.style.setProperty("--duration", `${Math.random() * 10 + 12}s`);
    orb.style.opacity = `${Math.random() * 0.45 + 0.25}`;
    ambientLayer.appendChild(orb);
  }

  const pixelCount = 24;
  for (let i = 0; i < pixelCount; i += 1) {
    const pixel = document.createElement("span");
    pixel.className = "pixel";
    pixel.style.setProperty("--x", `${Math.random() * 100}%`);
    pixel.style.setProperty("--y", `${Math.random() * 100}%`);
    pixel.style.setProperty("--duration", `${Math.random() * 6 + 4}s`);
    pixel.style.opacity = `${Math.random() * 0.6 + 0.2}`;
    ambientLayer.appendChild(pixel);
  }

  const interactiveCards = document.querySelectorAll(
    ".project-card, .interest-card, .panel, .contact-card, .profile-card",
  );

  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 12;
      const rotateX = (0.5 - y) * 12;

      card.style.setProperty("--rotateX", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--rotateY", `${rotateY.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rotateX", "0deg");
      card.style.setProperty("--rotateY", "0deg");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
});
