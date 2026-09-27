document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const yearNodes = document.querySelectorAll("[data-year]");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const parallaxItems = document.querySelectorAll("[data-parallax]");

  yearNodes.forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  // Header: hairline surge apenas após rolagem (peso físico, sem salto)
  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // Menu mobile acessível
  if (menuToggle && mobileNav) {
    const close = () => {
      mobileNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  // Marca a página atual (funciona no pathname do GitHub Pages)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href === currentPage) link.classList.add("is-active");
    else if (currentPage === "" && href === "index.html") link.classList.add("is-active");
  });

  // Revelação com inércia expo-out; respeita prefers-reduced-motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  // Rede de segurança: nenhum bloco pode ficar invisível para sempre.
  // Se o observer não disparar (aba em segundo plano, IO instável),
  // o timer revela tudo após 1.5s. Com JS desligado, o <noscript> do
  // <head> de cada página faz o mesmo via CSS.
  window.setTimeout(() => {
    revealItems.forEach((item) => item.classList.add("visible"));
  }, 1500);

  // Parallaxe sutil com inércia (lerp via rAF): desloca até ±28px
  if (!reduceMotion && parallaxItems.length > 0) {
    const state = new Map();
    parallaxItems.forEach((el) => state.set(el, { current: 0, target: 0 }));

    const measure = () => {
      const vh = window.innerHeight;
      state.forEach((s, el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) / vh; // -0.5 … 0.5
        s.target = Math.max(-0.5, Math.min(0.5, offset)) * -56;
      });
    };

    let ticking = false;
    const render = () => {
      ticking = false;
      let settled = true;
      state.forEach((s, el) => {
        s.current += (s.target - s.current) * 0.08; // inércia
        if (Math.abs(s.target - s.current) > 0.1) settled = false;
        el.style.transform = `translate3d(0, ${s.current.toFixed(2)}px, 0)`;
      });
      if (!settled) requestRender();
    };
    const requestRender = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    };

    window.addEventListener("scroll", () => { measure(); requestRender(); }, { passive: true });
    window.addEventListener("resize", () => { measure(); requestRender(); });
    measure();
    requestRender();
  }
});
