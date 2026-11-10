(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const progress = $("#progress");
  const nav = $("#mainNav");
  const menu = $("#menuToggle");

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    });
    $$("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Menüyü aç");
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      }
    });
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const filters = $$(".filter");
  const galleryCards = $$("#galleryGrid figure");
  filters.forEach(button => button.addEventListener("click", () => {
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const filter = button.dataset.filter || "all";
    galleryCards.forEach(card => {
      card.hidden = !(filter === "all" || card.dataset.category === filter);
    });
  }));
  const allCount = $(".filter[data-filter='all'] span");
  if (allCount) allCount.textContent = String(galleryCards.length);

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const caption = $("#lightboxCaption");
  const items = $$(".gallery-open");
  let current = 0;
  let previousFocus = null;

  function showImage(index) {
    if (!lightbox || !items.length) return;
    current = (index + items.length) % items.length;
    const button = items[current];
    const source = button.dataset.src;
    if (!source || !lightboxImage) return;
    lightboxImage.src = source;
    lightboxImage.alt = button.querySelector("img")?.alt || "Fotoğraf";
    if (caption) caption.textContent = button.dataset.caption || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#lightboxClose")?.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxImage?.removeAttribute("src");
    previousFocus?.focus();
  }
  items.forEach((button, index) => button.addEventListener("click", () => {
    previousFocus = button;
    showImage(index);
  }));
  $("#lightboxClose")?.addEventListener("click", closeLightbox);
  $("#lightboxPrev")?.addEventListener("click", () => showImage(current - 1));
  $("#lightboxNext")?.addEventListener("click", () => showImage(current + 1));
  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(current - 1);
    if (event.key === "ArrowRight") showImage(current + 1);
  });

  const revealTargets = $$(".section-label,.heading,.split,.stats,.timeline article,.education article,.skill-grid article,.refs article,.gallery figure,.brand-tag,.closing>div");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(element => element.classList.add("is-visible"));
  } else {
    revealTargets.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.transitionDelay = (index % 4) * 55 + "ms";
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1, rootMargin: "0px 0px -28px 0px" });
    revealTargets.forEach(element => observer.observe(element));
  }
})();