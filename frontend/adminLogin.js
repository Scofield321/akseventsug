const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  try {
    // const data = await loginAdmin(username, password);
    const data = await window.api.loginAdmin(username, password);

    localStorage.setItem("soundEventsToken", data.token);
    localStorage.setItem(
      "soundEventsAdmin",
      JSON.stringify(data.admin)
    );

    message.style.color = "green";
    message.textContent = "Login successful!";

    // We'll create this page next.
    setTimeout(() => {
      window.location.href = "adminDashboard.html";
    }, 500);

  } catch (error) {
    message.style.color = "#d32f2f";
    message.textContent = error.message;

    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});
