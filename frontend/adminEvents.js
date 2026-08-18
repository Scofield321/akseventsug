const token = localStorage.getItem("soundEventsToken");

if (!token) {
  window.location.href = "login.html";
}


/* =========================================
   DOM ELEMENTS
========================================= */

const eventForm = document.getElementById("eventForm");
const eventsTableBody = document.getElementById("eventsTableBody");
const message = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const logoutButton = document.getElementById("logoutButton");

const titleInput = document.getElementById("title");
const imageInput = document.getElementById("image");
const videoInput = document.getElementById("video");


/* =========================================
   STATE
========================================= */

let editingEventId = null;

let selectedImages = [];
let selectedVideos = [];


/* =========================================
   MESSAGE
========================================= */

const showMessage = (text, type = "success") => {
  if (!message) {
    return;
  }

  message.textContent = text;

  message.style.color =
    type === "error"
      ? "#dc2626"
      : "#15803d";
};


/* =========================================
   SLUG
========================================= */

const generateSlug = (title) => {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* =========================================
   HTML ESCAPE
========================================= */

const escapeHtml = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


/* =========================================
   DATE
========================================= */

const formatDate = (dateString) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};


/* =========================================
   RESET FORM
========================================= */

const resetForm = () => {

  if (eventForm) {
    eventForm.reset();
  }

  editingEventId = null;

  selectedImages = [];
  selectedVideos = [];

  if (formTitle) {
    formTitle.textContent = "Create Event";
  }

  if (saveButton) {
    saveButton.textContent = "Create Event";
    saveButton.disabled = false;
  }

  if (cancelButton) {
    cancelButton.style.display = "none";
  }

  renderImagePreviews();
  renderVideoPreviews();

  const imageUploadStatus =
    document.getElementById("imageUploadStatus");

  const videoUploadStatus =
    document.getElementById("videoUploadStatus");

  if (imageUploadStatus) {
    imageUploadStatus.textContent = "";
  }

  if (videoUploadStatus) {
    videoUploadStatus.textContent = "";
  }
};


/* =========================================
   IMAGE PREVIEW CONTAINER
========================================= */

const getImagePreviewContainer = () => {

  let container =
    document.getElementById(
      "imagePreviewGallery"
    );

  if (!container && imageInput) {

    container =
      document.createElement("div");

    container.id =
      "imagePreviewGallery";

    container.style.display =
      "grid";

    container.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(150px, 1fr))";

    container.style.gap =
      "12px";

    container.style.marginTop =
      "12px";

    if (imageInput.parentElement) {
      imageInput.parentElement.appendChild(
        container
      );
    }
  }

  return container;
};


/* =========================================
   VIDEO PREVIEW CONTAINER
========================================= */

const getVideoPreviewContainer = () => {

  let container =
    document.getElementById(
      "videoPreviewGallery"
    );

  if (!container && videoInput) {

    container =
      document.createElement("div");

    container.id =
      "videoPreviewGallery";

    container.style.display =
      "grid";

    container.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(220px, 1fr))";

    container.style.gap =
      "12px";

    container.style.marginTop =
      "12px";

    if (videoInput.parentElement) {
      videoInput.parentElement.appendChild(
        container
      );
    }
  }

  return container;
};


/* =========================================
   IMAGE PREVIEWS
========================================= */

const renderImagePreviews = () => {

  const container =
    getImagePreviewContainer();

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!selectedImages.length) {
    return;
  }

  selectedImages.forEach(
    (item, index) => {

      const wrapper =
        document.createElement("div");

      wrapper.style.position =
        "relative";

      wrapper.style.border =
        "1px solid #d1d5db";

      wrapper.style.borderRadius =
        "8px";

      wrapper.style.overflow =
        "hidden";

      wrapper.style.background =
        "#f9fafb";


      const image =
        document.createElement("img");

      image.src =
        item.url;

      image.alt =
        item.name ||
        `Event image ${index + 1}`;

      image.style.width =
        "100%";

      image.style.height =
        "130px";

      image.style.objectFit =
        "cover";

      image.style.display =
        "block";


      const number =
        document.createElement("span");

      number.textContent =
        String(index + 1).padStart(2, "0");

      number.style.position =
        "absolute";

      number.style.left =
        "8px";

      number.style.bottom =
        "8px";

      number.style.background =
        "rgba(0,0,0,.65)";

      number.style.color =
        "#fff";

      number.style.padding =
        "4px 7px";

      number.style.borderRadius =
        "4px";

      number.style.fontSize =
        "12px";


      const remove =
        document.createElement("button");

      remove.type =
        "button";

      remove.textContent =
        "×";

      remove.title =
        "Remove image";

      remove.style.position =
        "absolute";

      remove.style.top =
        "6px";

      remove.style.right =
        "6px";

      remove.style.width =
        "28px";

      remove.style.height =
        "28px";

      remove.style.padding =
        "0";

      remove.style.borderRadius =
        "50%";

      remove.style.background =
        "#dc2626";

      remove.style.color =
        "#fff";

      remove.style.fontSize =
        "18px";

      remove.style.lineHeight =
        "28px";

      remove.style.border =
        "none";

      remove.style.cursor =
        "pointer";

      remove.addEventListener(
        "click",
        () => {

          selectedImages.splice(
            index,
            1
          );

          renderImagePreviews();
        }
      );


      wrapper.appendChild(image);
      wrapper.appendChild(number);
      wrapper.appendChild(remove);

      container.appendChild(wrapper);
    }
  );
};


/* =========================================
   VIDEO PREVIEWS
========================================= */

const renderVideoPreviews = () => {

  const container =
    getVideoPreviewContainer();

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!selectedVideos.length) {
    return;
  }

  selectedVideos.forEach(
    (item, index) => {

      const wrapper =
        document.createElement("div");

      wrapper.style.position =
        "relative";

      wrapper.style.border =
        "1px solid #d1d5db";

      wrapper.style.borderRadius =
        "8px";

      wrapper.style.overflow =
        "hidden";

      wrapper.style.background =
        "#000";


      const video =
        document.createElement("video");

      video.src =
        item.url;

      video.controls =
        true;

      video.preload =
        "metadata";

      video.style.width =
        "100%";

      video.style.height =
        "150px";

      video.style.objectFit =
        "cover";

      video.style.display =
        "block";


      const number =
        document.createElement("span");

      number.textContent =
        String(index + 1).padStart(2, "0");

      number.style.position =
        "absolute";

      number.style.left =
        "8px";

      number.style.top =
        "8px";

      number.style.background =
        "rgba(0,0,0,.65)";

      number.style.color =
        "#fff";

      number.style.padding =
        "4px 7px";

      number.style.borderRadius =
        "4px";

      number.style.fontSize =
        "12px";


      const remove =
        document.createElement("button");

      remove.type =
        "button";

      remove.textContent =
        "×";

      remove.title =
        "Remove video";

      remove.style.position =
        "absolute";

      remove.style.top =
        "6px";

      remove.style.right =
        "6px";

      remove.style.width =
        "28px";

      remove.style.height =
        "28px";

      remove.style.padding =
        "0";

      remove.style.borderRadius =
        "50%";

      remove.style.background =
        "#dc2626";

      remove.style.color =
        "#fff";

      remove.style.fontSize =
        "18px";

      remove.style.border =
        "none";

      remove.style.cursor =
        "pointer";

      remove.addEventListener(
        "click",
        () => {

          selectedVideos.splice(
            index,
            1
          );

          renderVideoPreviews();
        }
      );


      wrapper.appendChild(video);
      wrapper.appendChild(number);
      wrapper.appendChild(remove);

      container.appendChild(wrapper);
    }
  );
};


/* =========================================
   LOAD EVENTS
========================================= */

const loadEvents = async () => {

  if (!eventsTableBody) {
    return;
  }

  try {

    eventsTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          Loading events...
        </td>
      </tr>
    `;


    const events =
      await window.api.getEvents();


    if (!Array.isArray(events)) {

      throw new Error(
        "Invalid events response from server."
      );
    }


    if (!events.length) {

      eventsTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            No events found.
          </td>
        </tr>
      `;

      return;
    }


    eventsTableBody.innerHTML =
      events
        .map(
          (event) => {

            const media =
              Array.isArray(event.media)
                ? event.media
                : [];


            const imageMedia =
              media.filter(
                item =>
                  item.media_type ===
                  "image"
              );


            const videoMedia =
              media.filter(
                item =>
                  item.media_type ===
                  "video"
              );


            const imageCount =
              imageMedia.length;


            const videoCount =
              videoMedia.length;


            /*
             * Prefer event_media image.
             * Fall back to events.image_url
             * for older events.
             */

            const thumbnail =
              imageMedia.length
                ? imageMedia[0].media_url
                : event.image_url;


            const hasImage =
              imageCount > 0 ||
              !!event.image_url;


            const hasVideo =
              videoCount > 0 ||
              !!event.video_url;


            return `
              <tr>

                <td>

                  <div
                    style="
                      display:flex;
                      gap:12px;
                      align-items:center;
                    "
                  >

                    ${
                      thumbnail
                        ? `
                          <img
                            src="${escapeHtml(
                              thumbnail
                            )}"
                            alt="${escapeHtml(
                              event.title
                            )}"
                            style="
                              width:70px;
                              height:55px;
                              object-fit:cover;
                              border-radius:7px;
                              flex-shrink:0;
                            "
                          />
                        `
                        : `
                          <div
                            style="
                              width:70px;
                              height:55px;
                              background:#e5e7eb;
                              border-radius:7px;
                              display:flex;
                              align-items:center;
                              justify-content:center;
                              font-size:11px;
                              color:#6b7280;
                              flex-shrink:0;
                            "
                          >
                            No image
                          </div>
                        `
                    }

                    <div>

                      <strong>
                        ${escapeHtml(
                          event.title
                        )}
                      </strong>

                      <div
                        style="
                          margin-top:5px;
                          color:#6b7280;
                          font-size:12px;
                        "
                      >

                        ${
                          hasImage
                            ? `🖼 ${
                                imageCount ||
                                1
                              }`
                            : ""
                        }

                        ${
                          hasVideo
                            ? ` &nbsp; 🎥 ${
                                videoCount ||
                                1
                              }`
                            : ""
                        }

                      </div>

                    </div>

                  </div>

                </td>


                <td>
                  ${escapeHtml(
                    formatDate(
                      event.event_date
                    )
                  )}
                </td>


                <td>
                  ${escapeHtml(
                    event.location ||
                    "-"
                  )}
                </td>


                <td>

                  <span
                    class="status ${escapeHtml(
                      event.status ||
                      "draft"
                    )}"
                  >
                    ${escapeHtml(
                      event.status ||
                      "draft"
                    )}
                  </span>

                </td>


                <td>

                  <div
                    style="
                      display:flex;
                      gap:6px;
                      flex-wrap:wrap;
                    "
                  >

                    <button
                      class="edit"
                      type="button"
                      onclick="startEdit(${Number(
                        event.id
                      )})"
                    >
                      Edit
                    </button>


                    <button
                      class="danger"
                      type="button"
                      onclick="removeEvent(${Number(
                        event.id
                      )})"
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>
            `;
          }
        )
        .join("");

  } catch (error) {

    console.error(
      "Failed to load events:",
      error
    );

    showMessage(
      error.message,
      "error"
    );

    eventsTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          Failed to load events.
        </td>
      </tr>
    `;
  }
};


/* =========================================
   TITLE → SLUG
========================================= */

if (titleInput) {

  titleInput.addEventListener(
    "input",
    () => {

      const slugInput =
        document.getElementById("slug");

      if (slugInput) {

        slugInput.value =
          generateSlug(
            titleInput.value
          );
      }
    }
  );
}


/* =========================================
   IMAGE UPLOAD HANDLER
========================================= */

if (imageInput) {

  imageInput.addEventListener(
    "change",
    async () => {

      const files =
        Array.from(
          imageInput.files || []
        );


      if (!files.length) {
        return;
      }


      const maxSize =
        5 * 1024 * 1024;


      imageInput.value = "";


      try {

        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          if (
            !file.type.startsWith(
              "image/"
            )
          ) {

            showMessage(
              `${file.name} is not a valid image.`,
              "error"
            );

            continue;
          }


          if (
            file.size > maxSize
          ) {

            showMessage(
              `${file.name} is larger than 5 MB.`,
              "error"
            );

            continue;
          }


          showMessage(
            `Uploading image ${i + 1} of ${files.length}...`
          );


          const result =
            await window.api.uploadImage(
              file
            );


          /*
           * Support both:
           *
           * "https://..."
           *
           * and:
           *
           * { image_url: "https://..." }
           */

          const url =
            typeof result === "string"
              ? result
              : result?.image_url;


          if (!url) {

            throw new Error(
              "Image upload succeeded but no image URL was returned."
            );
          }


          selectedImages.push({
            url,
            name: file.name,
            existing: false,
          });


          renderImagePreviews();
        }


        showMessage(
          `${selectedImages.length} image${
            selectedImages.length === 1
              ? ""
              : "s"
          } ready.`
        );

      } catch (error) {

        console.error(
          "Image upload failed:",
          error
        );

        showMessage(
          error.message,
          "error"
        );
      }
    }
  );
}


/* =========================================
   VIDEO UPLOAD HANDLER
========================================= */

if (videoInput) {

  videoInput.addEventListener(
    "change",
    async () => {

      const files =
        Array.from(
          videoInput.files || []
        );


      if (!files.length) {
        return;
      }


      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];


      const maxSize =
        50 * 1024 * 1024;


      videoInput.value = "";


      try {

        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          const file =
            files[i];


          if (
            !allowedTypes.includes(
              file.type
            )
          ) {

            showMessage(
              `${file.name} is not a supported video.`,
              "error"
            );

            continue;
          }


          if (
            file.size > maxSize
          ) {

            showMessage(
              `${file.name} is larger than 50 MB.`,
              "error"
            );

            continue;
          }


          showMessage(
            `Uploading video ${i + 1} of ${files.length}...`
          );


          const result =
            await window.api.uploadVideo(
              file
            );


          /*
           * Support both:
           *
           * "https://..."
           *
           * and:
           *
           * { video_url: "https://..." }
           */

          const url =
            typeof result === "string"
              ? result
              : result?.video_url;


          if (!url) {

            throw new Error(
              "Video upload succeeded but no video URL was returned."
            );
          }


          selectedVideos.push({
            url,
            name: file.name,
            existing: false,
          });


          renderVideoPreviews();
        }


        showMessage(
          `${selectedVideos.length} video${
            selectedVideos.length === 1
              ? ""
              : "s"
          } ready.`
        );

      } catch (error) {

        console.error(
          "Video upload failed:",
          error
        );

        showMessage(
          error.message,
          "error"
        );
      }
    }
  );
}


/* =========================================
   EDIT EVENT
========================================= */

const startEdit = async (id) => {

  try {

    showMessage(
      "Loading event..."
    );


    const event =
      await window.api.getEvent(id);


    if (!event) {

      throw new Error(
        "Event not found."
      );
    }


    editingEventId =
      event.id;


    /* =====================================
       BASIC EVENT FIELDS
    ===================================== */

    const titleField =
      document.getElementById("title");

    const slugField =
      document.getElementById("slug");

    const descriptionField =
      document.getElementById("description");

    const locationField =
      document.getElementById("location");

    const statusField =
      document.getElementById("status");


    if (titleField) {
      titleField.value =
        event.title || "";
    }


    if (slugField) {
      slugField.value =
        event.slug || "";
    }


    if (descriptionField) {
      descriptionField.value =
        event.description || "";
    }


    if (locationField) {
      locationField.value =
        event.location || "";
    }


    if (statusField) {
      statusField.value =
        event.status ||
        "draft";
    }


    /* =====================================
       MEDIA
    ===================================== */

    selectedImages = [];
    selectedVideos = [];


    /*
     * New architecture:
     *
     * event.media
     *
     * comes from event_media table.
     */

    if (
      Array.isArray(event.media)
    ) {

      event.media.forEach(
        (item) => {

          if (
            item.media_type ===
              "image" &&
            item.media_url
          ) {

            selectedImages.push({
              url:
                item.media_url,

              name:
                "Existing image",

              existing:
                true,

              id:
                item.id,
            });
          }


          if (
            item.media_type ===
              "video" &&
            item.media_url
          ) {

            selectedVideos.push({
              url:
                item.media_url,

              name:
                "Existing video",

              existing:
                true,

              id:
                item.id,
            });
          }
        }
      );
    }


    /*
     * Legacy fallback.
     *
     * This allows older events that only
     * have events.image_url/video_url
     * to continue working.
     */

    if (
      !selectedImages.length &&
      event.image_url
    ) {

      selectedImages.push({
        url:
          event.image_url,

        name:
          "Existing image",

        existing:
          true,

        legacy:
          true,
      });
    }


    if (
      !selectedVideos.length &&
      event.video_url
    ) {

      selectedVideos.push({
        url:
          event.video_url,

        name:
          "Existing video",

        existing:
          true,

        legacy:
          true,
      });
    }


    renderImagePreviews();
    renderVideoPreviews();


    /* =====================================
       DATE
    ===================================== */

    const dateInput =
      document.getElementById(
        "event_date"
      );


    if (
      dateInput &&
      event.event_date
    ) {

      const date =
        new Date(
          event.event_date
        );


      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {

        const localDate =
          new Date(
            date.getTime() -
            date.getTimezoneOffset() *
              60000
          )
            .toISOString()
            .slice(0, 16);


        dateInput.value =
          localDate;
      }
    }


    /* =====================================
       EDIT MODE
    ===================================== */

    if (formTitle) {

      formTitle.textContent =
        "Edit Event";
    }


    if (saveButton) {

      saveButton.textContent =
        "Update Event";
    }


    if (cancelButton) {

      cancelButton.style.display =
        "inline-block";
    }


    showMessage(
      `Editing "${event.title}"`
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  } catch (error) {

    console.error(
      "Failed to load event:",
      error
    );

    showMessage(
      error.message,
      "error"
    );
  }
};


/* =========================================
   DELETE EVENT
========================================= */

const removeEvent = async (id) => {

  const confirmed =
    confirm(
      "Are you sure you want to delete this event?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await window.api.deleteEvent(
      id
    );


    showMessage(
      "Event deleted successfully."
    );


    await loadEvents();

  } catch (error) {

    console.error(
      "Failed to delete event:",
      error
    );

    showMessage(
      error.message,
      "error"
    );
  }
};


/* =========================================
   SUBMIT EVENT
========================================= */

if (eventForm) {

  eventForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const titleField =
        document.getElementById(
          "title"
        );

      const descriptionField =
        document.getElementById(
          "description"
        );

      const dateField =
        document.getElementById(
          "event_date"
        );

      const locationField =
        document.getElementById(
          "location"
        );

      const statusField =
        document.getElementById(
          "status"
        );


      const title =
        titleField
          ? titleField.value.trim()
          : "";


      if (!title) {

        showMessage(
          "Event title is required.",
          "error"
        );

        return;
      }


      /* ===================================
         MEDIA URL ARRAYS
      =================================== */

      const imageUrls =
        selectedImages
          .map(
            item => item.url
          )
          .filter(Boolean);


      const videoUrls =
        selectedVideos
          .map(
            item => item.url
          )
          .filter(Boolean);


      /* ===================================
         EVENT DATA
      =================================== */

      const eventData = {

        title,

        slug:
          generateSlug(title),

        description:
          descriptionField
            ? descriptionField.value.trim()
            : "",

        event_date:
          dateField
            ? dateField.value
            : "",

        location:
          locationField
            ? locationField.value.trim()
            : "",

        /*
         * PRIMARY MEDIA DATA
         *
         * These arrays are what the backend
         * should use to synchronize the
         * event_media table.
         */

        image_urls:
          imageUrls,

        video_urls:
          videoUrls,

        /*
         * LEGACY COMPATIBILITY
         *
         * Keep these temporarily because
         * your events table still contains
         * image_url and video_url.
         */

        image_url:
          imageUrls[0] || "",

        video_url:
          videoUrls[0] || "",

        status:
          statusField
            ? statusField.value
            : "draft",
      };


      /* ===================================
         DISABLE BUTTON
      =================================== */

      if (saveButton) {
        saveButton.disabled =
          true;
      }


      try {

        /* =================================
           UPDATE
        ================================= */

        if (
          editingEventId !== null
        ) {

          if (saveButton) {
            saveButton.textContent =
              "Updating...";
          }


          await window.api.updateEvent(
            editingEventId,
            eventData
          );


          showMessage(
            "Event updated successfully."
          );
        }


        /* =================================
           CREATE
        ================================= */

        else {

          if (saveButton) {
            saveButton.textContent =
              "Creating...";
          }


          await window.api.createEvent(
            eventData
          );


          showMessage(
            "Event created successfully."
          );
        }


        /* =================================
           RESET + RELOAD
        ================================= */

        resetForm();

        await loadEvents();

      } catch (error) {

        console.error(
          "Failed to save event:",
          error
        );

        showMessage(
          error.message,
          "error"
        );

      } finally {

        if (saveButton) {

          saveButton.disabled =
            false;

          /*
           * resetForm() already sets this
           * when successful. If there was
           * an error, restore the appropriate
           * button text.
           */

          if (
            editingEventId !== null
          ) {

            saveButton.textContent =
              "Update Event";

          } else {

            saveButton.textContent =
              "Create Event";
          }
        }
      }

    }
  );
}


/* =========================================
   CANCEL EDIT
========================================= */

if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    () => {

      resetForm();

      showMessage(
        "Edit cancelled."
      );
    }
  );
}


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "soundEventsToken"
      );

      localStorage.removeItem(
        "soundEventsAdmin"
      );


      window.location.href =
        "login.html";
    }
  );
}


/* =========================================
   EXPOSE FUNCTIONS FOR HTML BUTTONS
========================================= */

window.startEdit =
  startEdit;

window.removeEvent =
  removeEvent;


/* =========================================
   INITIAL LOAD
========================================= */

loadEvents();