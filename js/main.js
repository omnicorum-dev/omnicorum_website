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

// Click-to-load YouTube videos.
//    Markup: <div class="video" data-youtube="VIDEO_ID" data-title="Video title"></div>
//    Shows a thumbnail + play button; the real player only loads on click.
document.querySelectorAll(".video[data-youtube]").forEach((box) => {
  const id = box.dataset.youtube;
  const title = box.dataset.title || "YouTube video";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "video-play";
  button.setAttribute("aria-label", `Play video: ${title}`);

  // Try the high-res thumbnail; fall back to the standard one if the video doesn't have it.
  const thumb = document.createElement("img");
  thumb.alt = "";
  thumb.loading = "lazy";
  const useFallbackThumb = () => {
    thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  };
  thumb.addEventListener("error", useFallbackThumb, { once: true });
  thumb.addEventListener("load", () => {
    if (thumb.naturalWidth <= 120) useFallbackThumb(); // YouTube's "no thumbnail" placeholder
  });
  thumb.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  const icon = document.createElement("span");
  icon.className = "video-play-icon";
  icon.setAttribute("aria-hidden", "true");

  button.append(thumb, icon);

  button.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    box.replaceChildren(iframe);
  });

  box.replaceChildren(button);
});
