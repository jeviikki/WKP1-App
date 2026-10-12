const target = document.querySelector("table") as HTMLTableElement;

const restaurantDialog = document.querySelector("#restaurant-dialog") as HTMLDialogElement;
const restaurantError = document.querySelector("#restaurant-error") as HTMLElement;

const unregisteredSection = document.querySelector("#unregistered-section") as HTMLElement;
const registerBtn = document.querySelector("#register-dialog-btn") as HTMLButtonElement;
const loginBtn = document.querySelector("#login-dialog-btn") as HTMLButtonElement;

const loginDialog = document.querySelector("#login-dialog") as HTMLDialogElement;

const userCard = document.querySelector("#user-card") as HTMLElement;
const nameTarget = document.querySelector("#user-name") as HTMLElement;
const faveTarget = document.querySelector("#user-fave") as HTMLElement;
const avatarTarget = document.querySelector("#user-avatar") as HTMLImageElement;

export {target, restaurantDialog, restaurantError, unregisteredSection, registerBtn, loginBtn, loginDialog, userCard, nameTarget, faveTarget, avatarTarget};
