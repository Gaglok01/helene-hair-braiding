const BOOKING_URL = "https://book.squareup.com/appointments/6wbu997dkzpv60/location/LYX600Y176JVJ/services";

const fallbackServices = [
  {name:"Crochet Braids", description:"Beautiful protective styling with a polished finish.", price:"From $150", duration:"3 hr", image:null},
  {name:"Cornrows", description:"Clean, precise braiding designed for comfort and lasting style.", price:"From $105", duration:"2 hr 20 min", image:null},
  {name:"Men Cornrows", description:"Professional cornrow styles tailored for men.", price:"Price varies", duration:"45 min", image:null}
];

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}

function serviceCard(service){
  const image = service.image
    ? `<div class="service-image"><img loading="lazy" src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)}"></div>`
    : `<div class="service-image"></div>`;
  return `
    <article class="service-card reveal">
      ${image}
      <div class="service-body">
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description || "View current details and availability in Square.")}</p>
        <div class="service-meta">
          <div>
            <div class="service-price">${escapeHtml(service.price || "View price")}</div>
            <div class="service-duration">${escapeHtml(service.duration || "")}</div>
          </div>
          <a class="service-arrow" href="${BOOKING_URL}" target="_blank" rel="noopener" aria-label="Book ${escapeHtml(service.name)}">↗</a>
        </div>
      </div>
    </article>`;
}

function renderServices(services){
  const grid = document.querySelector("#service-grid");
  const status = document.querySelector("#catalog-status");
  const visible = services.slice(0, 9);
  grid.innerHTML = visible.map(serviceCard).join("");
  status.hidden = true;
  observeReveals();
}

function renderGallery(services){
  const gallery = document.querySelector("#gallery-grid");
  const empty = document.querySelector("#gallery-empty");
  const withImages = services.filter(service => service.image).slice(0, 12);
  if(!withImages.length){
    gallery.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  gallery.innerHTML = withImages.map(service => `
    <a class="gallery-item reveal" href="${BOOKING_URL}" target="_blank" rel="noopener">
      <img loading="lazy" src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)}">
      <span class="gallery-caption">${escapeHtml(service.name)}</span>
    </a>`).join("");
  observeReveals();
}

async function loadCatalog(){
  try{
    const response = await fetch("/api/catalog", {headers:{"Accept":"application/json"}});
    if(!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    const payload = await response.json();
    const services = Array.isArray(payload.services) && payload.services.length ? payload.services : fallbackServices;
    renderServices(services);
    renderGallery(services);
  }catch(error){
    console.warn(error);
    document.querySelector("#catalog-status").textContent = "Square services will appear after the production API token is configured.";
    renderServices(fallbackServices);
    renderGallery(fallbackServices);
  }
}

function observeReveals(){
  const items = document.querySelectorAll(".reveal:not([data-observed])");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  items.forEach(item => {
    item.dataset.observed = "true";
    observer.observe(item);
  });
}

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
}));

document.querySelector("#year").textContent = new Date().getFullYear();
observeReveals();
loadCatalog();
