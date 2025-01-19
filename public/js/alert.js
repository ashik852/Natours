/*eslint-disable */
// type is " success" or "error"

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  //   console.log(el);
  if (el) el.parentElement.removeChild(el);
};
export const showAlert = (type, msg = "default message") => {
  hideAlert();
  console.log(`Type: ${type}, Message: ${msg}`);
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 3000);
};
