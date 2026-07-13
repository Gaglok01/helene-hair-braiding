const BOOKING_URL =
  "https://book.squareup.com/appointments/6wbu997dkzpv60/location/LYX600Y176JVJ/services";

/* --------------------------------------------------
   FALLBACK SERVICES
-------------------------------------------------- */

const fallbackServices = [
  {
    name: "Crochet Braids",
    description:
      "Beautiful protective styling with a polished, comfortable finish.",
    price: "From $150",
    duration: "3 hr",
    image: null,
  },
  {
    name: "Cornrows",
    description:
      "Clean and precise braiding designed for comfort and lasting style.",
    price: "From $105",
    duration: "2 hr 20 min",
    image: null,
  },
  {
    name: "Men Cornrows",
    description:
      "Professional cornrow styles tailored for men and modern looks.",
    price: "Price varies",
    duration: "45 min",
    image: null,
  },
];

/* --------------------------------------------------
   BASIC HELPERS
-------------------------------------------------- */

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function truncateText(value = "", maxLength = 135) {
  const text = cleanText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

function normalizeImageUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const url = value.trim();

  if (!/^https?:\/\//i.test(url)) {
    return null;
  }

  return url;
}

/* --------------------------------------------------
   HEADER SCROLL EFFECT
-------------------------------------------------- */

const siteHeader = document.querySelector(".site-header");

function updateHeaderState() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("header-scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateHeaderState, {
  passive: true,
});

updateHeaderState();

/* --------------------------------------------------
   MOBILE MENU
-------------------------------------------------- */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

function closeMobileMenu() {
  if (!menuToggle || !mainNav) {
    return;
  }

  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  if (!mainNav) {
    return;
  }

  const isOpen = mainNav.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 780) {
    closeMobileMenu();
  }
});

/* --------------------------------------------------
   REVEAL ANIMATIONS
-------------------------------------------------- */

let revealObserver = null;

function initializeRevealObserver() {
  if (
    revealObserver ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );
}

function observeReveals() {
  initializeRevealObserver();

  const items = document.querySelectorAll(
    ".reveal:not([data-reveal-observed])"
  );

  items.forEach((item) => {
    item.dataset.revealObserved = "true";

    if (revealObserver) {
      revealObserver.observe(item);
    } else {
      item.classList.add("visible");
    }
  });
}

/* --------------------------------------------------
   SERVICE CARD
-------------------------------------------------- */

function createServiceCard(service, index) {
  const name = escapeHtml(service.name || "Hair Service");

  const description = escapeHtml(
    truncateText(
      service.description ||
        "View current service details, price and availability through Square."
    )
  );

  const price = escapeHtml(service.price || "View price");
  const duration = escapeHtml(service.duration || "");

  const imageUrl = normalizeImageUrl(service.image);

  const imageContent = imageUrl
    ? `
      <div class="service-image">
        <img
          src="${escapeHtml(imageUrl)}"
          alt="${name}"
          loading="${index < 3 ? "eager" : "lazy"}"
          decoding="async"
        >
      </div>
    `
    : `
      <div
        class="service-image"
        aria-hidden="true"
      ></div>
    `;

  return `
    <article class="service-card reveal">
      ${imageContent}

      <div class="service-body">
        <h3>${name}</h3>

        <p>${description}</p>

        <div class="service-meta">
          <div>
            <div class="service-price">
              ${price}
            </div>

            ${
              duration
                ? `
                  <div class="service-duration">
                    ${duration}
                  </div>
                `
                : ""
            }
          </div>

          <a
            class="service-arrow"
            href="${BOOKING_URL}"
            target="_blank"
            rel="noopener"
            aria-label="Book ${name}"
          >
            ↗
          </a>
        </div>
      </div>
    </article>
  `;
}

/* --------------------------------------------------
   SERVICES RENDERING
-------------------------------------------------- */

function renderServices(services) {
  const grid = document.querySelector("#service-grid");
  const status = document.querySelector("#catalog-status");

  if (!grid) {
    return;
  }

  const usableServices = Array.isArray(services)
    ? services.filter((service) => service?.name)
    : [];

  const servicesToShow = usableServices.slice(0, 9);

  grid.innerHTML = servicesToShow
    .map(createServiceCard)
    .join("");

  if (status) {
    status.hidden = true;
  }

  observeReveals();
}

/* --------------------------------------------------
   GALLERY RENDERING
-------------------------------------------------- */

function createGalleryItem(service, index) {
  const name = escapeHtml(service.name || "Rosa hairstyle");
  const imageUrl = normalizeImageUrl(service.image);

  if (!imageUrl) {
    return "";
  }

  return `
    <a
      class="gallery-item reveal"
      href="${BOOKING_URL}"
      target="_blank"
      rel="noopener"
      aria-label="View and book ${name}"
    >
      <img
        src="${escapeHtml(imageUrl)}"
        alt="${name}"
        loading="${index < 4 ? "eager" : "lazy"}"
        decoding="async"
      >

      <span class="gallery-caption">
        ${name}
      </span>
    </a>
  `;
}

function renderGallery(services) {
  const gallery = document.querySelector("#gallery-grid");
  const emptyMessage = document.querySelector("#gallery-empty");

  if (!gallery) {
    return;
  }

  const servicesWithImages = Array.isArray(services)
    ? services
        .filter(
          (service) =>
            service?.name &&
            normalizeImageUrl(service.image)
        )
        .slice(0, 14)
    : [];

  if (!servicesWithImages.length) {
    gallery.innerHTML = "";

    if (emptyMessage) {
      emptyMessage.hidden = false;
    }

    return;
  }

  if (emptyMessage) {
    emptyMessage.hidden = true;
  }

  gallery.innerHTML = servicesWithImages
    .map(createGalleryItem)
    .join("");

  observeReveals();
}

/* --------------------------------------------------
   SQUARE CATALOG
-------------------------------------------------- */

async function loadSquareCatalog() {
  const status = document.querySelector("#catalog-status");

  try {
    const response = await fetch("/api/catalog", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Square catalog request failed with status ${response.status}`
      );
    }

    const payload = await response.json();

    const services =
      Array.isArray(payload.services) &&
      payload.services.length
        ? payload.services
        : fallbackServices;

    renderServices(services);
    renderGallery(services);
  } catch (error) {
    console.error(
      "Unable to load Square catalog:",
      error
    );

    if (status) {
      status.textContent =
        "The live Square catalog could not be loaded. Temporary services are displayed.";
      status.hidden = false;
    }

    renderServices(fallbackServices);
    renderGallery(fallbackServices);
  }
}

/* --------------------------------------------------
   SMOOTH INTERNAL NAVIGATION
-------------------------------------------------- */

document
  .querySelectorAll('a[href^="#"]')
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (
        !targetId ||
        targetId === "#" ||
        targetId.length < 2
      ) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const headerHeight =
        siteHeader?.offsetHeight || 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });

/* --------------------------------------------------
   CURRENT YEAR
-------------------------------------------------- */

const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent =
    new Date().getFullYear();
}

/* --------------------------------------------------
   INITIALIZATION
-------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  observeReveals();
  updateHeaderState();
  loadSquareCatalog();
});