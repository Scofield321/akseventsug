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
  return title
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

  return new Date(dateString).toLocaleString();
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


            const imageCount =
              media.filter(
                item =>
                  item.media_type ===
                  "image"
              ).length;


            const videoCount =
              media.filter(
                item =>
                  item.media_type ===
                  "video"
              ).length;


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
                      event.image_url
                        ? `
                          <img
                            src="${escapeHtml(
                              event.image_url
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
                          >
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
                            ? `🖼 ${imageCount || 1}`
                            : ""
                        }

                        ${
                          hasVideo
                            ? ` &nbsp; 🎥 ${videoCount || 1}`
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
                      event.status
                    )}"
                  >
                    ${escapeHtml(
                      event.status
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
                      onclick="startEdit(${event.id})"
                    >
                      Edit
                    </button>


                    <button
                      class="danger"
                      onclick="removeEvent(${event.id})"
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
          imageInput.files
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


          const url =
            result.image_url;


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
          videoInput.files
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


          const url =
            result.video_url;


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


    /*
     * IMPORTANT:
     *
     * We do NOT construct the URL here.
     *
     * window.api.getEvent()
     * decides whether to use:
     *
     * localhost
     *
     * or
     *
     * Render
     */

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

    document.getElementById(
      "title"
    ).value =
      event.title || "";


    document.getElementById(
      "slug"
    ).value =
      event.slug || "";


    document.getElementById(
      "description"
    ).value =
      event.description || "";


    document.getElementById(
      "location"
    ).value =
      event.location || "";


    document.getElementById(
      "status"
    ).value =
      event.status ||
      "draft";


    /* =====================================
       MEDIA
    ===================================== */

    selectedImages = [];
    selectedVideos = [];


    if (
      Array.isArray(event.media)
    ) {

      event.media.forEach(
        (item) => {

          if (
            item.media_type ===
            "image"
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
            "video"
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

    } else {

      /*
       * Backwards compatibility
       * for old events.
       */

      if (event.image_url) {

        selectedImages.push({
          url:
            event.image_url,

          name:
            "Existing image",

          existing:
            true,
        });
      }


      if (event.video_url) {

        selectedVideos.push({
          url:
            event.video_url,

          name:
            "Existing video",

          existing:
            true,
        });
      }
    }


    renderImagePreviews();
    renderVideoPreviews();


    /* =====================================
       DATE
    ===================================== */

    if (event.event_date) {

      const date =
        new Date(
          event.event_date
        );


      const localDate =
        new Date(
          date.getTime() -
          date.getTimezoneOffset() *
            60000
        )
          .toISOString()
          .slice(0, 16);


      const dateInput =
        document.getElementById(
          "event_date"
        );


      if (dateInput) {

        dateInput.value =
          localDate;
      }
    }


    /* =====================================
       CHANGE FORM TO EDIT MODE
    ===================================== */

    formTitle.textContent =
      "Edit Event";


    saveButton.textContent =
      "Update Event";


    cancelButton.style.display =
      "inline-block";


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


      const title =
        document
          .getElementById("title")
          .value
          .trim();


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
          document
            .getElementById(
              "description"
            )
            .value
            .trim(),

        event_date:
          document
            .getElementById(
              "event_date"
            )
            .value,

        location:
          document
            .getElementById(
              "location"
            )
            .value
            .trim(),

        image_urls:
          imageUrls,

        video_urls:
          videoUrls,

        /*
         * Backwards compatibility.
         */

        image_url:
          imageUrls[0] || "",

        video_url:
          videoUrls[0] || "",

        status:
          document
            .getElementById(
              "status"
            )
            .value,
      };


      /* ===================================
         DISABLE BUTTON
      =================================== */

      saveButton.disabled =
        true;


      const originalButtonText =
        saveButton.textContent;


      try {

        /* =================================
           UPDATE
        ================================= */

        if (editingEventId !== null) {

          saveButton.textContent =
            "Updating...";


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

          saveButton.textContent =
            "Creating...";


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

        saveButton.disabled =
          false;

        if (
          !editingEventId &&
          saveButton
        ) {
          saveButton.textContent =
            originalButtonText;
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
   INITIAL LOAD
========================================= */

loadEvents();