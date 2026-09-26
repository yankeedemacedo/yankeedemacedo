document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const header = document.querySelector(".site-header");
  const magneticButtons = document.querySelectorAll("[data-magnetic]");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const yearNode = document.querySelector("[data-year]");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (typeof IntersectionObserver !== "undefined") {
    const markerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            markerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealItems.forEach((item) => markerObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  magneticButtons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) / 10;
      const offsetY = (event.clientY - rect.top - rect.height / 2) / 10;

      button.style.setProperty("--x", `${offsetX}px`);
      button.style.setProperty("--y", `${offsetY}px`);
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--x", "0px");
      button.style.setProperty("--y", "0px");
    });
  });

  const navLinks = document.querySelectorAll(".main-nav a");

  const activateCurrentNav = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === currentPage;
      link.classList.toggle("is-active", isActive);
    });
  };

  window.addEventListener("scroll", () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 14);
    }
    activateCurrentNav();
  });

  activateCurrentNav();
});
