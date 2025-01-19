/*eslint-disable */
import "core-js/stable";
import "regenerator-runtime/runtime";
import { login, logout } from "./login";
const form = document.querySelector(".form");
const logOutBtn = document.querySelector(".nav__el--logout");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
} else {
  console.log("Logout button not found on this page.");
}
