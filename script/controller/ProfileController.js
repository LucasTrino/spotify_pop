import API from "../helper/API.js";

export default class ProfileController {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.api = new API();

    this.pageLoad();

    const storedUserData = localStorage.getItem('userData');
    this.data = storedUserData ? JSON.parse(storedUserData) : {};
  }

  saveTokensToLocalStorage(data) {
    localStorage.setItem("sessionTokens", JSON.stringify({ access_token: data.access_token, refresh_token: data.refresh_token, token_type: data.token_type, expires_in: data.expires_in })); // Não deixar o secret visível em uma aplicação real
  }

  saveProfileToLocalStorage(data) {
    const profileData = JSON.stringify(data);
    localStorage.setItem('userProfile', profileData);
  }

  saveCodeToLocalStorage() {
    localStorage.setItem("code", this.extractAuthorizationCodeFromUrl());
  }

  getProfileFromLocalStorage() {
    const storedProfileData = localStorage.getItem('userProfile');
    return storedProfileData ? JSON.parse(storedProfileData) : null;
  }

  isTokenValid(token) {
    if (!token || !token.expiration_time_token) {
      return false;
    }

    const currentTimeToken = Math.floor(Date.now() / 1000);
    const expirationTimeToken = token.expiration_time_token + token.expires_in;

    return expirationTimeToken > currentTimeToken;
  }

  extractAuthorizationCodeFromUrl() {
    let authorizationCode = null;
    const queryString = window.location.search;

    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);
      authorizationCode = urlParams.get('code');
    }

    return authorizationCode;
  }

  async pageLoad() {
    if (window.location.search.length > 0) {

      this.saveCodeToLocalStorage();

      try {
        if (!localStorage.getItem('sessionTokens')) {
          await this.requestAccessTokens();
        }
        // else {
        //   console.log('refresh')
        //   await this.requestRefreshAccessTokens();
        // }

        const accessToken = JSON.parse(localStorage.getItem('sessionTokens')).access_token;

        await this.fetchAndUpdateUserProfile(accessToken);

        // await this.fetchAndUpdateUserTops(accessToken, 'artists', 10, 0, 'medium_term');

      } catch (error) {
        console.error('Error during page load:', error);
      } finally {
        this.saveProfileToLocalStorage(this.model.profile);
      }

      //  else {
      //   const profileData = this.getProfileFromLocalStorage();
      //   profileData ? this.view.updateUserProfileUI(profileData) : null;
      // }

    } else {
      window.location.href = 'http://127.0.0.1:5500';
    }
  }

  async requestAccessTokens() {
    const authorizationCode = this.extractAuthorizationCodeFromUrl();

    const storedUserData = JSON.parse(localStorage.getItem('userData'));

    const accessTokensData = await this.api.fetchAccessToken(storedUserData.client_id, storedUserData.client_secret, authorizationCode);

    this.saveTokensToLocalStorage(accessTokensData);
  }


  async fetchAndUpdateUserProfile(accessToken) {

    let userData;

    try {
      this.view.addPlaceholdersToScope('profile');

      const refreshToken = JSON.parse(localStorage.getItem('sessionTokens')).refresh_token;
      const clientId = JSON.parse(localStorage.getItem('userData')).client_id;
      const clientSecret = JSON.parse(localStorage.getItem('userData')).client_secret;

      userData = await this.api.callAccessUser(accessToken, refreshToken, clientId, clientSecret);

      this.view.removePlaceholdersFromScope('profile');

      this.saveProfileToLocalStorage(this.model.profile);
    } catch (error) {
      throw error;
    } finally {
      this.model.updateUserProfileProperties(userData);
      this.view.updateUserProfileUI(this.model.profile);
    }
  }

  async fetchAndUpdateUserTops(accessToken, type, limit, offset, range_time) {

    let topArtists;

    try {
      this.view.addPlaceholdersToScope('topArtists');

      const refreshToken = JSON.parse(localStorage.getItem('sessionTokens')).refresh_token;
      const clientId = JSON.parse(localStorage.getItem('userData')).client_id;
      const clientSecret = JSON.parse(localStorage.getItem('userData')).client_secret;

      topArtists = await this.api.callUserTopsItems(accessToken, refreshToken, clientId, clientSecret, type, limit, offset, range_time);

      this.view.removePlaceholdersFromScope('topArtists');

    } catch (error) {
      throw error;
    } finally {
      this.model.updateUserTopArtists(topArtists);
      this.view.updateUserTopArtistsUI(this.model.topArtists);
    }
  }

}