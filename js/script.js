// ========= CONFIG WHATSAPP =========
const WHATSAPP_NUMBER = "+5532998406067";

const track = document.getElementById("carouselTrack");
const dotsWrap = document.getElementById("carouselDots");

// ========= DOTS =========
function getStep() {
  const firstCard = track.querySelector(".product-card");
  if (!firstCard) return 0;
  const gap = 28;
  return firstCard.offsetWidth + gap;
}

function getTotalPages() {
  const step = getStep();
  if (!step) return 0;

  const total = Math.round(track.scrollWidth / step);
  const visible = Math.round(track.clientWidth / step);

  return Math.max(1, total - visible + 1);
}

function getActivePage() {
  const step = getStep();
  if (!step) return 0;

  const index = Math.round(track.scrollLeft / step);
  return Math.max(0, Math.min(index, getTotalPages() - 1));
}

function renderDots() {
  dotsWrap.innerHTML = "";
  const pages = getTotalPages();

  for (let i = 0; i < pages; i++) {
    const dot = document.createElement("button");

    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * getStep(), behavior: "smooth" });
    });

    dotsWrap.appendChild(dot);
  }

  updateDots();
}

function updateDots() {
  const active = getActivePage();
  const dots = dotsWrap.querySelectorAll("button");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === active));
}

track.addEventListener("scroll", () => requestAnimationFrame(updateDots));
window.addEventListener("resize", renderDots);

renderDots();


// ✅ ========= WHATSAPP (FORA DO IF) =========
document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    if (!card) return;

    const name = card.dataset.name || "Produto";
    const price = card.dataset.price || "";

    const message = `Olá! Eu quero solicitar: ${name} ${price ? "(" + price + ")" : ""}. Poderia me passar mais informações sobre entrega, cores e disponibilidades?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // ✅ melhor compatibilidade mobile:
    window.location.href = url;
  });
});

// ✅ ========= DRAG SOMENTE NO PC =========
if (window.innerWidth >= 950) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = "grabbing";
  });

  track.addEventListener("mouseleave", () => {
    isDown = false;
    track.style.cursor = "grab";
  });

  track.addEventListener("mouseup", () => {
    isDown = false;
    track.style.cursor = "grab";
  });

  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
}

