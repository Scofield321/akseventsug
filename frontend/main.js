/* =========================================
   SOUND EVENTS
   PUBLIC HOMEPAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeNavigation();

  loadUpcomingEvents();

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

const loadUpcomingEvents = async () => {

  const container =
    document.getElementById("upcomingEvents");

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
        .filter(
          (event) =>
            new Date(event.event_date) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.event_date) -
            new Date(b.event_date)
        )
        .slice(0, 3);


    if (!publishedEvents.length) {

      container.innerHTML = `

        <div class="loading-card">

          <p>
            Our next experience is coming soon.
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


  const image = event.image_url
    ? `

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

    `
    : `

      <div class="event-image-wrapper">

        <div class="event-image-placeholder">

          SOUND EVENTS

        </div>

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


  return `

    <article class="event-card">

      ${image}

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
                📍 ${escapeHtml(event.location)}
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
          View Event →
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