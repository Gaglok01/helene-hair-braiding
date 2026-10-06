const BOOKING_URL="https://square.site/book/LPMDDWYGKW5QB/helenebraids-denton-tx";
const fallback=[{name:"Crochet Braids",description:"Beautiful protective styling with a polished finish.",price:"From $150",duration:"3 hr",image:null},{name:"Cornrows",description:"Clean, precise braiding designed for comfort and lasting style.",price:"From $105",duration:"2 hr 20 min",image:null},{name:"Men Cornrows",description:"Professional cornrow styles tailored for men.",price:"Price varies",duration:"45 min",image:null}];
const esc=v=>String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const img=v=>typeof v==="string"&&/^https?:\/\//i.test(v.trim())?v.trim():null;
const short=v=>{v=String(v ?? "").replace(/\s+/g," ").trim();return v.length>135?v.slice(0,135).trim()+"...":v};
function card(s,i){
  const image=img(s.image);
  const name=esc(s.name||"Hair Service");

  return `<article
    class="service-card reveal"
    data-service-id="${esc(s.id||"")}"
    tabindex="0"
    role="button"
    aria-label="View ${name} details">

    <div class="service-image">
      ${image
        ?`<img src="${esc(image)}"
               alt="${name}"
               loading="${i<3?"eager":"lazy"}">`
        :""
      }
    </div>

    <div class="service-body">
      <h3>${name}</h3>

      <p>${esc(short(
        s.description||
        "View service details, options and availability."
      ))}</p>

      <div class="service-meta">
        <div>
          <div class="service-price">
            ${esc(s.price||"View price")}
          </div>

          ${s.duration
            ?`<div class="service-duration">
                ${esc(s.duration)}+
              </div>`
            :""
          }
        </div>

        <button
          class="service-arrow"
          type="button"
          aria-label="View ${name}">
          ↗
        </button>
      </div>
    </div>
  </article>`;
}

let allServices=[];
let visibleServiceCount=9;
let activeServiceFilter="all";
let serviceSearchTerm="";

function serviceCategory(name=""){
  const value=name.toLowerCase();
  if(value.includes("kid")) return "kids";
  if(value.includes("men")||value.includes("male")) return "men";
  if(value.includes("cornrow")||value.includes("stitch")) return "cornrows";
  if(value.includes("loc")||value.includes("twist")) return "locs-twists";
  if(value.includes("crochet")) return "crochet";
  return "braids";
}

function serviceCategoryLabel(value){
  return {"braids":"Braids","cornrows":"Cornrows","locs-twists":"Locs & twists","kids":"Kids","men":"Men","crochet":"Crochet"}[value]||value;
}

function buildServiceFilters(list){
  const holder=document.querySelector("#service-filters");
  if(!holder) return;
  const categories=[...new Set(list.map(item=>item.category))];
  holder.innerHTML=`<button type="button" class="service-filter active" data-service-filter="all">All services</button>${categories.map(category=>`<button type="button" class="service-filter" data-service-filter="${esc(category)}">${esc(serviceCategoryLabel(category))}</button>`).join("")}`;
  holder.querySelectorAll(".service-filter").forEach(button=>{
    button.addEventListener("click",()=>{
      holder.querySelectorAll(".service-filter").forEach(item=>item.classList.remove("active"));
      button.classList.add("active");
      activeServiceFilter=button.dataset.serviceFilter;
      visibleServiceCount=9;
      renderFilteredServices();
    });
  });
}

function filteredServices(){
  return allServices.filter(service=>{
    const categoryMatch=activeServiceFilter==="all"||service.category===activeServiceFilter;
    const searchMatch=!serviceSearchTerm||`${service.name} ${service.description||""}`.toLowerCase().includes(serviceSearchTerm);
    return categoryMatch&&searchMatch;
  });
}

function renderFilteredServices(){
  const grid=document.querySelector("#service-grid");
  const more=document.querySelector("#service-more");
  const list=filteredServices();
  grid.innerHTML=list.slice(0,visibleServiceCount).map(card).join("");
  more.hidden=list.length<=visibleServiceCount;
  observe();
}

function services(list){
  allServices=list.filter(item=>item?.name).map(item=>({...item,category:serviceCategory(item.name)}));
  buildServiceFilters(allServices);
  renderFilteredServices();
  document.querySelector("#catalog-status").hidden=true;
}
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

async function load(){try{const r=await fetch("/api/catalog",{headers:{Accept:"application/json"},cache:"no-store"});if(!r.ok)throw Error(r.status);const p=await r.json(),list=Array.isArray(p.services)&&p.services.length?p.services:fallback;services(list);gallery(list);hydratePremiumMedia(list)}catch(err){console.error(err);const status=document.querySelector("#catalog-status");status.textContent="The live catalog is temporarily unavailable. Temporary services are displayed.";status.classList.add("is-error");services(fallback);gallery(fallback);hydratePremiumMedia(fallback)}}
let observer;function observe(){if(!("IntersectionObserver"in window)){document.querySelectorAll(".reveal").forEach(x=>x.classList.add("visible"));return}observer ??= new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal:not([data-o])").forEach(x=>{x.dataset.o=1;observer.observe(x)})}
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


document.querySelectorAll(".faq-list details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});


document.querySelector("#service-search-input")?.addEventListener("input",event=>{
  serviceSearchTerm=event.target.value.trim().toLowerCase();
  visibleServiceCount=9;
  renderFilteredServices();
});

document.querySelector("#service-more")?.addEventListener("click",()=>{
  visibleServiceCount+=9;
  renderFilteredServices();
});


/* V6 &mdash; active navigation, online status and graceful retries */
const announcer=document.querySelector("#site-announcer");

function announce(message){
  if(!announcer) return;
  announcer.textContent="";
  window.setTimeout(()=>announcer.textContent=message,50);
}

const observedSections=[...document.querySelectorAll("main section[id]")];
const navLinks=[...document.querySelectorAll('.header nav a[href^="#"]')];

if("IntersectionObserver" in window){
  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      navLinks.forEach(link=>{
        const active=link.getAttribute("href")==="#"+entry.target.id;
        if(active) link.setAttribute("aria-current","page");
        else link.removeAttribute("aria-current");
      });
    });
  },{rootMargin:"-35% 0px -55% 0px",threshold:0});
  observedSections.forEach(section=>sectionObserver.observe(section));
}

window.addEventListener("online",()=>{
  announce("You are back online.");
  const status=document.querySelector("#catalog-status");
  if(status?.classList.contains("is-error")) load();
});

window.addEventListener("offline",()=>{
  announce("You are offline. Booking links may require an internet connection.");
});

const originalLoad=load;
load=async function(){
  const status=document.querySelector("#catalog-status");
  try{
    await originalLoad();
    status?.classList.remove("is-error");
    status?.classList.add("is-success");
  }catch(error){
    status?.classList.add("is-error");
    throw error;
  }
};


function hydratePremiumMedia(list){
  const images=list.filter(item=>item?.image);
  const hero=document.querySelector("#hero-media");
  if(hero&&images.length){
    hero.style.backgroundImage=`url("${images[0].image}")`;
    requestAnimationFrame(()=>hero.classList.add("is-ready"));
  }

  const track=document.querySelector("#featured-track");
  if(track){
    const featured=images.slice(0,8);
    track.innerHTML=featured.map(item=>`
      <article class="featured-item" data-service-id="${esc(item.id||"")}">
        <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">
        <div class="featured-copy">
          <h4>${esc(item.name)}</h4>
          <p>${esc(item.price||"View current price")}${item.duration?` &bull; ${esc(item.duration)}`:""}</p>
          <button class="featured-service-open" type="button">Book this style &rarr;</button>
        </div>
      </article>`).join("");
  }
}


/* V8 &mdash; live salon status */
function updateLocationStatus(){
  const text=document.querySelector("#location-status-text");
  if(!text) return;

  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:"America/Chicago",
    weekday:"short",
    hour:"2-digit",
    minute:"2-digit",
    hour12:false
  }).formatToParts(new Date());

  const weekday=parts.find(p=>p.type==="weekday")?.value;
  const hour=Number(parts.find(p=>p.type==="hour")?.value||0);
  const minute=Number(parts.find(p=>p.type==="minute")?.value||0);
  const currentMinutes=hour*60+minute;
  const isWeekday=["Mon","Tue","Wed","Thu","Fri"].includes(weekday);
  const isOpen=isWeekday&&currentMinutes>=540&&currentMinutes<1020;

  text.textContent=isOpen
    ? "Open now &middot; closes at 5:00 PM"
    : (isWeekday ? "Closed now &middot; opens tomorrow at 9:00 AM" : "Closed today &middot; opens Monday at 9:00 AM");
}
updateLocationStatus();
window.setInterval(updateLocationStatus,60000);


/* V9 &mdash; subtle map reveal */
const mapFrame=document.querySelector(".map-frame");
if(mapFrame&&"IntersectionObserver" in window){
  const mapObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        mapFrame.classList.add("map-ready");
        mapObserver.disconnect();
      }
    });
  },{threshold:.2});
  mapObserver.observe(mapFrame);
}


/* V11 &mdash; premium compact header on scroll */
const premiumHeader=document.querySelector("#site-header");
function updatePremiumHeader(){
  premiumHeader?.classList.toggle("is-scrolled",window.scrollY>36);
}
window.addEventListener("scroll",updatePremiumHeader,{passive:true});
updatePremiumHeader();


/* =========================================================
   HELENE SERVICE DETAIL EXPERIENCE
   ========================================================= */

function variationRank(name=""){
  const value=name.toLowerCase();

  const size=
    value.includes("small-medium") ? 10 :
    value.startsWith("small") ? 10 :
    value.startsWith("medium") ? 20 :
    value.startsWith("large") ? 30 : 40;

  const length=
    value.includes("shoulder") ? 1 :
    value.includes("bra length") ? 2 :
    value.includes("middle") ? 3 :
    value.includes("mid back") ? 3 :
    value.includes("waist") ? 4 :
    value.includes("butt") ? 5 : 6;

  return size*10+length;
}

function openServiceModal(service){

  const bookButton=document.querySelector(".service-modal-book");

  if(bookButton && service?.id){
    bookButton.href=
      "https://book.squareup.com/appointments/0b6mjjvy3fgq3r/location/LPMDDWYGKW5QB/services/"
      + encodeURIComponent(service.id);
  }





  const modal=document.querySelector("#service-modal");
  if(!modal||!service)return;

  const imageEl=document.querySelector("#service-modal-image");
  const title=document.querySelector("#service-modal-title");
  const description=document.querySelector("#service-modal-description");
  const price=document.querySelector("#service-modal-price");
  const options=document.querySelector("#service-modal-options");
  const selected=document.querySelector("#service-modal-selected");

  title.textContent=service.name||"Hair Service";

  description.textContent=
    service.description||
    "Explore the available options for this service.";

  price.textContent=service.price||"View price";

  if(service.image){
    imageEl.src=service.image;
    imageEl.alt=service.name||"Hair service";
    imageEl.hidden=false;
  }else{
    imageEl.removeAttribute("src");
    imageEl.alt="";
    imageEl.hidden=true;
  }

  const variations=[...(service.variations||[])]
    .filter(v=>v.bookable!==false)
    .sort((a,b)=>
      variationRank(a.name)-variationRank(b.name)
    );

  if(variations.length){

    options.innerHTML=variations.map((v,index)=>`
      <button
        class="service-option"
        type="button"
        data-variation-index="${index}">

        <span>
          <span class="service-option-name">
            ${esc(v.name||"Standard")}
          </span>

          ${v.duration
            ?`<span class="service-option-duration">
                Estimated time · ${esc(v.duration)}
              </span>`
            :""
          }
        </span>

        <span class="service-option-price">
          ${esc(v.price||"Price varies")}
        </span>
      </button>
    `).join("");

    options.querySelectorAll(".service-option")
      .forEach(button=>{

        button.addEventListener("click",()=>{

          options.querySelectorAll(".service-option")
            .forEach(item=>
              item.classList.remove("is-selected")
            );

          button.classList.add("is-selected");

          const variation=
            variations[
              Number(button.dataset.variationIndex)
            ];

          selected.textContent=
            `${variation.name} · `+
            `${variation.price||"Price varies"}`+
            `${variation.duration
              ?` · ${variation.duration}`
              :""
            }`;
        });

      });

  }else{
    options.innerHTML=`
      <div class="service-option">
        <span>
          <span class="service-option-name">
            Contact Helene for this service
          </span>
        </span>
        <span class="service-option-price">
          ${esc(service.price||"Price varies")}
        </span>
      </div>`;
  }

  selected.textContent="Select an option above";

  modal.hidden=false;
  document.body.classList.add("service-modal-open");

  requestAnimationFrame(()=>{
    modal.querySelector(".service-modal-close")?.focus();
  });
}

function closeServiceModal(){
  const modal=document.querySelector("#service-modal");
  if(!modal)return;

  modal.hidden=true;
  document.body.classList.remove("service-modal-open");
}

document.addEventListener("click",event=>{

  const featured=event.target.closest(".featured-item");

  if(featured){
    const service=allServices.find(
      item=>item.id===featured.dataset.serviceId
    );

    if(service){
      event.preventDefault();
      openServiceModal(service);
      return;
    }
  }


  const card=event.target.closest(".service-card");

  if(card){
    const service=allServices.find(
      item=>item.id===card.dataset.serviceId
    );

    if(service){
      event.preventDefault();
      openServiceModal(service);
      return;
    }
  }

  if(event.target.closest("[data-service-close]")){
    closeServiceModal();
  }
});

document.addEventListener("keydown",event=>{

  if(event.key==="Escape"){
    closeServiceModal();
  }

  if(
    (event.key==="Enter"||event.key===" ") &&
    event.target.classList.contains("service-card")
  ){
    event.preventDefault();

    const service=allServices.find(
      item=>item.id===event.target.dataset.serviceId
    );

    if(service){
      openServiceModal(service);
    }
  }
});









