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

/*
 * Instead of storing only one URL,
 * we now keep arrays.
 */

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

  eventForm.reset();

  editingEventId = null;

  selectedImages = [];
  selectedVideos = [];

  formTitle.textContent = "Create Event";

  saveButton.textContent = "Create Event";

  cancelButton.style.display = "none";


  /*
   * Clear media previews
   */

  renderImagePreviews();
  renderVideoPreviews();


  const imageUploadStatus =
    document.getElementById(
      "imageUploadStatus"
    );

  const videoUploadStatus =
    document.getElementById(
      "videoUploadStatus"
    );


  if (imageUploadStatus) {
    imageUploadStatus.textContent = "";
  }


  if (videoUploadStatus) {
    videoUploadStatus.textContent = "";
  }
};


/* =========================================
   MEDIA PREVIEW CONTAINER
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

    imageInput.parentElement.appendChild(
      container
    );
  }

  return container;
};


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

    videoInput.parentElement.appendChild(
      container
    );
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

      image.src = item.url;

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

      video.src = item.url;

      video.controls = true;

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

            /*
             * The API may return media
             * depending on how getEvents()
             * is implemented.
             */

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


            /*
             * Fallback to old fields
             * if media isn't returned.
             */

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

    console.error(error);

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
   UPLOAD IMAGE
========================================= */

const uploadImage = async (file) => {

  if (!file) {
    return null;
  }


  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );


  const response =
    await fetch(
      "http://localhost:5001/api/events/upload-image",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Image upload failed"
    );

  }


  return data.image_url;
};


/* =========================================
   UPLOAD VIDEO
========================================= */

const uploadVideo = async (file) => {

  if (!file) {
    return null;
  }


  const formData =
    new FormData();

  formData.append(
    "video",
    file
  );


  const response =
    await fetch(
      "http://localhost:5001/api/events/upload-video",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Video upload failed"
    );

  }


  return data.video_url;
};


/* =========================================
   TITLE → SLUG
========================================= */

if (titleInput) {

  titleInput.addEventListener(
    "input",
    () => {

      const slugInput =
        document.getElementById(
          "slug"
        );


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


      /*
       * Maximum 5 MB per image.
       */

      const maxSize =
        5 * 1024 * 1024;


      /*
       * Clear input immediately so
       * the same file can be selected
       * again later.
       */

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


          const url =
            await uploadImage(
              file
            );


          selectedImages.push({
            url,
            name: file.name,
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

        console.error(error);

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


          const url =
            await uploadVideo(
              file
            );


          selectedVideos.push({
            url,
            name: file.name,
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

        console.error(error);

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

    const response =
      await fetch(
        `http://localhost:5001/api/events/${id}`
      );


    const event =
      await response.json();


    if (!response.ok) {

      throw new Error(
        event.message ||
        "Failed to load event"
      );

    }


    editingEventId =
      event.id;


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


    /*
     * Load ALL existing media.
     */

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
              url: item.media_url,
              name: "Existing image",
              existing: true,
              id: item.id,
            });

          }


          if (
            item.media_type ===
            "video"
          ) {

            selectedVideos.push({
              url: item.media_url,
              name: "Existing video",
              existing: true,
              id: item.id,
            });

          }

        }
      );

    } else {

      /*
       * Backwards compatibility.
       */

      if (event.image_url) {

        selectedImages.push({
          url: event.image_url,
          name: "Existing image",
          existing: true,
        });

      }


      if (event.video_url) {

        selectedVideos.push({
          url: event.video_url,
          name: "Existing video",
          existing: true,
        });

      }

    }


    renderImagePreviews();

    renderVideoPreviews();


    /*
     * Date
     */

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


      document.getElementById(
        "event_date"
      ).value =
        localDate;

    }


    formTitle.textContent =
      "Edit Event";


    saveButton.textContent =
      "Update Event";


    cancelButton.style.display =
      "inline-block";


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });


  } catch (error) {

    console.error(error);

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

    console.error(error);

    showMessage(
      error.message,
      "error"
    );

  }

};


/* =========================================
   SUBMIT EVENT
========================================= */

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


    /*
     * Convert our media state
     * into arrays of URLs.
     */

    const imageUrls =
      selectedImages.map(
        item => item.url
      );


    const videoUrls =
      selectedVideos.map(
        item => item.url
      );


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

      /*
       * New multi-media fields.
       */

      image_urls:
        imageUrls,

      video_urls:
        videoUrls,


      /*
       * Keep the old fields too
       * for backwards compatibility.
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


    saveButton.disabled =
      true;


    try {

      if (editingEventId) {

        await window.api.updateEvent(
          editingEventId,
          eventData
        );


        showMessage(
          "Event updated successfully."
        );


      } else {

        await window.api.createEvent(
          eventData
        );


        showMessage(
          "Event created successfully."
        );

      }


      resetForm();

      await loadEvents();


    } catch (error) {

      console.error(error);

      showMessage(
        error.message,
        "error"
      );


    } finally {

      saveButton.disabled =
        false;

    }

  }
);


/* =========================================
   CANCEL EDIT
========================================= */

cancelButton.addEventListener(
  "click",
  () => {
    resetForm();
  }
);


/* =========================================
   LOGOUT
========================================= */

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


/* =========================================
   INITIAL LOAD
========================================= */

loadEvents();