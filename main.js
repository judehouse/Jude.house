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

function init() {
  const refresh = () => window.requestAnimationFrame(updateBrandCarousel);
  refresh();
  window.addEventListener("resize", refresh);
  document.fonts?.ready.then(refresh).catch(() => {});
}

init();
