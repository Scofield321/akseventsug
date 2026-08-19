/* =========================================
   AKS EVENTS
   MOMENTS PAGE
========================================= */

let allMoments = [];

let visibleMoments = [];

let currentMomentIndex = 0;

/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();

  setCurrentYear();

  initializeLightbox();

  loadMoments();
});

/* =========================================
   MOBILE NAVIGATION
========================================= */

const initializeNavigation = () => {
  const button = document.getElementById("mobileMenuButton");

  const menu = document.getElementById("mobileNav");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });
};

/* =========================================
   LOAD MOMENTS
========================================= */

const loadMoments = async () => {
  const gallery = document.getElementById("momentsGallery");

  if (!gallery) {
    return;
  }

  try {
    gallery.innerHTML = `

      <div class="moments-loading">

        <div class="loading-spinner"></div>

        <p>
          Loading moments...
        </p>

      </div>

    `;

    /*
     * Get all events.
     */

    const events = await window.api.getEvents();

    /*
     * Only published events
     * should appear publicly.
     */

    const publishedEvents = events.filter(
      (event) => event.status === "published",
    );

    if (!publishedEvents.length) {
      showEmptyMoments();

      return;
    }

    /*
     * Load media for every
     * published event.
     */

    const eventMediaResults = await Promise.all(
      publishedEvents.map(async (event) => {
        try {
          const media = await window.api.getEventMedia(event.id);

          return {
            event,
            media: Array.isArray(media) ? media : media?.media || [],
          };
        } catch (error) {
          console.error(`Failed to load media for event ${event.id}:`, error);

          return {
            event,

            media: [],
          };
        }
      }),
    );

    /*
     * Convert event/media
     * structure into a flat
     * moments array.
     */

    allMoments = eventMediaResults.flatMap(({ event, media }) =>
      media.map((item) => ({
        ...item,

        eventId: event.id,

        eventTitle: event.title,

        eventDate: event.event_date,
      })),
    );

    /*
     * Sort media according
     * to their database order.
     */

    allMoments.sort((a, b) => {
      const eventDateA = new Date(a.eventDate).getTime();

      const eventDateB = new Date(b.eventDate).getTime();

      if (eventDateA !== eventDateB) {
        return eventDateB - eventDateA;
      }

      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });

    updateMomentsStats(publishedEvents, allMoments);

    createFilters(publishedEvents, allMoments);

    visibleMoments = [...allMoments];

    renderMoments(visibleMoments);
  } catch (error) {
    console.error("Failed to load moments:", error);

    gallery.innerHTML = `

      <div class="moments-empty">

        <strong>
          Unable to load moments.
        </strong>

        <p>
          Something went wrong while
          loading our experiences.
          Please try again.
        </p>

        <button
          class="button button-outline"
          onclick="loadMoments()"
          style="margin-top:20px;"
        >
          Try Again
        </button>

      </div>

    `;
  }
};

/* =========================================
   CREATE FILTERS
========================================= */

const createFilters = (events, moments) => {
  const filters = document.getElementById("momentsFilters");

  if (!filters) {
    return;
  }

  const eventsWithMedia = events.filter((event) =>
    moments.some((moment) => String(moment.eventId) === String(event.id)),
  );

  filters.innerHTML = `

    <button
      class="moments-filter active"
      data-filter="all"
    >
      All Moments
    </button>

    ${eventsWithMedia
      .map(
        (event) => `

            <button
              class="moments-filter"
              data-filter="${escapeHtml(String(event.id))}"
            >
              ${escapeHtml(event.title)}
            </button>

          `,
      )
      .join("")}

  `;

  filters.querySelectorAll(".moments-filter").forEach((button) => {
    button.addEventListener("click", () => {
      filters
        .querySelectorAll(".moments-filter")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");

      const filter = button.dataset.filter;

      if (filter === "all") {
        visibleMoments = [...allMoments];
      } else {
        visibleMoments = allMoments.filter(
          (moment) => String(moment.eventId) === String(filter),
        );
      }

      renderMoments(visibleMoments);
    });
  });
};

/* =========================================
   RENDER MOMENTS
========================================= */

const renderMoments = (moments) => {
  const gallery = document.getElementById("momentsGallery");

  if (!gallery) {
    return;
  }

  if (!moments.length) {
    showEmptyMoments();

    return;
  }

  gallery.innerHTML = moments
    .map((moment, index) => createMomentCard(moment, index))
    .join("");

  /*
   * Add click handlers.
   */

  gallery.querySelectorAll(".moment-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      openLightbox(index);
    });
  });
};

/* =========================================
   CREATE MOMENT CARD
========================================= */

const createMomentCard = (moment, index) => {
  const isVideo = String(moment.media_type).toLowerCase() === "video";

  const mediaUrl = escapeHtml(moment.media_url);

  /*
   * Make approximately every
   * fifth moment large.
   */

  const isLarge = index === 0 || index % 7 === 0;

  return `

    <article
      class="
        moment-card
        ${isLarge ? "moment-card-large" : ""}
      "
      data-index="${index}"
    >

      ${
        isVideo
          ? `

            <video
              src="${mediaUrl}"
              muted
              playsinline
              preload="metadata"
              poster=""
            ></video>

            <div class="moment-play">
              ▶
            </div>

          `
          : `

            <img
              src="${mediaUrl}"
              alt="${escapeHtml(moment.eventTitle)}"
              loading="lazy"
            >

          `
      }


      <div
        class="moment-gradient"
      ></div>


      <div
        class="moment-number"
      >
        ${String(index + 1).padStart(2, "0")}
      </div>


      <div
        class="moment-event-name"
      >
        ${escapeHtml(moment.eventTitle)}
      </div>


      <div
        class="moment-type"
      >
        ${isVideo ? "VIDEO" : "PHOTO"}
      </div>

    </article>

  `;
};

/* =========================================
   EMPTY STATE
========================================= */

const showEmptyMoments = () => {
  const gallery = document.getElementById("momentsGallery");

  if (!gallery) {
    return;
  }

  gallery.innerHTML = `

    <div class="moments-empty">

      <strong>
        Moments are coming.
      </strong>

      <p>
        We're preparing our gallery
        of experiences and memories.
        Check back soon.
      </p>

    </div>

  `;
};

/* =========================================
   UPDATE MOMENTS STATS
========================================= */

const updateMomentsStats = (events, moments) => {
  const eventCount = document.getElementById("momentsEventCount");
  const mediaCount = document.getElementById("momentsMediaCount");
  if (eventCount) {
    eventCount.textContent = events.length;
  }
  if (mediaCount) {
    mediaCount.textContent = moments.length;
  }
};

/* =========================================
   LIGHTBOX
========================================= */

const initializeLightbox = () => {
  const close = document.getElementById("momentsLightboxClose");

  const prev = document.getElementById("momentsLightboxPrev");

  const next = document.getElementById("momentsLightboxNext");

  close?.addEventListener("click", closeLightbox);

  prev?.addEventListener("click", showPreviousMoment);

  next?.addEventListener("click", showNextMoment);

  document
    .getElementById("momentsLightbox")
    ?.addEventListener("click", (event) => {
      if (event.target.id === "momentsLightbox") {
        closeLightbox();
      }
    });

  document.addEventListener("keydown", (event) => {
    const lightbox = document.getElementById("momentsLightbox");

    if (!lightbox?.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showPreviousMoment();
    }

    if (event.key === "ArrowRight") {
      showNextMoment();
    }
  });
};

/* =========================================
   OPEN LIGHTBOX
========================================= */

const openLightbox = (index) => {
  if (!visibleMoments.length) {
    return;
  }

  currentMomentIndex = index;

  const lightbox = document.getElementById("momentsLightbox");

  lightbox.classList.add("open");

  lightbox.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  renderLightboxMoment();
};

/* =========================================
   RENDER LIGHTBOX MEDIA
========================================= */

const renderLightboxMoment = () => {
  const moment = visibleMoments[currentMomentIndex];

  if (!moment) {
    return;
  }

  const content = document.getElementById("momentsLightboxContent");

  const counter = document.getElementById("momentsLightboxCounter");

  const eventName = document.getElementById("momentsLightboxEvent");

  const isVideo = String(moment.media_type).toLowerCase() === "video";

  const url = escapeHtml(moment.media_url);

  if (isVideo) {
    content.innerHTML = `

      <video
        src="${url}"
        controls
        autoplay
        playsinline
        preload="metadata"
      ></video>

    `;
  } else {
    content.innerHTML = `

      <img
        src="${url}"
        alt="${escapeHtml(moment.eventTitle)}"
      >

    `;
  }

  counter.textContent = `

    ${currentMomentIndex + 1}
    /
    ${visibleMoments.length}

  `;

  eventName.textContent = moment.eventTitle || "";
};

/* =========================================
   NEXT
========================================= */

const showNextMoment = () => {
  if (!visibleMoments.length) {
    return;
  }

  currentMomentIndex = (currentMomentIndex + 1) % visibleMoments.length;

  renderLightboxMoment();
};

/* =========================================
   PREVIOUS
========================================= */

const showPreviousMoment = () => {
  if (!visibleMoments.length) {
    return;
  }

  currentMomentIndex =
    (currentMomentIndex - 1 + visibleMoments.length) % visibleMoments.length;

  renderLightboxMoment();
};

/* =========================================
   CLOSE
========================================= */

const closeLightbox = () => {
  const lightbox = document.getElementById("momentsLightbox");

  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("open");

  lightbox.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  const content = document.getElementById("momentsLightboxContent");

  if (content) {
    content.innerHTML = "";
  }
};

/* =========================================
   CURRENT YEAR
========================================= */

const setCurrentYear = () => {
  const element = document.getElementById("currentYear");

  if (element) {
    element.textContent = new Date().getFullYear();
  }
};

/* =========================================
   ESCAPE HTML
========================================= */

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
};
