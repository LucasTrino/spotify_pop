import API from "../helper/API.js";
import URL from "../entities/URL.js";

export default class ProfileController {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.api = new API();

    this.URL = new URL();

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
        if (!JSON.parse(localStorage.getItem('userData')).client_id) {
          window.location.href = this.URL.default;
        } else if (!localStorage.getItem('sessionTokens')) {
          await this.requestAccessTokens();
        }

        const accessToken = JSON.parse(localStorage.getItem('sessionTokens')).access_token;

        await this.fetchAndUpdateUserProfile(accessToken);

        await this.fetchAndUpdateUserTops(accessToken, 'topArtists', 'artists', 10, 0, 'medium_term');
        await this.fetchAndUpdateUserTops(accessToken, 'topTracks', 'tracks', 10, 0, 'medium_term');

      } catch (error) {
        console.error('Error during page load:', error);
      }

    } else {
      window.location.href = this.URL.default;
    }
  }

  //Retry Pattern
  async requestAccessTokens(retryCount = 0) {
    const MAX_RETRIES = 3;
    try {
      const authorizationCode = this.extractAuthorizationCodeFromUrl();
      let codeVerifier = localStorage.getItem('codeVerifier')

      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (!storedUserData || !storedUserData.client_id) {
        throw new Error('Missing or invalid stored user data.');
      }

      const response = await this.api.fetchAccessToken(authorizationCode, storedUserData.client_id, codeVerifier);
      if (!response.ok) {
        throw new Error(`Failed to fetch access token. Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.access_token || !data.refresh_token || !data.expires_in) {
        throw new Error('Invalid access token data received.');
      }

      this.storeTokensWithExpiration(data);

      return data;
    } catch (error) {
      console.error('Error fetching access tokens:', error);
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.requestAccessTokens(retryCount + 1);
      }
      // else {
      //   window.location.href = this.URL.default;
      // }
    }
  }

  //todo: ancapsular lógica retry em um método independente

  //Retry Pattern
  async requestRefreshAccessTokens(retryCount = 0) {
    const MAX_RETRIES = 3;
    try {
      const refreshToken = JSON.parse(localStorage.getItem('sessionTokens')).refresh_token;
      const clientId = JSON.parse(localStorage.getItem('userData')).client_id;

      const response = await this.api.fetchRefreshAccessToken(refreshToken, clientId);

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();

      this.storeTokensWithExpiration(data);

      return data;

    } catch (error) {
      console.error('Error refreshing access tokens:', error);
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);

        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.requestRefreshAccessTokens(retryCount + 1);
      } else {
        throw new Error('Maximum retry limit reached');
      }
    }
  }

  //Retry Pattern
  async fetchAndUpdateUserProfile(accessToken, retryCount = 0) {
    const MAX_RETRIES = 3;

    if (retryCount === 0) {
      this.view.addPlaceholdersToScope('profile');
    }

    try {
      const response = await this.api.callAccessUser(accessToken);

      if (response.status !== 200) {
        if (response.status === 401) {
          const refreshedTokens = await this.requestRefreshAccessTokens();
          const refreshedAccessToken = refreshedTokens.access_token;

          await this.fetchAndUpdateUserProfile(refreshedAccessToken);
          return;

        } else {
          const profileData = this.getProfileFromLocalStorage();

          if (profileData) {
            this.view.updateUserProfileUI(profileData);
          } else {
            throw new Error(`Failed to fetch user profile data. Server responded with status ${response.status}`);
          }
        }
      }

      const data = await response.json();

      this.view.removePlaceholdersFromScope('profile');

      this.saveProfileToLocalStorage(data);

      this.model.updateUserProfileProperties(data);
      this.view.updateUserProfileUI(this.model.profile);

    } catch (error) {

      console.error('Error fetching and updating user profile:', error);

      if (retryCount < MAX_RETRIES) {

        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.fetchAndUpdateUserProfile(accessToken, retryCount + 1);

      } else {
        alert('Não foi possível atualizar seus dados de perfil');
      }

    }
  }

  //Retry Pattern
  async fetchAndUpdateUserTops(accessToken, scope, type, limit, offset, range_time, retryCount = 0) {
    const MAX_RETRIES = 3;

    if (retryCount === 0) {
      this.view.addPlaceholdersToScope(scope);
    }

    try {
      const response = await this.api.callUserTopsItems(accessToken, type, limit, offset, range_time);

      if (response.status !== 200) {
        if (response.status === 401) {
          const refreshedTokens = await this.requestRefreshAccessTokens();
          const refreshedAccessToken = refreshedTokens.access_token;

          await this.fetchAndUpdateUserTops(refreshedAccessToken, type, limit, offset, range_time);
          return;
        } else {
          throw new Error(`Failed to fetch data. Server responded with status ${response.status}`);
        }
      }

      const data = await response.json();

      this.view.removePlaceholdersFromScope(scope);

      this.model.updateUserTops(data, scope);
      this.view.updateUserTopsUI(this.model[scope], scope);
    } catch (error) {
      console.error('Error fetching and updating user tops:', error);
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.fetchAndUpdateUserTops(accessToken, type, limit, offset, range_time, retryCount + 1);
      } else {
        this.view.removePlaceholdersFromScope(scope);
        if (error instanceof RequestFailedError) {
          console.error('Request failed:', error);
          this.view.addErrorToScope('Não foi possível retornar os dados.', scope);
        } else if (error instanceof MissingDataError) {
          console.error('Missing data error:', error);
          this.view.addErrorToScope('Parece que você não tem artistas favoritos.', scope);
        } else {
          console.error('Unknown error:', error);
          this.view.addErrorToScope('Não foi possível retornar os dados.', scope);
        }
      }
    }
  }


}