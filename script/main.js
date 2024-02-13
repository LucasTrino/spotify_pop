import LoginController from "./controller/LoginController.js";
import LoginView from "./view/LoginView.js";
import LoginModel from "./model/LoginModel.js";

import ProfileController from "./controller/ProfileController.js";
import ProfileView from "./view/ProfileView.js";
import ProfileModel from "./model/ProfileModel.js";

const currentUrl = window.location.href;

if (currentUrl.includes('profile')) {
  const profile = new ProfileController(new ProfileView(), new ProfileModel());
} else {
  const login = new LoginController(new LoginView(), new LoginModel());
}
