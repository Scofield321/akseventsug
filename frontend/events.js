/* =========================================
   SOUND EVENTS
   EVENTS PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeNavigation();

  loadEvents();

  setCurrentYear();

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


  const links =
    menu.querySelectorAll("a");


  links.forEach((link) => {

    link.addEventListener("click", () => {

      menu.classList.remove("open");

    });

  });

};


/* =========================================
   LOAD EVENTS
========================================= */

const loadEvents = async () => {

  const container =
    document.getElementById("eventsGrid");


  if (!container) {
    return;
  }


  try {

    const events =
      await window.api.getEvents();


    const publishedEvents =
      events
        .filter(
          (event) =>
            event.status === "published"
        )
        .sort(
          (a, b) =>
            new Date(a.event_date) -
            new Date(b.event_date)
        );


    if (!publishedEvents.length) {

      container.innerHTML = `

        <div class="loading-card">

          <div
            style="
              font-size: 40px;
              margin-bottom: 15px;
            "
          >
            ✦
          </div>

          <h3>
            Something is coming.
          </h3>

          <p>
            We're preparing our next
            experience. Stay tuned.
          </p>

        </div>

      `;

      return;
    }


    container.innerHTML =
      publishedEvents
        .map(
          (event) =>
            createEventCard(event)
        )
        .join("");


  } catch (error) {

    console.error(
      "Failed to load events:",
      error
    );


    container.innerHTML = `

      <div class="loading-card">

        <p>
          Unable to load events right now.
        </p>

        <button
          class="button button-outline"
          onclick="loadEvents()"
          style="margin-top: 20px;"
        >
          Try Again
        </button>

      </div>

    `;

  }

};


/* =========================================
   EVENT CARD
========================================= */

const createEventCard = (event) => {

  const formattedDate =
    formatEventDate(event.event_date);


  let media;


  /*
    EVENT HAS IMAGE
  */

  if (event.image_url) {

    media = `

      <div class="event-image-wrapper">

        <img
          class="event-image"
          src="${escapeHtml(event.image_url)}"
          alt="${escapeHtml(event.title)}"
          loading="lazy"
        >

        ${
          event.video_url
            ? `
              <span class="event-video-badge">
                ▶ VIDEO
              </span>
            `
            : ""
        }

      </div>

    `;

  }


  /*
    EVENT HAS VIDEO BUT NO IMAGE
  */

  else if (event.video_url) {

    media = `

      <div class="event-image-wrapper">

        <video
          class="event-image"
          muted
          playsinline
          preload="metadata"
        >

          <source
            src="${escapeHtml(event.video_url)}"
          >

        </video>


        <span class="event-video-badge">
          ▶ VIDEO
        </span>

      </div>

    `;

  }


  /*
    EVENT HAS NO MEDIA
  */

  else {

    media = `

      <div class="event-image-wrapper">

        <div class="event-image-placeholder">

          <strong>
            SOUND EVENTS
          </strong>
        </div>
      </div>
    `;
  }
  return `
    <article class="event-card">
      ${media}
      <div class="event-info">
        <div class="event-date">
          ${escapeHtml(formattedDate)}
        </div>
        <h3 class="event-title">
          ${escapeHtml(event.title)}

        </h3>


        ${
          event.location
            ? `

              <div class="event-location">

                📍
                ${escapeHtml(event.location)}

              </div>

            `
            : ""
        }

        ${
          event.description
            ? `
              <p class="event-description">

                ${escapeHtml(event.description)}

              </p>
            `
            : ""
        }
        <a
          href="event.html?id=${encodeURIComponent(event.id)}"
          class="event-link"
        >
          Discover Experience →
        </a>
      </div>
    </article>

  `;

};


/* =========================================
   FORMAT DATE
========================================= */

const formatEventDate = (dateString) => {

  if (!dateString) {
    return "Date TBA";
  }


  const date =
    new Date(dateString);


  if (Number.isNaN(date.getTime())) {
    return "Date TBA";
  }


  return date.toLocaleDateString(
    "en-UG",
    {
      weekday: "short",
      month: "short",
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
   CURRENT YEAR
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