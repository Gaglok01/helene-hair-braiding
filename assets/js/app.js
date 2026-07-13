const BOOKING_URL="https://book.squareup.com/appointments/6wbu997dkzpv60/location/LYX600Y176JVJ/services";
const fallback=[{name:"Crochet Braids",description:"Beautiful protective styling with a polished finish.",price:"From $150",duration:"3 hr",image:null},{name:"Cornrows",description:"Clean, precise braiding designed for comfort and lasting style.",price:"From $105",duration:"2 hr 20 min",image:null},{name:"Men Cornrows",description:"Professional cornrow styles tailored for men.",price:"Price varies",duration:"45 min",image:null}];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const img=v=>typeof v==="string"&&/^https?:\/\//i.test(v.trim())?v.trim():null;
const short=v=>{v=String(v??"").replace(/\s+/g," ").trim();return v.length>135?v.slice(0,135).trim()+"…":v};
function card(s,i){const image=img(s.image),name=esc(s.name||"Hair Service");return `<article class="service-card reveal"><div class="service-image">${image?`<img src="${esc(image)}" alt="${name}" loading="${i<3?"eager":"lazy"}">`:""}</div><div class="service-body"><h3>${name}</h3><p>${esc(short(s.description||"View current details and availability through Square."))}</p><div class="service-meta"><div><div class="service-price">${esc(s.price||"View price")}</div>${s.duration?`<div class="service-duration">${esc(s.duration)}</div>`:""}</div><a class="service-arrow" href="${BOOKING_URL}" target="_blank" rel="noopener">↗</a></div></div></article>`}
function services(list){document.querySelector("#service-grid").innerHTML=list.filter(x=>x?.name).slice(0,9).map(card).join("");document.querySelector("#catalog-status").hidden=true;observe()}
let galleryItems = [];
let activeGalleryIndex = 0;

function styleCategory(name = "") {
  const value = name.toLowerCase();
  if (value.includes("kid")) return "kids";
  if (value.includes("men") || value.includes("male")) return "men";
  if (value.includes("cornrow") || value.includes("stitch")) return "cornrows";
  if (value.includes("loc") || value.includes("twist")) return "locs-twists";
  return "braids";
}

function categoryLabel(value) {
  return ({
    "braids": "Braids",
    "cornrows": "Cornrows",
    "locs-twists": "Locs & twists",
    "kids": "Kids",
    "men": "Men"
  })[value] || value;
}

function buildGalleryFilters(items) {
  const toolbar = document.querySelector("#gallery-toolbar");
  if (!toolbar) return;
  const categories = [...new Set(items.map(item => item.category))];
  toolbar.innerHTML = `
    <button type="button" class="gallery-filter active" data-filter="all">All styles</button>
    ${categories.map(category => `<button type="button" class="gallery-filter" data-filter="${esc(category)}">${esc(categoryLabel(category))}</button>`).join("")}
  `;
  toolbar.querySelectorAll(".gallery-filter").forEach(button => {
    button.addEventListener("click", () => {
      toolbar.querySelectorAll(".gallery-filter").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      document.querySelectorAll(".gallery-item").forEach(item => {
        item.hidden = filter !== "all" && item.dataset.category !== filter;
      });
    });
  });
}

function openLightbox(index) {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox || !galleryItems.length) return;
  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeGalleryIndex];
  const image = document.querySelector("#lightbox-image");
  const caption = document.querySelector("#lightbox-caption");
  image.src = item.image;
  image.alt = item.name;
  caption.textContent = item.name;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector(".lightbox-close")?.focus();
}

function closeLightbox() {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

function gallery(list) {
  const g = document.querySelector("#gallery-grid");
  const e = document.querySelector("#gallery-empty");
  galleryItems = list
    .filter(x => x?.name && img(x.image))
    .slice(0, 18)
    .map(x => ({...x, category: styleCategory(x.name)}));

  if (!galleryItems.length) {
    g.innerHTML = "";
    e.hidden = false;
    document.querySelector("#gallery-toolbar")?.setAttribute("hidden", "");
    return;
  }

  e.hidden = true;
  document.querySelector("#gallery-toolbar")?.removeAttribute("hidden");
  buildGalleryFilters(galleryItems);

  g.innerHTML = galleryItems.map((x, index) => `
    <button class="gallery-item reveal" type="button" data-index="${index}" data-category="${esc(x.category)}" aria-label="Open ${esc(x.name)}">
      <img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy">
      <span class="gallery-caption">${esc(x.name)}</span>
    </button>`).join("");

  g.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => openLightbox(Number(item.dataset.index)));
  });
  observe();
}

async function load(){try{const r=await fetch("/api/catalog",{headers:{Accept:"application/json"},cache:"no-store"});if(!r.ok)throw Error(r.status);const p=await r.json(),list=Array.isArray(p.services)&&p.services.length?p.services:fallback;services(list);gallery(list)}catch(err){console.error(err);document.querySelector("#catalog-status").textContent="Temporary services are displayed.";services(fallback);gallery(fallback)}}
let observer;function observe(){if(!("IntersectionObserver"in window)){document.querySelectorAll(".reveal").forEach(x=>x.classList.add("visible"));return}observer??=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal:not([data-o])").forEach(x=>{x.dataset.o=1;observer.observe(x)})}
const menu=document.querySelector(".menu"),nav=document.querySelector("#nav");menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const loader = document.querySelector("#site-loader");
window.addEventListener("load", () => {
  window.setTimeout(() => loader?.classList.add("is-hidden"), 250);
});

document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev")?.addEventListener("click", () => openLightbox(activeGalleryIndex - 1));
document.querySelector(".lightbox-next")?.addEventListener("click", () => openLightbox(activeGalleryIndex + 1));
document.querySelector("#lightbox")?.addEventListener("click", event => {
  if (event.target.id === "lightbox") closeLightbox();
});
document.addEventListener("keydown", event => {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox || lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") openLightbox(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") openLightbox(activeGalleryIndex + 1);
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero-inner");
    if (hero && window.scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${window.scrollY * 0.08}px)`;
    }
  }, {passive:true});
}

document.querySelector("#year").textContent=new Date().getFullYear();observe();load();
