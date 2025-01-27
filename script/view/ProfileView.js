import Carousel from "../components/Carousel.js";
import { InvalidInputError } from "../entities/Errors.js";

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

  _createUserTops(imgUrl, title, scope, size = 'medium', type = null) {
    const cardDiv = document.createElement('div');
    cardDiv.setAttribute('alt', title);
    cardDiv.setAttribute('title', title);
    cardDiv.classList.add('card', `${size}`, `${size === 'small' ? 'col-1' : 'col-2'}`);
    cardDiv.setAttribute('data-carousel-item', '');

    if (scope === 'topArtists') {
      cardDiv.setAttribute('data-ui-user-top-artists-items', '');
    } else if (scope === 'topTracks') {
      cardDiv.setAttribute('data-ui-user-top-tracks-items', '');
    }

    const coverDiv = document.createElement('div');
    coverDiv.classList.add('card__cover');
    type ? coverDiv.classList.add(`${type}`) : null;
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

  updateUserTopsUI(array, scope) {
    if (!array || !Array.isArray(array.items)) {
      throw new InvalidInputError('Invalid input array for updateUserTopArtistsUI');
    }

    const { body } = this[scope];
    array.items.forEach(item => {
      let imageUrl;
      if (scope === 'topArtists') {
        imageUrl = item?.images[1]?.url;
      } else if (scope === 'topTracks') {
        imageUrl = item?.album?.images[1]?.url
      }
      const name = item.name;
      let card;
      if (scope === 'topArtists') {
        card = this._createUserTops(imageUrl, name, scope, 'small', 'rounded');
      } else if (scope === 'topTracks') {
        card = this._createUserTops(imageUrl, name, scope);
      }
      body.appendChild(card);
    });
  }

  updateUserProfileUI(data) {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new InvalidInputError('Invalid user profile data for updateUserProfileUI');
    }

    const { imgUrl, name, country, followers, product } = data;

    if (!imgUrl || typeof imgUrl !== 'string' || !name || typeof name !== 'string' ||
      !country || typeof country !== 'string' || followers === undefined || typeof followers !== 'number' ||
      !product || typeof product !== 'string') {
      throw new InvalidInputError('Invalid user profile data for updateUserProfileUI');
    }

    this._createProfileImageFigure(imgUrl, name);

    this.profile.name.innerHTML = name;
    this.profile.country.innerHTML = country;
    this.profile.followers.innerHTML = followers;
    this.profile.product.innerHTML = product;
  }

  addPlaceholdersToScope(scope) {
    const scopeElement = document.querySelector(this.contentScopes[scope]);

    if (scope === 'topArtists' || scope === 'topTracks') {
      this._createCardPlaceholders(scopeElement, 6);

    }

    const contentBoxes = scopeElement.querySelectorAll(this.contentScopes.boxes);
    const placeholderElement = this._createPlaceholder();

    contentBoxes.forEach((element) => {
      element.classList.add('placeholder-glow');
      element.appendChild(placeholderElement.cloneNode(true));

      if (scope === 'topArtists' || scope === 'topTracks') {
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

    if (scope === 'topArtists' || scope === 'topTracks') {
      contentBoxes.forEach((element) => {
        scopeElement.removeChild(element)
      });
    }

  }

  addErrorToScope(message, scope) {
    const errorBox = document.createElement('div');
    errorBox.classList.add('error__box');

    const errorContent = document.createElement('div');
    errorContent.classList.add('error__content');

    const errorIcon = document.createElement('span');
    errorIcon.classList.add('material-symbols-outlined', 'icon-04', 'icon');
    errorIcon.textContent = 'error';

    const errorMessage = document.createElement('span');
    errorMessage.textContent = message;

    errorContent.appendChild(errorIcon);
    errorContent.appendChild(errorMessage);
    errorBox.appendChild(errorContent);

    document.querySelector(this.contentScopes[scope]).appendChild(errorBox)
  }

}