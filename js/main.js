// Shrink the banner after scrolling down a bit.
//    Two thresholds (40px / 8px) stop it flickering at the boundary.
const header = document.querySelector(".site-header");

if (header) {
  const updateHeader = () => {
    const y = window.scrollY;
    if (y > 40) header.classList.add("is-scrolled");
    else if (y < 8) header.classList.remove("is-scrolled");
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

// Keep the copyright year current.
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Placeholder signup forms (until the Kit mailing list is connected).
document.querySelectorAll("form[data-placeholder]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.closest(".signup")?.querySelector(".form-status");
    if (status) {
      status.textContent =
        "The mailing list is launching soon. Follow on Instagram in the meantime!";
    }
  });
});
