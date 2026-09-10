// ========== Testimonials carousel ==========
(function () {
  const track = document.getElementById("testimonials");
  const prev = document.getElementById("tPrev");
  const next = document.getElementById("tNext");
  if (!track || !prev || !next) return;

  const scrollByCard = (dir) => {
    const card = track.querySelector(".testimonial");
    if (!card) return;
    const gap = 24;
    track.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
})();

// ========== Smooth scroll for anchor links ==========
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ========== Active nav link on scroll ==========
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__link");
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  let current = "";
  sections.forEach((sec) => {
    if (y >= sec.offsetTop) current = sec.id;
  });
  navLinks.forEach((l) => {
    l.classList.toggle(
      "nav__link--active",
      l.getAttribute("href") === "#" + current
    );
  });
});
