const contactEmail = "info@jude.house";

const projects = [
  {
    sectionId: "work",
    id: "QRu_TqZyhFk",
    image: "img/image 56.png",
    title: "The Wedding of Canaan + Courtney",
    displayTitle: "The Wedding of Canaan + Courtney",
    year: "2025",
    bandClass: "showcase-band--lead",
    crop: "58% 40%",
  },
  {
    sectionId: "photo",
    id: "-IIa-HQDqhk",
    image: "img/Screenshot 2026-04-14 at 4.42.29 PM 1.png",
    title: "The Wedding of Brandon + Desyre",
    displayTitle: "The Wedding of Brandon + Desyre",
    year: "2024",
    bandClass: "showcase-band--photo",
    crop: "50% 50%",
  },
  {
    sectionId: "design",
    id: "2oJWRKuR9xE",
    image: "img/image 57.png",
    title: "The Dirt Turkey",
    displayTitle: "The Dirt Turkey",
    year: "2025",
    bandClass: "showcase-band--design",
    crop: "50% 28%",
  },
  {
    sectionId: "sermon",
    id: "OivdIXQXF9Y",
    image: "img/psalm-23-thumbnail.png",
    title: "Psalm 23",
    displayTitle: "Psalm 23",
    year: "2026",
    bandClass: "showcase-band--design",
    crop: "50% 50%",
  },
];

const featuredBrands = [
  {
    name: "Chick-fil-A",
    href: "https://www.chick-fil-a.com/",
  },
  {
    name: "Crossnet",
    href: "https://www.crossnetgame.com/",
  },
  {
    name: "Cornerstone Church Athens",
    href: "https://www.cornerstoneathens.cc/",
  },
  {
    name: "Kelp Creative Agency",
    href: "https://www.kelp.agency/",
  },
  {
    name: "Community Bible Church",
    href: "https://cbible.org/",
  },
  {
    name: "Caleb Hearn",
    href: "https://store.calebhearnmusic.com/",
  },
  {
    name: "Chay Nott",
    href: "https://www.chaynott.com/",
  },
  {
    name: "E3 Family Solutions",
    href: "https://e3familysolutions.org/",
  },
  {
    name: "Lowman Law Firm",
    href: "https://www.lowmanlawfirm.com/",
  },
  {
    name: "HiVis Supply",
    href: "https://www.hivissupply.com/",
  },
  {
    name: "Coaste Coffee",
    href: "https://coastecoffee.com/",
  },
  {
    name: "Sermon Notes",
    href: "https://sermonotes.com/",
  },
  {
    name: "Your Mom",
    href: "your-mom.html",
    newTab: false,
  },
];

const bandsRoot = document.getElementById("showcase-bands");
const modal = document.getElementById("video-modal");
const modalStage = document.getElementById("video-modal-stage");
const hoverPreviewEnabled =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastTrigger = null;

function buildPreviewIframe(project) {
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "0",
    disablekb: "1",
    end: "7",
    iv_load_policy: "3",
    loop: "1",
    modestbranding: "1",
    mute: "1",
    playlist: project.id,
    playsinline: "1",
    rel: "0",
    start: "0",
  });

  return `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${project.id}?${params.toString()}"
      title="${project.title} preview"
      allow="autoplay; encrypted-media; picture-in-picture"
      aria-hidden="true"
      tabindex="-1"
    ></iframe>
  `;
}

function buildWorkBand(project, index) {
  const sectionId = project.sectionId || `project-${index}`;
  const titleClass = index === 0 ? "showcase-band__lead-title" : "showcase-band__title";
  const yearClass = index === 0 ? "showcase-band__lead-year" : "showcase-band__year";

  return `
    <div
      class="showcase-band ${project.bandClass}"
      id="${sectionId}"
      data-project-index="${index}"
      aria-label="Open ${project.title} video"
      tabindex="0"
      role="button"
    >
      <img
        class="showcase-band__image"
        src="${encodeURI(project.image)}"
        alt="${project.displayTitle} still"
        loading="${index === 0 ? "eager" : "lazy"}"
        decoding="async"
        style="object-position: ${project.crop};"
      />
      <span class="showcase-band__preview" aria-hidden="true">
        ${hoverPreviewEnabled ? buildPreviewIframe(project) : ""}
      </span>
      <span class="showcase-band__scrim" aria-hidden="true"></span>
      ${
        index === 0
          ? `
          <div class="showcase-band__lead-strip" aria-hidden="true">
            <span class="${titleClass}">${project.displayTitle}</span>
            <span class="${yearClass}">/ ${project.year}</span>
          </div>
        `
        : `
          <span class="${titleClass}">${project.displayTitle}</span>
          <span class="${yearClass}">/ ${project.year}</span>
        `
    }
    </div>
  `;
}

function buildContactBand() {
  return `
    <section class="contact-band" id="contact" aria-label="Contact">
      <img
        class="contact-band__image"
        src="${encodeURI("img/Screenshot 2026-04-14 at 4.44.05 PM 1.png")}"
        alt="Backlit silhouette at night"
        loading="lazy"
        decoding="async"
      />
      <span class="contact-band__scrim" aria-hidden="true"></span>
      <div class="contact-band__content">
        <span class="contact-band__eyebrow">Contact</span>
        <h2 class="contact-band__title">If it fits,<br />let's make it.</h2>
        <a
          class="contact-band__email"
          data-contact-email
          href="mailto:${contactEmail}?subject=Project%20Inquiry"
        >
          ${contactEmail}
        </a>
      </div>
    </section>
  `;
}

function buildBrandCarouselItems({ clone = false } = {}) {
  return featuredBrands
    .map(
      (brand) => `
        <a
          class="brand-carousel__item"
          href="${brand.href}"
          ${brand.newTab === false ? "" : 'target="_blank" rel="noreferrer"'}
          ${clone ? 'tabindex="-1" aria-hidden="true"' : ""}
        >
          ${brand.name}
        </a>
      `,
    )
    .join("");
}

function buildBrandCarouselGroup({ clone = false } = {}) {
  return `
    <div
      class="brand-carousel__group${clone ? " brand-carousel__group--clone" : ""}"
      data-brand-carousel-group
      ${clone ? 'aria-hidden="true"' : ""}
    >
      ${buildBrandCarouselItems({ clone })}
    </div>
  `;
}

function buildBrandCarousel(groupCount = 2) {
  const groups = Array.from({ length: groupCount }, (_, index) =>
    buildBrandCarouselGroup({ clone: index > 0 }),
  ).join("");

  return `
    <section class="brand-carousel" aria-label="Brands I've worked with" data-brand-carousel>
      <div class="brand-carousel__track" data-brand-carousel-track>
        ${groups}
      </div>
    </section>
  `;
}

function updateBrandCarousel() {
  const carousel = document.querySelector("[data-brand-carousel]");
  const track = carousel?.querySelector("[data-brand-carousel-track]");
  const baseGroup = track?.querySelector("[data-brand-carousel-group]");

  if (!track || !baseGroup) {
    return;
  }

  const baseWidth = baseGroup.getBoundingClientRect().width;
  if (!baseWidth) {
    return;
  }

  const requiredCopies = Math.max(2, Math.ceil(window.innerWidth / baseWidth) + 2);
  if (track.children.length !== requiredCopies) {
    track.innerHTML = Array.from({ length: requiredCopies }, (_, index) =>
      buildBrandCarouselGroup({ clone: index > 0 }),
    ).join("");
  }

  track.style.setProperty("--brand-carousel-shift", `${baseWidth}px`);
}

function buildVideoEmbedSrc(project) {
  const isMobilePlayback =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 700px)").matches;

  const params = new URLSearchParams({
    autoplay: "1",
    controls: isMobilePlayback ? "0" : "1",
    disablekb: "1",
    fs: isMobilePlayback ? "0" : "1",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    start: "0",
    ...(isMobilePlayback ? { mute: "1" } : {}),
  });

  return `https://www.youtube-nocookie.com/embed/${project.id}?${params.toString()}`;
}

function renderShowcase() {
  bandsRoot.innerHTML = [...projects.map(buildWorkBand), buildBrandCarousel(), buildContactBand()].join("");
}

function openVideo(index) {
  const project = projects[index];

  if (!project) {
    return;
  }

  modalStage.innerHTML = `
    <iframe
      src="${buildVideoEmbedSrc(project)}"
      title="${project.title}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const isMobilePlayback =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 700px)").matches;
  if (isMobilePlayback && screen.orientation?.lock) {
    screen.orientation.lock("landscape").catch(() => {});
  }

  const closeButton = modal.querySelector(".video-modal__close");
  if (closeButton) {
    closeButton.focus();
  }
}

function closeVideo() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalStage.innerHTML = "";
  document.body.style.overflow = "";

  if (screen.orientation?.unlock) {
    screen.orientation.unlock();
  }

  if (lastTrigger) {
    lastTrigger.focus();
    lastTrigger = null;
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-project-index]");
    const closeButton = event.target.closest("[data-close]");

    if (openButton && !closeButton) {
      lastTrigger = openButton;
      openVideo(Number(openButton.dataset.projectIndex));
    }

    if (closeButton) {
      closeVideo();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeVideo();
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const activeBand = event.target.closest("[data-project-index]");
    if (!activeBand) {
      return;
    }

    event.preventDefault();
    lastTrigger = activeBand;
    openVideo(Number(activeBand.dataset.projectIndex));
  });
}

function init() {
  renderShowcase();
  bindEvents();

  const contactLink = document.querySelector("[data-contact-email]");
  if (contactLink) {
    contactLink.setAttribute("aria-label", `Email ${contactEmail} to start a project`);
  }

  const refreshCarousel = () => {
    window.requestAnimationFrame(updateBrandCarousel);
  };

  refreshCarousel();
  window.addEventListener("resize", refreshCarousel);

  if (document.fonts?.ready) {
    document.fonts.ready.then(refreshCarousel).catch(() => {});
  }
}

init();
