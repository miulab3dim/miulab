const WHATSAPP_NUMBER = "5532998406067";
const ALL_FILTER_LABEL = "Todos";

const PLANS = {
  lite: {
    name: "Miu Box Lite",
    price: "R$ 49,90 / mes",
    monthly: "3 itens surpresa",
    summary: "3 itens surpresa para comecar na Miu Box com uma experiencia criativa e acessivel."
  },
  pro: {
    name: "Miu Box Pro",
    price: "R$ 79,90 / mes",
    monthly: "5 itens + brindes",
    summary: "5 itens surpresa + brindes para quem quer mais volume e uma assinatura mais marcante."
  },
  ultra: {
    name: "Miu Box Ultra",
    price: "R$ 119,90 / mes",
    monthly: "8 itens + brindes + extras",
    summary:
      "8 itens, brindes, algo tematico em meses especiais e presente de aniversario para a experiencia mais completa."
  }
};

const STYLES = {
  geek: {
    name: "Geek",
    description: "Referencias pop, setups, personagens e pecas com bastante personalidade."
  },
  "minimal-decor": {
    name: "Minimalista & Decor",
    description: "Formas limpas, detalhes elegantes e pecas que conversam bem com a decoracao."
  },
  "modern-functional": {
    name: "Moderno & Funcional",
    description: "Itens com cara de design utilitario, organizacao e praticidade no dia a dia."
  },
  "surpresa-total": {
    name: "Surpresa Total",
    description: "Curadoria livre para quem quer variar o mood e se surpreender a cada remessa."
  }
};

const MIU_BOX_CONFIG = window.MIU_BOX_CONFIG || {};
const VIA_CEP_BASE_URL = "https://viacep.com.br/ws/";

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

const subscriptionForm = document.getElementById("subscriptionForm");
const cpfInput = document.getElementById("cpf");
const fullNameInput = document.getElementById("fullName");
const birthDateInput = document.getElementById("birthDate");
const emailInput = document.getElementById("email");
const zipCodeInput = document.getElementById("zipCode");
const zipCodeStatus = document.getElementById("zipCodeStatus");
const streetInput = document.getElementById("street");
const numberInput = document.getElementById("number");
const complementInput = document.getElementById("complement");
const districtInput = document.getElementById("district");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const notesInput = document.getElementById("notes");
const planSelect = document.getElementById("planSelect");
const styleSelect = document.getElementById("styleSelect");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("subscriptionSubmit");
const transportFrame = document.getElementById("subscriptionTransportFrame");
const summaryPlanName = document.getElementById("summaryPlanName");
const summaryPlanPrice = document.getElementById("summaryPlanPrice");
const summaryPlanDescription = document.getElementById("summaryPlanDescription");
const summaryStyleName = document.getElementById("summaryStyleName");
const summaryStyleDescription = document.getElementById("summaryStyleDescription");
const summaryMonthlyCount = document.getElementById("summaryMonthlyCount");
const planNameHidden = document.getElementById("planNameHidden");
const planPriceHidden = document.getElementById("planPriceHidden");
const styleNameHidden = document.getElementById("styleNameHidden");
const styleDescriptionHidden = document.getElementById("styleDescriptionHidden");
const fullAddressHidden = document.getElementById("fullAddressHidden");
const submittedAtHidden = document.getElementById("submittedAtHidden");

let lastZipCodeLookup = "";
let zipCodeLookupSequence = 0;
let awaitingTransportResponse = false;
let transportTimeoutId = 0;

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
      ? "na galeria"
      : 'na categoria "' + state.activeCategory + '"';

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
    "Ola! Vi a referencia " +
    item.title +
    " e quero que minha Miu Box tenha uma vibe parecida. Pode me orientar sobre o melhor plano?";

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
    '      <span class="badge badge--label">' + (item.label || "Referencia") + "</span>",
    "    </div>",
    '    <h3 class="portfolio-title">' + item.title + "</h3>",
    '    <p class="portfolio-description">' + item.description + "</p>",
    '    <ul class="portfolio-detail-list">' + createDetailList(item.details) + "</ul>",
    '    <div class="portfolio-footer">',
    '      <button class="button button--outline" type="button" data-lightbox-id="' +
      item.id +
      '">',
    "        Ver imagem",
    "      </button>",
    '      <a class="button button--primary" href="' +
      buildWhatsAppUrl(message) +
      '" target="_blank" rel="noreferrer">',
    "        Quero essa vibe",
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
      "<strong>Nenhuma referencia apareceu nesse filtro.</strong><br>" +
      "Vale chamar no WhatsApp para falar do seu estilo ideal na Miu Box." +
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
  lightboxCategory.textContent = (item.label || "Referencia") + " - " + item.category;
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
    featuredVideoTitle.textContent = featuredVideoData.title || "Veja uma peca em movimento";
  }

  if (featuredVideoDescription) {
    featuredVideoDescription.textContent = featuredVideoData.description || "";
  }

  if (featuredVideoCta) {
    const videoMessage =
      (featuredVideoData.ctaMessage || "Ola! Quero uma box com uma vibe parecida com o video.") +
      " Tambem quero conhecer a Miu Box.";
    featuredVideoCta.href = buildWhatsAppUrl(videoMessage);
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
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
}

function getPlanDetails(planKey) {
  return PLANS[planKey] || PLANS.pro;
}

function getStyleDetails(styleKey) {
  return STYLES[styleKey] || STYLES.geek;
}

function updateSubscriptionSummary() {
  const plan = getPlanDetails(planSelect ? planSelect.value : "pro");
  const style = getStyleDetails(styleSelect ? styleSelect.value : "geek");

  if (summaryPlanName) {
    summaryPlanName.textContent = plan.name;
  }

  if (summaryPlanPrice) {
    summaryPlanPrice.textContent = plan.price;
  }

  if (summaryPlanDescription) {
    summaryPlanDescription.textContent = plan.summary;
  }

  if (summaryStyleName) {
    summaryStyleName.textContent = style.name;
  }

  if (summaryStyleDescription) {
    summaryStyleDescription.textContent = style.description;
  }

  if (summaryMonthlyCount) {
    summaryMonthlyCount.textContent = plan.monthly;
  }

  syncSubmissionHiddenFields();
}

function scrollToSignup() {
  const signupSection = document.getElementById("cadastro");

  if (signupSection) {
    signupSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setPlan(planKey, shouldScroll) {
  if (!planSelect || !PLANS[planKey]) {
    return;
  }

  planSelect.value = planKey;
  updateSubscriptionSummary();
  resetFormStatus();

  if (shouldScroll) {
    scrollToSignup();
  }
}

function setStyle(styleKey, shouldScroll) {
  if (!styleSelect || !STYLES[styleKey]) {
    return;
  }

  styleSelect.value = styleKey;
  updateSubscriptionSummary();
  resetFormStatus();

  if (shouldScroll) {
    scrollToSignup();
  }
}

function bindPlanButtons() {
  document.querySelectorAll("[data-plan-select]").forEach((button) => {
    button.addEventListener("click", () => {
      setPlan(button.getAttribute("data-plan-select"), true);
    });
  });
}

function bindStyleButtons() {
  document.querySelectorAll("[data-style-select]").forEach((button) => {
    button.addEventListener("click", () => {
      setStyle(button.getAttribute("data-style-select"), true);
    });
  });
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatZipCode(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return digits.slice(0, 5) + "-" + digits.slice(5);
}

function normalizeZipCode(value) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function setZipCodeStatus(message, status) {
  if (!zipCodeStatus) {
    return;
  }

  zipCodeStatus.textContent = message || "";
  zipCodeStatus.classList.remove("is-success", "is-error", "is-loading");

  if (status) {
    zipCodeStatus.classList.add("is-" + status);
  }
}

function setFormStatus(message, status) {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = message || "";
  formStatus.classList.remove("is-success", "is-error", "is-loading");

  if (status) {
    formStatus.classList.add("is-" + status);
  }
}

function resetFormStatus() {
  setFormStatus("", "");
}

function getSubmissionEndpoint() {
  return typeof MIU_BOX_CONFIG.formEndpoint === "string" ? MIU_BOX_CONFIG.formEndpoint.trim() : "";
}

function buildFullAddress() {
  const addressParts = [
    streetInput ? streetInput.value.trim() : "",
    numberInput && numberInput.value.trim() ? "Nº " + numberInput.value.trim() : "",
    complementInput && complementInput.value.trim() ? complementInput.value.trim() : "",
    districtInput ? districtInput.value.trim() : "",
    cityInput ? cityInput.value.trim() : "",
    stateInput ? stateInput.value.trim().toUpperCase() : "",
    zipCodeInput ? formatZipCode(zipCodeInput.value.trim()) : ""
  ];

  return addressParts.filter(Boolean).join(", ");
}

function buildSubmissionAddress() {
  const addressParts = [
    streetInput ? streetInput.value.trim() : "",
    numberInput && numberInput.value.trim() ? "Numero " + numberInput.value.trim() : "",
    complementInput && complementInput.value.trim() ? complementInput.value.trim() : "",
    districtInput ? districtInput.value.trim() : "",
    cityInput ? cityInput.value.trim() : "",
    stateInput ? stateInput.value.trim().toUpperCase() : "",
    zipCodeInput ? formatZipCode(zipCodeInput.value.trim()) : ""
  ];

  return addressParts.filter(Boolean).join(", ");
}

function syncSubmissionHiddenFields() {
  const plan = getPlanDetails(planSelect ? planSelect.value : "pro");
  const style = getStyleDetails(styleSelect ? styleSelect.value : "geek");

  if (planNameHidden) {
    planNameHidden.value = plan.name;
  }

  if (planPriceHidden) {
    planPriceHidden.value = plan.price;
  }

  if (styleNameHidden) {
    styleNameHidden.value = style.name;
  }

  if (styleDescriptionHidden) {
    styleDescriptionHidden.value = style.description;
  }

  if (fullAddressHidden) {
    fullAddressHidden.value = buildSubmissionAddress();
  }

  if (submittedAtHidden) {
    submittedAtHidden.value = new Date().toISOString();
  }
}

function setSubmittingState(isSubmitting) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enviando cadastro..." : "Enviar cadastro";
}

function populateAddressFieldsFromZipCode(data) {
  if (streetInput && data.logradouro) {
    streetInput.value = data.logradouro;
  }

  if (districtInput && data.bairro) {
    districtInput.value = data.bairro;
  }

  if (cityInput && data.localidade) {
    cityInput.value = data.localidade;
  }

  if (stateInput && data.uf) {
    stateInput.value = data.uf.toUpperCase();
  }

  if (complementInput && data.complemento && !complementInput.value.trim()) {
    complementInput.value = data.complemento;
  }
}

async function lookupZipCode(cep) {
  if (!cep || cep.length !== 8) {
    return;
  }

  const currentLookup = ++zipCodeLookupSequence;
  setZipCodeStatus("Buscando CEP...", "loading");

  try {
    const response = await fetch(VIA_CEP_BASE_URL + cep + "/json/");

    if (!response.ok) {
      throw new Error("Nao foi possivel consultar este CEP agora.");
    }

    const data = await response.json();

    if (currentLookup !== zipCodeLookupSequence) {
      return;
    }

    if (data.erro) {
      throw new Error("CEP nao encontrado. Confira os numeros e tente novamente.");
    }

    populateAddressFieldsFromZipCode(data);
    lastZipCodeLookup = cep;
    syncSubmissionHiddenFields();
    setZipCodeStatus("CEP encontrado. Revise os campos e complete o numero.", "success");
  } catch (error) {
    if (currentLookup !== zipCodeLookupSequence) {
      return;
    }

    lastZipCodeLookup = "";
    setZipCodeStatus(error.message || "Nao foi possivel consultar o CEP.", "error");
  }
}

function bindZipCodeLookup() {
  if (!zipCodeInput) {
    return;
  }

  zipCodeInput.addEventListener("input", () => {
    zipCodeInput.value = formatZipCode(zipCodeInput.value);

    const normalized = normalizeZipCode(zipCodeInput.value);

    if (normalized.length < 8) {
      lastZipCodeLookup = "";
      setZipCodeStatus("", "");
      return;
    }

    if (normalized !== lastZipCodeLookup) {
      lookupZipCode(normalized);
    }
  });

  zipCodeInput.addEventListener("blur", () => {
    const normalized = normalizeZipCode(zipCodeInput.value);

    if (normalized.length === 8 && normalized !== lastZipCodeLookup) {
      lookupZipCode(normalized);
    }
  });
}

function bindAddressFieldFormatting() {
  if (stateInput) {
    stateInput.addEventListener("input", () => {
      stateInput.value = stateInput.value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
      syncSubmissionHiddenFields();
    });
  }

  [
    streetInput,
    numberInput,
    complementInput,
    districtInput,
    cityInput,
    zipCodeInput
  ].forEach((field) => {
    if (!field) {
      return;
    }

    field.addEventListener("input", syncSubmissionHiddenFields);
    field.addEventListener("change", syncSubmissionHiddenFields);
  });
}

function resetAddressFieldsStatus() {
  lastZipCodeLookup = "";
  setZipCodeStatus("", "");
}

function handleTransportFrameLoad() {
  if (!awaitingTransportResponse) {
    return;
  }

  awaitingTransportResponse = false;
  window.clearTimeout(transportTimeoutId);
  setSubmittingState(false);
  subscriptionForm.reset();
  resetAddressFieldsStatus();
  updateSubscriptionSummary();
  syncSubmissionHiddenFields();
  setFormStatus(
    "Cadastro enviado com sucesso! O pedido foi enviado para a planilha e para o e-mail miulab3dim@gmail.com.",
    "success"
  );
}

function bindTransportFrame() {
  if (!transportFrame) {
    return;
  }

  transportFrame.addEventListener("load", handleTransportFrameLoad);
}

function bindSubscriptionForm() {
  if (!subscriptionForm) {
    return;
  }

  if (cpfInput) {
    cpfInput.addEventListener("input", () => {
      cpfInput.value = formatCpf(cpfInput.value);
    });
  }

  if (planSelect) {
    planSelect.addEventListener("change", updateSubscriptionSummary);
  }

  if (styleSelect) {
    styleSelect.addEventListener("change", updateSubscriptionSummary);
  }

  bindZipCodeLookup();
  bindAddressFieldFormatting();
  subscriptionForm.addEventListener("input", resetFormStatus);
  subscriptionForm.addEventListener("change", resetFormStatus);

  subscriptionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!subscriptionForm.reportValidity()) {
      return;
    }

    const endpoint = getSubmissionEndpoint();

    if (!endpoint) {
      setFormStatus(
        "Configure o endpoint em js/site-config.js para salvar os dados no Google Sheets e enviar por e-mail.",
        "error"
      );
      return;
    }

    syncSubmissionHiddenFields();
    setSubmittingState(true);
    setFormStatus("Enviando cadastro para a planilha e para o e-mail da equipe...", "loading");

    subscriptionForm.action = endpoint;
    subscriptionForm.method = "POST";
    subscriptionForm.target = transportFrame ? transportFrame.name : "";

    awaitingTransportResponse = true;
    window.clearTimeout(transportTimeoutId);
    transportTimeoutId = window.setTimeout(() => {
      if (!awaitingTransportResponse) {
        return;
      }

      awaitingTransportResponse = false;
      setSubmittingState(false);
      setFormStatus(
        "Nao conseguimos confirmar o envio agora. Verifique o endpoint configurado e tente novamente.",
        "error"
      );
    }, 18000);

    try {
      subscriptionForm.submit();
    } catch (error) {
      awaitingTransportResponse = false;
      window.clearTimeout(transportTimeoutId);
      setSubmittingState(false);
      setFormStatus("Nao foi possivel enviar o cadastro agora. Tente novamente.", "error");
    }
  });
}

function init() {
  syncStaticInfo();
  renderFilters();
  renderPortfolio();
  bindPortfolioActions();
  bindLightbox();
  applyFeaturedVideo();
  bindMenu();
  bindPlanButtons();
  bindStyleButtons();
  bindTransportFrame();
  bindSubscriptionForm();
  updateSubscriptionSummary();
  syncHeader();
}

window.addEventListener("scroll", syncHeader);
window.addEventListener("DOMContentLoaded", init);
