const API_URL = "http://localhost:5001/api";

const loginAdmin = async (username, password) => {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

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

const getEvents = async () => {
  const response = await fetch(`${API_URL}/events`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch events");
  }

  return data;
};

const createEvent = async (eventData) => {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create event");
  }

  return data;
};

const updateEvent = async (id, eventData) => {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update event");
  }

  return data;
};

const deleteEvent = async (id) => {
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete event");
  }

  return data;
};

window.api = {
  loginAdmin,
  getToken,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
