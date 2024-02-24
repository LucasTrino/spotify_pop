export default class LoginView {
  constructor() {
    this.idInput = document.querySelector("[data-clientId]");
    this.submitButton = document.querySelector("[data-submitButton]");
    this.labelsInput = document.querySelectorAll("[data-labelInput]");

    this.labelsInput.forEach((label) => {
      label.innerHTML = label.innerText.split("").map((letter, idx) => {
        return letter === " " ? letter : `<span style="transition-delay:${idx * 50}ms">${letter}</span>`
      }).join("");
    });
  }


  submit(handlerSetId, handlerRequestAuthorization, handlerIsLoginValuesValid) {
    this.submitButton.addEventListener('click', (event) => {
      event.preventDefault();

      let id = this.idInput.value;

      console.log(id)

      if (handlerIsLoginValuesValid(id)) {
        handlerSetId(id);
        handlerRequestAuthorization(id);
      } else {
        alert('Preencha os campos necessários');
      }

    })
  };

} 