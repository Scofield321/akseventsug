const token = localStorage.getItem("soundEventsToken");
const adminData = localStorage.getItem("soundEventsAdmin");

if (!token || !adminData) {
  window.location.href = "login.html";
}

const admin = JSON.parse(adminData);

const welcomeMessage = document.getElementById("welcomeMessage");

welcomeMessage.textContent = `Welcome, ${admin.username}`;

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("soundEventsToken");
  localStorage.removeItem("soundEventsAdmin");

  window.location.href = "login.html";
});
