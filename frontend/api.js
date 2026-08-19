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
  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    );
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
// MEDIA — UPLOAD VIDEO
// ============================================================

const uploadVideo = async (file) => {
  if (!file) {
    return null;
  }

  try {
    const formData = new FormData();

    formData.append("video", file);

    const response = await fetch(`${API_URL}/events/upload-video`, {
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
     *   video_url: "..."
     * }
     */

    if (!data?.video_url) {
      throw new Error("Video upload succeeded but no video URL was returned.");
    }

    return data.video_url;
  } catch (error) {
    console.error("Video upload failed:", error);

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
