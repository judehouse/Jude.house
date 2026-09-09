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
    enablejsapi: "1",
    end: "7",
    iv_load_policy: "3",
    loop: "1",
    modestbranding: "1",
    mute: "1",
    origin: window.location.origin,
    playlist: videoId,
    playsinline: "1",
    rel: "0",
    start: "0",
  });

  return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}" title="${title} preview" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="origin" aria-hidden="true" tabindex="-1"></iframe>`;
}

function initHoverPreviews() {
  const canPreview = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canPreview) return;

  const players = [];

  document.querySelectorAll("[data-video-preview-id]").forEach((card) => {
    const preview = card.querySelector(".showcase-band__preview");
    const videoId = card.dataset.videoPreviewId;
    const title = card.dataset.videoPreviewTitle;
    if (!preview || !videoId) return;

    preview.innerHTML = buildHoverPreview(videoId, title || "Wedding film");
    const frame = preview.querySelector("iframe");
    if (frame) players.push({ frame, preview });
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== "https://www.youtube.com" && event.origin !== "https://www.youtube-nocookie.com") return;
    let message;
    try {
      message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (message?.event !== "onReady" && message?.event !== "onStateChange") return;
    const player = players.find(({ frame }) => frame.contentWindow === event.source);
    if (!player) return;

    player.preview.classList.add("is-ready");
    player.frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), event.origin);
  });
}

const modal = document.querySelector("#video-modal");
const modalStage = document.querySelector("#video-modal-stage");
let lastTrigger = null;

function openVideo(card) {
  const videoId = card.dataset.videoPreviewId;
  const title = card.dataset.videoPreviewTitle || "Wedding film";
  if (!videoId || !modal || !modalStage) return;

  const isMobile = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 700px)").matches;
  const params = new URLSearchParams({ autoplay: "1", controls: isMobile ? "0" : "1", disablekb: "1", fs: isMobile ? "0" : "1", modestbranding: "1", playsinline: "1", rel: "0", start: "0" });
  modalStage.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="origin" allowfullscreen></iframe>`;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".video-modal__close")?.focus();
}

function closeVideo() {
  if (!modal || !modalStage) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalStage.innerHTML = "";
  document.body.style.overflow = "";
  lastTrigger?.focus();
  lastTrigger = null;
}

function initVideoLightbox() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-video]")) {
      closeVideo();
      return;
    }
    const card = event.target.closest("[data-video-preview-id]");
    if (!card) return;
    event.preventDefault();
    lastTrigger = card;
    openVideo(card);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeVideo();
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-video-preview-id]");
    if (!card) return;
    event.preventDefault();
    lastTrigger = card;
    openVideo(card);
  });
}

function init() {
  const refresh = () => window.requestAnimationFrame(updateBrandCarousel);
  refresh();
  initHoverPreviews();
  initVideoLightbox();
  window.addEventListener("resize", refresh);
  document.fonts?.ready.then(refresh).catch(() => {});
}

init();
