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

const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`
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
// EVENTS
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


const updateEvent = async (id, eventData) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to update event:", error);
    throw error;
  }
};


const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw error;
  }
};


// ============================================================
// API INFORMATION
// ============================================================

console.log(
  `🌐 API Environment: ${isLocal ? "LOCAL" : "PRODUCTION"}`
);

console.log(`🔗 API URL: ${API_URL}`);


// ============================================================
// EXPOSE API
// ============================================================

window.api = {
  loginAdmin,
  getToken,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};