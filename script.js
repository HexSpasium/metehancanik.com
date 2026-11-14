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
/* MC atmospheric map — original procedural visualization, not live forecast data. */
(()=> {
 const canvas=document.getElementById('mcWeatherCanvas'); if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true}); if(!ctx)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let w=0,h=0,dpr=1,t=0,raf=0;
 const blobs=Array.from({length:22},(_,i)=>({x:((i*137.5)%100)/100,y:((i*61.7)%100)/100,r:.12+((i*17)%20)/100,v:.000035+((i*13)%9)/100000,phase:i*1.7,hue:i%4}));
 const resize=()=>{const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,1.7);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
 const path=(pts,color,width=1)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const draw=()=>{
  t+=reduced?0:.45;ctx.clearRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'rgba(4,19,42,.18)');bg.addColorStop(.55,'rgba(7,38,75,.08)');bg.addColorStop(1,'rgba(2,10,25,.28)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  blobs.forEach((b)=>{const x=(b.x*w+Math.sin(t*.006+b.phase)*w*.07+w)%w,y=b.y*h+Math.cos(t*.004+b.phase)*h*.055,radius=b.r*Math.min(w,h)*(1+.12*Math.sin(t*.009+b.phase));const g=ctx.createRadialGradient(x,y,0,x,y,radius);const p=[['rgba(40,125,214,.18)','rgba(20,75,150,0)'],['rgba(71,173,230,.15)','rgba(25,100,170,0)'],['rgba(88,111,188,.14)','rgba(35,70,135,0)'],['rgba(31,155,190,.14)','rgba(20,90,140,0)']][b.hue];g.addColorStop(0,p[0]);g.addColorStop(1,p[1]);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill()});
  ctx.save();ctx.strokeStyle='rgba(99,174,226,.10)';ctx.lineWidth=.65;
  for(let x=0;x<w;x+=Math.max(38,w/24)){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=Math.max(34,h/13)){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.restore();
  for(let k=0;k<13;k++){const baseY=h*(.12+k*.067),pts=[];for(let x=-10;x<=w+10;x+=Math.max(12,w/90)){const wave=Math.sin(x/w*5.3+t*.004+k*.61)*h*.035+Math.sin(x/w*11-k+t*.003)*h*.012;pts.push([x,baseY+wave])}path(pts,'rgba(111,190,239,'+(.09+(k%3)*.025)+')',.8)}
  for(let row=0;row<17;row++){const y0=h*(.08+row*.052),pts=[];for(let x=-20;x<=w+20;x+=Math.max(10,w/100)){const y=y0+Math.sin(x/w*4.2+row*.7+t*.006)*h*.022+Math.sin(x/w*9+t*.004+row)*h*.009;pts.push([x,y])}path(pts,'rgba(65,177,255,.18)',.8);const px=((t*(.55+row*.018)+row*79)%(w+80))-40,py=y0+Math.sin(px/w*4.2+row*.7+t*.006)*h*.022;const glow=ctx.createRadialGradient(px,py,0,px,py,10);glow.addColorStop(0,'rgba(169,231,255,.9)');glow.addColorStop(1,'rgba(44,155,255,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(px,py,10,0,Math.PI*2);ctx.fill()}
  const cx=w*.77,cy=h*.46,rad=Math.min(w,h)*.36;ctx.beginPath();ctx.arc(cx,cy,rad,-.8+t*.0009,.35+t*.0009);ctx.strokeStyle='rgba(72,177,255,.16)';ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,rad*.72,-.8+t*.0009,.35+t*.0009);ctx.strokeStyle='rgba(72,177,255,.10)';ctx.stroke();
  ctx.fillStyle='rgba(126,197,244,.52)';ctx.font='700 8px Manrope, sans-serif';ctx.fillText('ATMOSPHERIC MODEL / GLOBAL FLOW',18,h-20);ctx.fillText('MC • WEATHER SYSTEM',w-170,22);
  if(!reduced)raf=requestAnimationFrame(draw)
 };
 const ro=new ResizeObserver(resize);ro.observe(canvas);resize();draw();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else if(!reduced){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}});
})();
