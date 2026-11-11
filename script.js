(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];


  // Real-world interactive map (OpenStreetMap + Leaflet)
  const mapElement = $("#signalMap");
  if (mapElement && window.L) {
    const map = L.map(mapElement, {
      scrollWheelZoom: false,
      zoomControl: true,
      preferCanvas: true
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    const cities = [
      { name: "Mersin", country: "Türkiye", coords: [36.8121, 34.6415], main: true },
      { name: "İstanbul", country: "Türkiye", coords: [41.0082, 28.9784] },
      { name: "Ankara", country: "Türkiye", coords: [39.9334, 32.8597] },
      { name: "Adana", country: "Türkiye", coords: [36.9914, 35.3308] },
      { name: "Antalya", country: "Türkiye", coords: [36.8969, 30.7133] },
      { name: "Podgorica", country: "Karadağ", coords: [42.4304, 19.2594] },
      { name: "Tahran", country: "İran", coords: [35.6892, 51.3890] },
      { name: "Kandahar", country: "Afganistan", coords: [31.6289, 65.7372] },
      { name: "İzmir", country: "Türkiye", coords: [38.4237, 27.1428] },
      { name: "Aydın", country: "Türkiye", coords: [37.8560, 27.8416] }
    ];
    const hub = cities[0];
    cities.forEach(city => {
      const marker = L.circleMarker(city.coords, {
        radius: city.main ? 8 : 5,
        color: city.main ? "#fff0bd" : "#8ad5ac",
        weight: city.main ? 2 : 1.5,
        fillColor: city.main ? "#e4b84f" : "#39b879",
        fillOpacity: 1
      }).addTo(map);
      marker.bindTooltip(city.name + " · " + city.country, {
        permanent: true, direction: "top", offset: [0, city.main ? -8 : -6],
        className: city.main ? "map-city-label map-city-hub" : "map-city-label"
      });
      marker.bindPopup("<strong>" + city.name + "</strong><br>" + city.country);
      if (!city.main) {
        L.polyline([hub.coords, city.coords], {
          color: "#d7b45c", weight: 1.5, opacity: 0.62, dashArray: "5 8",
          lineCap: "round", interactive: false
        }).addTo(map);
      }
    });
    const bounds = L.latLngBounds(cities.map(city => city.coords));
    map.fitBounds(bounds, { padding: [42, 42], maxZoom: 5 });
    setTimeout(() => map.invalidateSize(), 250);
    window.addEventListener("resize", () => map.invalidateSize(), { passive: true });
  } else if (mapElement) {
    mapElement.innerHTML = '<div class="map-loading">Harita kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.</div>';
  }

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