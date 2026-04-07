const WHATSAPP_NUMBER = "5532998406067";
const ALL_FILTER_LABEL = "Todos";

const portfolioData = window.MIU_PORTFOLIO || {};
const portfolioItems = Array.isArray(portfolioData.items) ? [...portfolioData.items] : [];
const featuredVideoData = portfolioData.featuredVideo || null;

const state = {
  activeCategory: ALL_FILTER_LABEL
};

const portfolioGrid = document.getElementById("portfolioGrid");
const portfolioSummary = document.getElementById("portfolioSummary");
const portfolioFilters = document.getElementById("portfolioFilters");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const siteHeader = document.querySelector(".site-header");
const heroPortfolioCount = document.getElementById("heroPortfolioCount");
const currentYear = document.getElementById("currentYear");

const featuredVideo = document.getElementById("featuredVideo");
const featuredVideoTitle = document.getElementById("featuredVideoTitle");
const featuredVideoDescription = document.getElementById("featuredVideoDescription");
const featuredVideoCta = document.getElementById("featuredVideoCta");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCategory = document.getElementById("lightboxCategory");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDescription = document.getElementById("lightboxDescription");
const lightboxClose = document.getElementById("lightboxClose");

function buildWhatsAppUrl(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

function getSortedPortfolio(items) {
  return [...items].sort((first, second) => {
    if (Boolean(first.featured) !== Boolean(second.featured)) {
      return first.featured ? -1 : 1;
    }

    return first.title.localeCompare(second.title, "pt-BR");
  });
}

function getCategories() {
  const categories = new Set();

  portfolioItems.forEach((item) => {
    if (item.category) {
      categories.add(item.category);
    }
  });

  return [ALL_FILTER_LABEL, ...Array.from(categories).sort((a, b) => a.localeCompare(b, "pt-BR"))];
}

function getFilteredPortfolio() {
  return getSortedPortfolio(portfolioItems).filter((item) => {
    return state.activeCategory === ALL_FILTER_LABEL || item.category === state.activeCategory;
  });
}

function renderFilters() {
  if (!portfolioFilters) {
    return;
  }

  portfolioFilters.innerHTML = "";

  getCategories().forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip" + (state.activeCategory === category ? " is-active" : "");
    button.textContent = category;
    button.setAttribute("aria-pressed", String(state.activeCategory === category));

    button.addEventListener("click", () => {
      state.activeCategory = category;
      renderFilters();
      renderPortfolio();
    });

    portfolioFilters.appendChild(button);
  });
}

function updateSummary(items) {
  if (!portfolioSummary) {
    return;
  }

  const count = items.length;
  const label = count === 1 ? "referencia" : "referencias";
  const categoryPart =
    state.activeCategory === ALL_FILTER_LABEL
      ? "do portfolio"
      : 'em "' + state.activeCategory + '"';

  portfolioSummary.textContent = "Mostrando " + count + " " + label + " " + categoryPart + ".";
}

function createDetailList(details) {
  if (!Array.isArray(details) || !details.length) {
    return "";
  }

  return details
    .slice(0, 3)
    .map((detail) => "<li>" + detail + "</li>")
    .join("");
}

function createPortfolioCard(item) {
  const message =
    "Ola! Vi o projeto " +
    item.title +
    " no portfolio da Miu Lab 3D e quero algo parecido. Pode me passar mais detalhes?";

  return [
    '<article class="portfolio-card">',
    '  <button class="portfolio-media" type="button" data-lightbox-id="' + item.id + '">',
    '    <img src="' +
      item.image +
      '" alt="' +
      (item.imageAlt || item.title) +
      '" loading="lazy" decoding="async">',
    '    <span class="portfolio-zoom"><i class="bi bi-arrows-fullscreen"></i> Ampliar</span>',
    "  </button>",
    '  <div class="portfolio-content">',
    '    <div class="portfolio-meta">',
    '      <span class="badge badge--category">' + item.category + "</span>",
    '      <span class="badge badge--label">' + (item.label || "Projeto realizado") + "</span>",
    "    </div>",
    '    <h3 class="portfolio-title">' + item.title + "</h3>",
    '    <p class="portfolio-description">' + item.description + "</p>",
    '    <ul class="portfolio-detail-list">' + createDetailList(item.details) + "</ul>",
    '    <div class="portfolio-footer">',
    '      <button class="button button--outline portfolio-view" type="button" data-lightbox-id="' +
      item.id +
      '">',
    "        Ver imagem",
    "      </button>",
    '      <a class="button button--primary" href="' +
      buildWhatsAppUrl(message) +
      '" target="_blank" rel="noreferrer">',
    "        Pedir algo parecido",
    "      </a>",
    "    </div>",
    "  </div>",
    "</article>"
  ].join("");
}

function renderPortfolio() {
  if (!portfolioGrid) {
    return;
  }

  const filteredItems = getFilteredPortfolio();
  updateSummary(filteredItems);

  if (!filteredItems.length) {
    portfolioGrid.innerHTML =
      '<div class="portfolio-empty">' +
      "<strong>Nada apareceu nessa categoria.</strong><br>" +
      "Vale chamar no WhatsApp para conversar sobre uma ideia personalizada." +
      "</div>";
    return;
  }

  portfolioGrid.innerHTML = filteredItems.map(createPortfolioCard).join("");
}

function getPortfolioItemById(itemId) {
  return portfolioItems.find((item) => item.id === itemId) || null;
}

function openLightbox(itemId) {
  const item = getPortfolioItemById(itemId);

  if (!item || !lightbox || !lightboxImage || !lightboxTitle || !lightboxDescription) {
    return;
  }

  lightboxImage.src = item.image;
  lightboxImage.alt = item.imageAlt || item.title;
  lightboxTitle.textContent = item.title;
  lightboxCategory.textContent = (item.label || "Projeto realizado") + " - " + item.category;
  lightboxDescription.textContent = item.description;

  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");

  if (lightboxClose) {
    lightboxClose.focus();
  }
}

function closeLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
}

function bindPortfolioActions() {
  if (!portfolioGrid) {
    return;
  }

  portfolioGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox-id]");

    if (!trigger) {
      return;
    }

    openLightbox(trigger.getAttribute("data-lightbox-id"));
  });
}

function bindLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-close]") || event.target.closest(".lightbox-close")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function applyFeaturedVideo() {
  if (!featuredVideoData || !featuredVideo) {
    return;
  }

  featuredVideo.src = featuredVideoData.video;
  featuredVideo.poster = featuredVideoData.poster || "";
  featuredVideo.load();

  if (featuredVideoTitle) {
    featuredVideoTitle.textContent = featuredVideoData.title || "Projeto em video";
  }

  if (featuredVideoDescription) {
    featuredVideoDescription.textContent = featuredVideoData.description || "";
  }

  if (featuredVideoCta && featuredVideoData.ctaMessage) {
    featuredVideoCta.href = buildWhatsAppUrl(featuredVideoData.ctaMessage);
  }
}

function syncHeader() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
}

function bindMenu() {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function syncStaticInfo() {
  if (heroPortfolioCount) {
    heroPortfolioCount.textContent = String(portfolioItems.length);
  }

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
}

function init() {
  syncStaticInfo();
  renderFilters();
  renderPortfolio();
  bindPortfolioActions();
  bindLightbox();
  applyFeaturedVideo();
  bindMenu();
  syncHeader();
}

window.addEventListener("scroll", syncHeader);
window.addEventListener("DOMContentLoaded", init);
