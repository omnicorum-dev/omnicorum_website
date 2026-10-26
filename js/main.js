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
function setupVideo(box) {
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
}

document.querySelectorAll(".video[data-youtube]").forEach(setupVideo);

// Latest YouTube uploads grid (Socials page).
//    Asks /api/latest-videos (functions/api/latest-videos.js on Cloudflare) for the newest videos.
//    If that isn't available — e.g. testing locally — it shows the uploads playlist player instead.
const latestGrid = document.querySelector("[data-latest-videos]");

if (latestGrid) {
  const showPlaylistPlayer = () => {
    const box = document.createElement("div");
    box.className = "video";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${latestGrid.dataset.playlist}&rel=0`;
    iframe.title = "Latest uploads on YouTube";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    box.append(iframe);
    latestGrid.replaceWith(box);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  fetch("/api/latest-videos")
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(({ videos }) => {
      if (!videos || videos.length === 0) throw new Error("No videos returned");

      const items = videos.map((video) => {
        const item = document.createElement("li");
        item.className = "video-item";

        const box = document.createElement("div");
        box.className = "video";
        box.dataset.youtube = video.id;
        box.dataset.title = video.title;

        const title = document.createElement("h3");
        title.className = "video-title";
        title.textContent = video.title;

        const date = document.createElement("p");
        date.className = "video-date";
        date.textContent = video.published ? formatDate(video.published) : "";

        item.append(box, title, date);
        setupVideo(box);
        return item;
      });

      latestGrid.replaceChildren(...items);
      latestGrid.removeAttribute("aria-busy");
    })
    .catch(showPlaylistPlayer);
}

// Copy buttons (Press page bios).
//    Markup: <button data-copy="#element-id">Copy</button>
document.querySelectorAll("[data-copy]").forEach((button) => {
  const label = button.textContent;
  button.addEventListener("click", async () => {
    const source = document.querySelector(button.dataset.copy);
    if (!source) return;
    const text = [...source.querySelectorAll("p")]
      .map((p) => p.textContent.replace(/\s+/g, " ").trim())
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Couldn't copy";
    }
    setTimeout(() => { button.textContent = label; }, 2000);
  });
});
