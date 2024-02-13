import API from "../helper/API.js";

export default class LoginController {
  constructor(view) {
    this.view = view;

    this.api = new API();

    this.view.submit(this.handleUserSecretId.bind(this), this.handlerRequestAuthorization.bind(this), this.handlerIsLoginValuesValid);
  }

  handleUserSecretId(id, secret) {
    this.setStoredUserData(id, secret);
  }

  handlerRequestAuthorization(id, secret) {
    this.api.requestAuthorization(id);
    this.setStoredUserData(id, secret);
  }


  handlerIsLoginValuesValid(id, secret) {
    return secret !== '' && id !== '';
  };

  setStoredUserData(id, secret) {
    localStorage.setItem("userData", JSON.stringify({ client_id: id, client_secret: secret })); // Não deixar o secret visível em uma aplicação real
  }

}
