import Carousel from "../components/Carousel.js";

export default class ProfileView {
  constructor() {
    this.profile = {
      // todo: tirar imageBox quando componentizar foto perfil
      imageBox: document.querySelector("[data-profile-image-box]"),
      image: document.querySelector("[data-profile-image]"),
      name: document.querySelector("[data-profile-name]"),
      country: document.querySelector("[data-profile-country]"),
      followers: document.querySelector("[data-profile-followers]"),
      product: document.querySelector("[data-profile-product]"),
    };

    this.contentScopes = {
      boxes: "[data-scope-box]",
      profile: "[data-scope-user-profile]",
      topArtists: "[data-scope-user-top-artists]",
      topTracks: "[data-scope-user-top-tracks]",
    };

    this.topArtists = {
      wrapper: document.querySelector('[data-ui-user-top-artists-wrapper]'),
      body: document.querySelector('[data-ui-user-top-artists-body]'),
      items: document.querySelectorAll('[data-ui-user-top-artists-items]'),
    }

    this.topTracks = {
      wrapper: document.querySelector('[data-ui-user-top-tracks-wrapper]'),
      body: document.querySelector('[data-ui-user-top-tracks-body]'),
      items: document.querySelectorAll('[data-ui-user-top-tracks-items]'),
    }

    this.carousels = Array.from(document.querySelectorAll('[data-carousel]'));

    document.addEventListener('DOMContentLoaded', () => {
      this.carousels.forEach(carousel => new Carousel(carousel));
    });

  };

  _addProfileResponsiveClass() {
    const selectorsToClasses = new Map([
      [this.profile.imageBox.querySelector(".placeholder"), ["scaled-container--responsive"]],
      [this.profile.name.querySelector(".placeholder"), ["box-width-10", "box-height-3"]],
      [this.profile.country.querySelector(".placeholder"), ["box-square-4"]],
      [this.profile.followers.querySelector(".placeholder"), ["box-square-4"]],
      [this.profile.product.querySelector(".placeholder"), ["box-square-4"]]
    ]);

    selectorsToClasses.forEach((classes, selector) => {
      selector.classList.add(...classes);
    });
  }


  _createCardPlaceholders(container, num) {

    if (!container) {
      console.error("Container element not found");
      return;
    }

    for (let i = 0; i < num; i++) {
      const div = document.createElement('div');
      div.className = 'box-square-10 col-2';
      div.setAttribute('data-scope-box', '');
      container.appendChild(div);
    }
  }

  _createPlaceholder() {
    var spanElement = document.createElement("span");

    spanElement.classList.add('display--inline-block');
    spanElement.classList.add('placeholder');

    return spanElement;
  };

  _getFirstLetter(str) {
    if (typeof str === 'string' && str.trim() !== '') {
      return str.trim().charAt(0).toUpperCase();
    } else {
      return null;
    }
  }

  _createProfileImageFigure(imgUrl, name = '') {
    let figure;

    if (imgUrl) {
      figure = document.createElement('figure');

      const img = document.createElement('img');
      img.setAttribute('data-profile-image', '');
      img.setAttribute('src', imgUrl);
      img.setAttribute('alt', 'foto de perfil');
      img.setAttribute('title', 'foto de perfil');

      figure.appendChild(img);

    } else {
      figure = document.createElement('div');
      figure.setAttribute('data-profile-image', '');
      figure.classList.add('img-default');

      const spanName = document.createElement('span');
      spanName.classList.add('img-default__letter');
      spanName.innerText = this._getFirstLetter(name);

      figure.appendChild(spanName);
    }

    this.profile.imageBox.appendChild(figure);

  }

  _createUserTopArtistsItems(imgUrl, title) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'col-2');
    cardDiv.setAttribute('data-carousel-item', '');
    cardDiv.setAttribute('data-ui-user-top-artists-items', '');

    const coverDiv = document.createElement('div');
    coverDiv.classList.add('card__cover');
    cardDiv.appendChild(coverDiv);

    const coverImg = document.createElement('img');
    coverImg.setAttribute('src', imgUrl);
    coverImg.setAttribute('alt', 'cover');
    coverImg.classList.add('card__cover__img');
    coverDiv.appendChild(coverImg);

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('card__title');
    titleSpan.textContent = title;
    cardDiv.appendChild(titleSpan);

    return cardDiv;
  }

  updateUserTopArtistsUI(array) {
    console.log(array)
    array.items.forEach(item => {
      const card = this._createUserTopArtistsItems(item.images[1].url, item.name);
      this.topArtists.body.appendChild(card.cloneNode(true));
    })
  }

  updateUserProfileUI(userData) {
    const { imgUrl, name, country, followers, product } = userData;

    this._createProfileImageFigure(imgUrl, name);

    this.profile.name.innerHTML = name;
    this.profile.country.innerHTML = country;
    this.profile.followers.innerHTML = followers;
    this.profile.product.innerHTML = product;
  };


  addPlaceholdersToScope(scope) {
    const scopeElement = document.querySelector(this.contentScopes[scope]);

    if (scope === 'topArtists') {
      this._createCardPlaceholders(scopeElement, 6);

    }

    const contentBoxes = scopeElement.querySelectorAll(this.contentScopes.boxes);
    const placeholderElement = this._createPlaceholder();

    contentBoxes.forEach((element) => {
      element.classList.add('placeholder-glow');
      element.appendChild(placeholderElement.cloneNode(true));

      if (scope === 'topArtists') {
        const placeholders = scopeElement.querySelectorAll('.placeholder');

        placeholders.forEach((placeholder) => {
          placeholder.style.width = '100%';
          placeholder.style.height = '100%';
        });
      }

    });

    scope === 'profile' ? this._addProfileResponsiveClass() : null;
  };

  removePlaceholdersFromScope(scope) {
    const scopeElement = document.querySelector(this.contentScopes[scope]);
    const contentBoxes = scopeElement.querySelectorAll(this.contentScopes.boxes);

    contentBoxes.forEach((element) => {
      element.classList.remove('placeholder-glow');
      const placeholder = element.querySelector('.placeholder');
      if (placeholder) {
        element.removeChild(placeholder);
      }
    });

    if (scope === 'topArtists') {
      contentBoxes.forEach((element) => {
        scopeElement.removeChild(element)
      });
    }

  }

}