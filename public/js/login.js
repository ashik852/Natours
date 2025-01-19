/*eslint-disable */

import { showAlert } from "./alert.js";

export const login = async (email, password) => {
  // alert(email, password);
  // console.log(email, password);
  try {
    const res = await axios({
      method: "post",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
    // console.log(res);
  } catch (err) {
    // console.log(err.response.data);
    // console.log("Error:", err.response ? err.response.data : err.message);
    // Check if the error response exists
    if (err.response && err.response.data) {
      console.log("error Response:", err.response.data); // Debugging
      showAlert(
        "error",
        err.response.data.message || "Invalid email or password!"
      );
    } else {
      console.log("error:", err.message); // Debugging
      showAlert("Something went wrong. Try again later.");
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:3000/api/v1/users/logout",
    });
    if (res.data.message === "success") location.reload(true);
  } catch (err) {
    showAlert("error", "Error login out!,try again");
  }
};

const form = document.querySelector(".form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});

document.addEventListener("DOMContentLoaded", () => {
  const logOutBtn = document.querySelector(".nav__el--logout");
  if (logOutBtn) {
    logOutBtn.addEventListener("click", logout);
  } else {
    console.log("Logout button not found on this page.");
  }
});
