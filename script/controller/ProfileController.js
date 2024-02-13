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

  storeTokensWithExpiration(data) {
    const currentTime = new Date().getTime();
    const expirationTime = currentTime + (data.expires_in * 1000);
    const expirationDate = new Date(expirationTime);
    const tokens = JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expiration_date: expirationDate
    });
    localStorage.setItem("sessionTokens", tokens);
  }


  saveProfileToLocalStorage(data) {
    const profileData = JSON.stringify(data);
    localStorage.setItem('userProfile', profileData);
  }

  saveCodeToLocalStorage() {
    const code = this.extractAuthorizationCodeFromUrl();
    localStorage.setItem("code", code);
  }

  getProfileFromLocalStorage() {
    const storedProfileData = localStorage.getItem('userProfile');
    return storedProfileData ? JSON.parse(storedProfileData) : null;
  }

  isTokenValid() {
    const
      storedTokensString = localStorage.getItem("sessionTokens"),
      storedTokens = JSON.parse(storedTokensString), currentTime = new Date().getTime(),
      expirationTime = new Date(storedTokens.expiration_date).getTime();
    return currentTime < expirationTime;
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
        } else if (!this.isTokenValid()) {
          await this.requestRefreshAccessTokens();
        }

        const accessToken = JSON.parse(localStorage.getItem('sessionTokens')).access_token;

        await this.fetchAndUpdateUserProfile(accessToken);

        await this.fetchAndUpdateUserTops(accessToken, 'artists', 10, 0, 'medium_term');

      } catch (error) {
        console.error('Error during page load:', error);
      } finally {
        this.saveProfileToLocalStorage(this.model.profile);
      }

    } else {
      window.location.href = 'http://127.0.0.1:5500';
    }
  }

  async requestAccessTokens() {
    const authorizationCode = this.extractAuthorizationCodeFromUrl();

    const storedUserData = JSON.parse(localStorage.getItem('userData'));

    const response = await this.api.fetchAccessToken(storedUserData.client_id, storedUserData.client_secret, authorizationCode);

    const data = await response.json();

    this.storeTokensWithExpiration(data);

    return data;
  }

  async requestRefreshAccessTokens() {
    try {
      const refreshToken = JSON.parse(localStorage.getItem('sessionTokens')).refresh_token;
      const clientId = JSON.parse(localStorage.getItem('userData')).client_id;
      const clientSecret = JSON.parse(localStorage.getItem('userData')).client_secret;

      const response = await this.api.fetchRefreshAccessToken(refreshToken, clientId, clientSecret);

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();

      this.storeTokensWithExpiration(data);

      return data;

    } catch (error) {
      throw error;
    }
  }

  async fetchAndUpdateUserProfile(accessToken) {
    try {
      this.view.addPlaceholdersToScope('profile');

      const response = await this.api.callAccessUser(accessToken);

      if (response.status !== 200) {
        if (response.status === 401) {
          const refreshedTokens = await this.requestRefreshAccessTokens();
          const refreshedAccessToken = refreshedTokens.access_token;

          await this.fetchAndUpdateUserProfile(refreshedAccessToken);
          return;
        } else {
          const profileData = this.getProfileFromLocalStorage();
          profileData ? this.view.updateUserProfileUI(profileData) : null;

          alert('Não foi possível atualizar seus dados de perfil');

          return;
        }
      }

      const data = await response.json();

      this.view.removePlaceholdersFromScope('profile');

      this.saveProfileToLocalStorage(this.model.profile);

      this.model.updateUserProfileProperties(data);
      this.view.updateUserProfileUI(this.model.profile);
    } catch (error) {
      throw error;
    }
  }

  async fetchAndUpdateUserTops(accessToken, type, limit, offset, range_time) {

    let data;

    try {
      this.view.addPlaceholdersToScope('topArtists');

      const response = await this.api.callUserTopsItems(accessToken, type, limit, offset, range_time);

      if (response.status !== 200) {
        if (response.status === 401) {
          const refreshedTokens = await this.requestRefreshAccessTokens();
          const refreshedAccessToken = refreshedTokens.access_token;

          await this.fetchAndUpdateUserTops(refreshedAccessToken, type, limit, offset, range_time);
          return;
        } else {
          alert('Não foi possível atualizar seus de top artistas');

          return;
        }
      }

      data = await response.json();

      this.view.removePlaceholdersFromScope('topArtists');

      this.model.updateUserTopArtists(data);
      this.view.updateUserTopArtistsUI(this.model.topArtists);
    } catch (error) {
      throw error;
    }
  }

}