function cloneBrandGroup(baseGroup) {
  const clone = baseGroup.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
  return clone;
}

function updateBrandCarousel() {
  const track = document.querySelector("[data-brand-carousel-track]");
  const baseGroup = track?.querySelector("[data-brand-carousel-group]");
  if (!track || !baseGroup) return;

  const baseWidth = baseGroup.getBoundingClientRect().width;
  if (!baseWidth) return;

  const copies = Math.max(2, Math.ceil(window.innerWidth / baseWidth) + 2);
  while (track.children.length < copies) track.append(cloneBrandGroup(baseGroup));
  while (track.children.length > copies) track.lastElementChild.remove();
  track.style.setProperty("--brand-carousel-shift", `${baseWidth}px`);
}

function buildHoverPreview(videoId, title) {
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "0",
    disablekb: "1",
    end: "7",
    iv_load_policy: "3",
    loop: "1",
    modestbranding: "1",
    mute: "1",
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    start: "0",
  });

  return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?${params}" title="${title} preview" allow="autoplay; encrypted-media; picture-in-picture" aria-hidden="true" tabindex="-1"></iframe>`;
}

function initHoverPreviews() {
  const canPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canPreview) return;

  document.querySelectorAll("[data-video-preview-id]").forEach((card) => {
    const preview = card.querySelector(".showcase-band__preview");
    const videoId = card.dataset.videoPreviewId;
    const title = card.dataset.videoPreviewTitle;
    if (!preview || !videoId) return;

    card.addEventListener("pointerenter", () => {
      if (!preview.childElementCount) preview.innerHTML = buildHoverPreview(videoId, title || "Wedding film");
    });

    card.addEventListener("pointerleave", () => {
      window.setTimeout(() => {
        if (!card.matches(":hover")) preview.innerHTML = "";
      }, 350);
    });
  });
}

function init() {
  const refresh = () => window.requestAnimationFrame(updateBrandCarousel);
  refresh();
  initHoverPreviews();
  window.addEventListener("resize", refresh);
  document.fonts?.ready.then(refresh).catch(() => {});
}

init();
