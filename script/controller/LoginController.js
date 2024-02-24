import API from "../helper/API.js";

export default class LoginController {
  constructor(view) {
    this.view = view;

    this.api = new API();

    this.view.submit(this.handleUserId.bind(this), this.handlerRequestAuthorization.bind(this), this.handlerIsLoginValuesValid);
  }

  handleUserId(id) {
    this.setStoredUserData(id);
  }

  handlerRequestAuthorization(id) {
    this.api.requestAuthorization(id);
    console.log(id);
    this.setStoredUserData(id);
  }


  handlerIsLoginValuesValid(id) {
    return id !== '';
  };

  setStoredUserData(id) {
    localStorage.setItem("userData", JSON.stringify({ client_id: id })); 
  }

}
