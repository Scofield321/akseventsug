/* =========================================
   SOUND EVENTS
   EVENT DETAIL PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeNavigation();

  setCurrentYear();

  loadEvent();

});


/* =========================================
   MOBILE NAVIGATION
========================================= */

const initializeNavigation = () => {

  const button =
    document.getElementById("mobileMenuButton");

  const menu =
    document.getElementById("mobileNav");

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
   LOAD EVENT
========================================= */

const loadEvent = async () => {

  const page =
    document.getElementById("eventPage");

  if (!page) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const eventId =
    params.get("id");

  if (!eventId) {

    showEventError(
      page,
      "Event not found",
      "We couldn't find the event you're looking for."
    );

    return;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/events/${encodeURIComponent(eventId)}`
      );

    const event =
      await response.json();

    if (!response.ok) {

      throw new Error(
        event.message ||
        "Failed to load event"
      );

    }

    if (event.status !== "published") {

      showEventError(
        page,
        "Event unavailable",
        "This experience is not currently available."
      );

      return;
    }

    renderEvent(page, event);

    document.title =
      `${event.title} — Sound Events`;

  } catch (error) {

    console.error(
      "Failed to load event:",
      error
    );

    showEventError(
      page,
      "Something went wrong",
      "We couldn't load this experience right now."
    );

  }

};


/* =========================================
   RENDER EVENT
========================================= */

const renderEvent = (
  container,
  event
) => {

  const formattedDate =
    formatEventDate(
      event.event_date
    );


  /*
   * ========================================
   * MEDIA
   * ========================================
   *
   * event.media comes from:
   *
   * GET /api/events/:id
   *
   */

  const media =
    Array.isArray(event.media)
      ? event.media
      : [];


  const images =
    media.filter(
      item =>
        item.media_type === "image"
    );


  const videos =
    media.filter(
      item =>
        item.media_type === "video"
    );


  /*
   * ========================================
   * FALLBACK MAIN IMAGE
   * ========================================
   */

  const heroImage =
    event.image_url ||
    (
      images.length
        ? images[0].media_url
        : ""
    );


  /*
   * ========================================
   * MEDIA GALLERY
   * ========================================
   */

  const mediaGallery =
    createMediaGallery(media);


  container.innerHTML = `

    <!-- =====================================
         HERO
    ====================================== -->

    <section class="event-detail-hero">

      ${
        heroImage
          ? `
            <img
              class="event-detail-background-image"
              src="${escapeHtml(heroImage)}"
              alt=""
              aria-hidden="true"
            >
          `
          : ""
      }


      <div class="event-detail-background"></div>

      <div class="event-detail-overlay"></div>


      <div class="container event-detail-content">

        <div class="event-detail-label">
          Sound Events Experience
        </div>


        <h1 class="event-detail-title">
          ${escapeHtml(event.title)}
        </h1>


        <div class="event-detail-meta">

          <div class="event-meta-item">

            <span class="event-meta-icon">
              ◷
            </span>

            ${escapeHtml(formattedDate)}

          </div>


          ${
            event.location
              ? `
                <div class="event-meta-item">

                  <span class="event-meta-icon">
                    ●
                  </span>

                  ${escapeHtml(event.location)}

                </div>
              `
              : ""
          }

        </div>

      </div>

    </section>



    <!-- =====================================
         EVENT CONTENT
    ====================================== -->

    <section class="event-detail-section">

      <div class="container">

        <div class="event-detail-grid">


          <!-- =================================
               MAIN CONTENT
          ================================== -->

          <div class="event-detail-main">


            ${
              event.description
                ? `

                  <div class="event-description-block">

                    <h2>
                      About the experience
                    </h2>

                    <div
                      class="event-detail-description"
                    >
                      ${escapeHtml(event.description)}
                    </div>

                  </div>

                `
                : ""
            }


            ${
              media.length
                ? `

                  <section class="event-media-section">

                    <div class="event-media-heading">

                      <span>
                        The experience
                      </span>

                      <h2>
                        Moments.
                      </h2>

                      <p>
                        A look inside the experience.
                      </p>

                    </div>


                    ${mediaGallery}

                  </section>

                `
                : ""
            }


          </div>



          <!-- =================================
               SIDEBAR
          ================================== -->

          <aside class="event-detail-sidebar">

            <div class="sidebar-item">

              <div class="sidebar-label">
                Date
              </div>

              <div class="sidebar-value">
                ${escapeHtml(formattedDate)}
              </div>

            </div>


            ${
              event.location
                ? `

                  <div class="sidebar-item">

                    <div class="sidebar-label">
                      Location
                    </div>

                    <div class="sidebar-value">
                      ${escapeHtml(event.location)}
                    </div>

                  </div>

                `
                : ""
            }


            ${
              media.length
                ? `

                  <div class="sidebar-item">

                    <div class="sidebar-label">
                      Media
                    </div>

                    <div class="sidebar-value">

                      ${media.length}
                      ${media.length === 1 ? "moment" : "moments"}

                    </div>

                  </div>

                `
                : ""
            }


            <div class="sidebar-item">

              <div class="sidebar-label">
                Experience
              </div>

              <div class="sidebar-value">
                Sound Events
              </div>

            </div>


            <a
              href="events.html"
              class="button button-primary sidebar-button"
            >

              View All Events

              <span>
                →
              </span>

            </a>

          </aside>


        </div>

      </div>

    </section>



    <!-- =====================================
         BOTTOM CTA
    ====================================== -->

    <section class="cta-section">

      <div class="cta-glow"></div>

      <div class="container cta-content">

        <span class="section-label">
          DISCOVER MORE
        </span>

        <h2>
          Find your
          <span>next experience.</span>
        </h2>

        <p>
          There is always another moment waiting
          to be experienced.
        </p>

        <a
          href="events.html"
          class="button button-light"
        >

          Explore Events

          <span>
            →
          </span>

        </a>

      </div>

    </section>

  `;

};


/* =========================================
   CREATE MEDIA GALLERY
========================================= */

const createMediaGallery = (media) => {

  if (!media.length) {
    return "";
  }


  return `

    <div class="event-media-gallery">

      ${media
        .map(
          (item, index) =>
            createMediaCard(
              item,
              index,
              media.length
            )
        )
        .join("")}

    </div>

  `;

};


/* =========================================
   CREATE MEDIA CARD
========================================= */

const createMediaCard = (
  item,
  index,
  total
) => {

  const isVideo =
    item.media_type === "video";


  const mediaUrl =
    escapeHtml(
      item.media_url
    );


  /*
   * Make the first item larger.
   *
   * This gives the gallery
   * an editorial / magazine feel.
   */

  const sizeClass =
    index === 0
      ? "media-card-large"
      : "media-card-small";


  if (isVideo) {

    return `

      <article
        class="
          event-media-card
          ${sizeClass}
          event-media-video
        "
      >

        <video
          class="event-media-video-element"
          muted
          playsinline
          preload="metadata"
        >

          <source
            src="${mediaUrl}"
            type="video/mp4"
          >

        </video>


        <div class="event-media-gradient"></div>


        <div class="event-media-video-icon">
          ▶
        </div>


        <div class="event-media-label">
          VIDEO
        </div>


        <div class="event-media-number">
          ${String(index + 1).padStart(2, "0")}
        </div>

      </article>

    `;

  }


  return `

    <article
      class="
        event-media-card
        ${sizeClass}
        event-media-image
      "
    >

      <img
        src="${mediaUrl}"
        alt="${escapeHtml(`Event moment ${index + 1}`)}"
        loading="lazy"
      >


      <div class="event-media-gradient"></div>


      <div class="event-media-label">
        PHOTO
      </div>


      <div class="event-media-number">
        ${String(index + 1).padStart(2, "0")}
      </div>

    </article>

  `;

};


/* =========================================
   ERROR
========================================= */

const showEventError = (
  container,
  title,
  message
) => {

  container.innerHTML = `

    <section class="event-error">

      <div class="container">

        <h1>
          ${escapeHtml(title)}
        </h1>

        <p>
          ${escapeHtml(message)}
        </p>

        <a
          href="events.html"
          class="button button-primary"
        >

          Back to Events

          <span>
            →
          </span>

        </a>

      </div>

    </section>

  `;

};


/* =========================================
   DATE
========================================= */

const formatEventDate = (
  dateString
) => {

  if (!dateString) {
    return "Date TBA";
  }

  const date =
    new Date(dateString);

  return date.toLocaleDateString(
    "en-UG",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

};


/* =========================================
   ESCAPE HTML
========================================= */

const escapeHtml = (value) => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

};


/* =========================================
   YEAR
========================================= */

const setCurrentYear = () => {

  const element =
    document.getElementById(
      "currentYear"
    );

  if (element) {

    element.textContent =
      new Date().getFullYear();

  }

};