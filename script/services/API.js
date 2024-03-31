import { RequestFailedError } from "../entities/Errors.js";

export default class API {
  constructor() {
    this.redirect_uri = "http://127.0.0.1:5500/views/profile.html";

    this.code_challenge_method = 'S256';

    this.scopes = 'user-read-private user-read-email user-top-read user-library-read';

    this.endPoints = {
      AUTHORIZE: "https://accounts.spotify.com/authorize",
      TOKEN: "https://accounts.spotify.com/api/token",
      USER: "https://api.spotify.com/v1/me",
      USER_TOPS: "https://api.spotify.com/v1/me/top",
    }
  }

  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  async sha256(plain) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async requestAuthorization(client_id) {
    const codeVerifier = this.generateRandomString(64),
      hashed = await this.sha256(codeVerifier),
      codeChallenge = this.base64encode(hashed);

    console.log(client_id);

    localStorage.setItem("codeVerifier", codeVerifier);

    let url = this.endPoints.AUTHORIZE;
    url += '?client_id=' + client_id;
    url += '&response_type=code';
    url += '&code_challenge_method=' + this.code_challenge_method;
    url += '&code_challenge=' + codeChallenge;
    url += '&redirect_uri=' + encodeURI(this.redirect_uri);
    url += '&show_dialog=true';
    url += '&scope=' + this.scopes;

    window.location.href = url;

  }

  async fetchAccessToken(code, client_id, code_verifier) {

    let body = 'client_id=' + client_id;
    body += '&grant_type=authorization_code';
    body += '&code=' + code;
    body += '&redirect_uri=' + encodeURI(this.redirect_uri);
    body += '&code_verifier=' + code_verifier;


    const response = await this.callAccessTokens(body);

    return response;
  }

  async fetchRefreshAccessToken(refresh_token, client_id) {

    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;

    const response = await this.callAccessTokens(body);

    return response;
  }

  async callAccessTokens(body) {

    try {
      const response = await fetch(this.endPoints.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      return response;

    } catch (error) {
      throw new RequestFailedError(`Token Request failed: ${error.message}`);
    }
  }

  async callAccessUser(token) {
    try {
      const response = await fetch(this.endPoints.USER, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response;

    } catch (error) {
      throw new RequestFailedError(`Access User Request failed: ${error.message}`);
    }
  }

  async callApi(method, url, access_token, body = null) {
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      },
    };

    if (body !== null) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      throw new RequestFailedError(`API Request failed: ${error.message}`);
    }
  }

  buildUserTopItemsUrl(type, limit, offset, time_range = 'medium_term') {
    let url = this.endPoints.USER_TOPS;
    url += `/${type}`;
    url += '?time_range=' + time_range;
    url += '&limit=' + limit;
    url += '&offset=' + offset;

    return url
  }

  async callUserTopsItems(access_token, type, limit, offset, time_range) {
    const url = this.buildUserTopItemsUrl(type, limit, offset, time_range);
    return await this.callApi('GET', url, access_token);
  }

}
