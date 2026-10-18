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

  // Carrossel do arquivo (projects.html): web → IA → laboratório
  const track = document.querySelector("[data-carousel-track]");
  if (track) {
    const slides = Array.from(track.children);
    const prev = document.querySelector("[data-carousel-prev]");
    const next = document.querySelector("[data-carousel-next]");
    const dots = Array.from(document.querySelectorAll("[data-carousel-dot]"));
    const counter = document.querySelector("[data-carousel-current]");
    const carousel = track.closest(".carousel");
    let index = 0;

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide) => { slide.scrollTop = 0; });
      dots.forEach((dot, d) => dot.setAttribute("aria-current", String(d === index)));
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
    };

    // Âncoras profundas: #ia / #laboratorio abrem o slide certo;
    // dossiers (#agendia…) vivem no slide 0
    const slideForHash = (hash) => {
      if (hash === "#ia") return 1;
      if (hash === "#laboratorio") return 2;
      return 0;
    };
    const applyHash = () => {
      const i = slideForHash(window.location.hash);
      go(i);
      if (i > 0 && carousel) carousel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    };

    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));
    dots.forEach((dot, d) => dot.addEventListener("click", () => go(d)));
    document.addEventListener("keydown", (event) => {
      if (!carousel || !carousel.contains(document.activeElement)) return;
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    });
    window.addEventListener("hashchange", applyHash);
    applyHash();
  }

  // Hero 3D: intercalação suave das 4 fotos recortadas (sem filtros).
  // O recorte fica absoluto sobre as letras; aqui só alternamos o visível.
  const heroStack = document.querySelector(".hero-photo-stack");
  if (heroStack) {
    const heroPhotos = Array.from(heroStack.querySelectorAll("img"));
    const reduceHero = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let heroIdx = 0;
    let heroTimer = null;

    const showHero = (i) => {
      heroIdx = (i + heroPhotos.length) % heroPhotos.length;
      heroPhotos.forEach((photo, n) => photo.classList.toggle("is-on", n === heroIdx));
    };
    const pauseHero = () => {
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
    };
    const playHero = () => {
      if (reduceHero || heroTimer || heroPhotos.length < 2) return;
      heroTimer = window.setInterval(() => showHero(heroIdx + 1), 3500);
    };

    showHero(0);
    playHero();

    // economiza bateria: não anima com a aba em segundo plano
    document.addEventListener("visibilitychange", () => {
      document.hidden ? pauseHero() : playHero();
    });
  }

  // Cycler de retratos: clique avança; sozinho troca a cada 3s.
  // Pausa no hover/foco; com reduced-motion, só no clique.
  const reduceMotionCycler = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-cycler]").forEach((cycler) => {
    const frames = Array.from(cycler.querySelectorAll(".frame"));
    const label = cycler.querySelector("[data-cycler-label]");
    const count = cycler.querySelector("[data-cycler-count]");
    if (frames.length < 2) return;
    let current = 0;
    let timer = null;

    const show = (i) => {
      current = (i + frames.length) % frames.length;
      frames.forEach((frame, f) => frame.classList.toggle("is-on", f === current));
      if (label) label.textContent = frames[current].getAttribute("data-label") || `Foto ${current + 1}`;
      if (count) count.textContent = String(current + 1).padStart(2, "0");
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    const start = () => {
      if (reduceMotionCycler || timer) return;
      const interval = Number(cycler.getAttribute("data-interval")) || 3000;
      timer = window.setInterval(() => show(current + 1), interval);
    };

    cycler.addEventListener("click", () => show(current + 1));
    cycler.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show(current + 1);
      }
    });
    cycler.addEventListener("pointerenter", stop);
    cycler.addEventListener("pointerleave", start);
    cycler.addEventListener("focusin", stop);
    cycler.addEventListener("focusout", start);
    start();
  });
});
