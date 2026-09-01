// ============================================================
// API CONFIGURATION
// ============================================================

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_URL = isLocal
  ? "http://localhost:5001/api"
  : "https://akseventsug-backend.onrender.com/api";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getToken = () => {
  return localStorage.getItem("soundEventsToken");
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    Authorization: `Bearer ${token}`,
  };
};

const getUploadHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ============================================================
// RESPONSE HANDLER
// ============================================================

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  let data;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });

    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
};

// ============================================================
// AUTHENTICATION
// ============================================================

const loginAdmin = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username,
        password,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Admin login failed:", error);

    throw error;
  }
};

// ============================================================
// EVENTS — GET ALL
// ============================================================

const getEvents = async () => {
  try {
    const response = await fetch(`${API_URL}/events`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to load events:", error);

    throw error;
  }
};

// ============================================================
// EVENTS — GET SINGLE
// ============================================================

const getEvent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`);

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to load event ${id}:`, error);

    throw error;
  }
};

// ============================================================
// EVENTS — CREATE
// ============================================================

const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to create event:", error);

    throw error;
  }
};

// ============================================================
// EVENTS — UPDATE
// ============================================================

const updateEvent = async (id, eventData) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PUT",

      headers: getAuthHeaders(),

      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to update event ${id}:`, error);

    throw error;
  }
};

// ============================================================
// EVENTS — DELETE
// ============================================================

const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",

      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to delete event ${id}:`, error);

    throw error;
  }
};

// ============================================================
// MEDIA — UPLOAD IMAGE
// ============================================================

const uploadImage = async (file) => {
  if (!file) {
    return null;
  }

  try {
    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(`${API_URL}/events/upload-image`, {
      method: "POST",

      headers: getUploadHeaders(),

      body: formData,
    });

    const data = await handleResponse(response);

    /*
     * Backend returns:
     *
     * {
     *   message: "...",
     *   image_url: "..."
     * }
     */

    if (!data?.image_url) {
      throw new Error("Image upload succeeded but no image URL was returned.");
    }

    return data.image_url;
  } catch (error) {
    console.error("Image upload failed:", error);

    throw error;
  }
};

// ============================================================
// MEDIA — DIRECT VIDEO UPLOAD TO SUPABASE
// ============================================================

const uploadVideo = async (file) => {
  if (!file) {
    return null;
  }

  try {

    // --------------------------------------------------------
    // STEP 1 — ASK BACKEND FOR SIGNED UPLOAD URL
    // --------------------------------------------------------

    console.log(
      "🎥 Preparing direct video upload:",
      file.name,
      file.size
    );

    const prepareResponse = await fetch(
      `${API_URL}/events/prepare-video-upload`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${getToken()}`,
        },

        body: JSON.stringify({
          fileName: file.name,

          contentType: file.type,
        }),
      }
    );

    const uploadData =
      await handleResponse(
        prepareResponse
      );

    if (!uploadData?.signedUrl) {
      throw new Error(
        "Server did not return a Supabase upload URL."
      );
    }

    console.log(
      "🟢 Signed upload URL received."
    );

    // --------------------------------------------------------
    // STEP 2 — UPLOAD FILE DIRECTLY TO SUPABASE
    // --------------------------------------------------------

    const uploadResponse =
      await fetch(
        uploadData.signedUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              file.type ||
              "application/octet-stream",
          },

          body: file,
        }
      );

    if (!uploadResponse.ok) {

      let errorText = "";

      try {
        errorText =
          await uploadResponse.text();
      } catch {
        errorText = "";
      }

      console.error(
        "🔴 Direct Supabase video upload failed:",
        {
          status:
            uploadResponse.status,

          statusText:
            uploadResponse.statusText,

          error:
            errorText,
        }
      );

      throw new Error(
        `Video upload failed (${uploadResponse.status}).`
      );
    }

    console.log(
      "🟢 Video uploaded directly to Supabase."
    );

    // --------------------------------------------------------
    // STEP 3 — RETURN PUBLIC VIDEO URL
    // --------------------------------------------------------

    if (!uploadData.video_url) {
      throw new Error(
        "Video uploaded but no public URL was returned."
      );
    }

    console.log(
      "🟢 Video URL:",
      uploadData.video_url
    );

    return uploadData.video_url;

  } catch (error) {

    console.error(
      "Video upload failed:",
      error
    );

    throw error;
  }
};

// ============================================================
// MEDIA — GET EVENT MEDIA
// ============================================================

const getEventMedia = async (eventId) => {
  try {
    const response = await fetch(`${API_URL}/event-media/${eventId}`);

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to load media for event ${eventId}:`, error);

    throw error;
  }
};

// ============================================================
// MEDIA — UPLOAD TO EVENT
// ============================================================

const uploadEventMedia = async (eventId, file) => {
  if (!file) {
    return null;
  }

  try {
    const formData = new FormData();

    formData.append("media", file);

    const response = await fetch(`${API_URL}/event-media/${eventId}/upload`, {
      method: "POST",

      headers: getUploadHeaders(),

      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to upload media for event ${eventId}:`, error);

    throw error;
  }
};

// ============================================================
// MEDIA — DELETE
// ============================================================

const deleteEventMedia = async (mediaId) => {
  try {
    const response = await fetch(`${API_URL}/event-media/media/${mediaId}`, {
      method: "DELETE",

      headers: getUploadHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to delete media ${mediaId}:`, error);

    throw error;
  }
};

// ============================================================
// MEDIA — UPDATE ORDER
// ============================================================

const updateEventMediaOrder = async (mediaId, sortOrder) => {
  try {
    const response = await fetch(
      `${API_URL}/event-media/media/${mediaId}/order`,
      {
        method: "PUT",

        headers: getAuthHeaders(),

        body: JSON.stringify({
          sort_order: sortOrder,
        }),
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error(`Failed to update media order ${mediaId}:`, error);

    throw error;
  }
};

// ============================================================
// API INFORMATION
// ============================================================

console.log(`🌐 API Environment: ${isLocal ? "LOCAL" : "PRODUCTION"}`);

console.log(`🔗 API URL: ${API_URL}`);

// ============================================================
// EXPOSE API
// ============================================================

window.api = {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  loginAdmin,

  getToken,

  // ----------------------------------------------------------
  // Events
  // ----------------------------------------------------------

  getEvents,

  getEvent,

  createEvent,

  updateEvent,

  deleteEvent,

  // ----------------------------------------------------------
  // Media
  // ----------------------------------------------------------

  uploadImage,

  uploadVideo,

  getEventMedia,

  uploadEventMedia,

  deleteEventMedia,

  updateEventMediaOrder,
};
