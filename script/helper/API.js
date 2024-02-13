export default class API {
  constructor() {
    this.redirect_uri = "http://127.0.0.1:5500/views/profile.html";

    this.endPoints = {
      AUTHORIZE: "https://accounts.spotify.com/authorize",
      TOKEN: "https://accounts.spotify.com/api/token",
      USER: "https://api.spotify.com/v1/me",
      USER_TOPS: "https://api.spotify.com/v1/me/top",
    }
  }

  requestAuthorization(client_id) {
    let url = this.endPoints.AUTHORIZE;
    url += '?client_id=' + client_id;
    url += '&response_type=code';
    url += '&redirect_uri=' + encodeURI(this.redirect_uri);
    url += '&show_dialog=true';
    url += '&scope=user-read-private user-read-email user-top-read user-library-read';
    window.location.href = url;
  }

  async fetchAccessToken(client_id, client_secret, code) {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${this.redirect_uri}`;

    const response = await this.callAccessTokens(body, client_id, client_secret);

    return response;
  }

  async fetchRefreshAccessToken(refresh_token, client_id, client_secret) {

    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;

    const response = await this.callAccessTokens(body, client_id, client_secret);

    return response;
  }

  async callAccessTokens(body, client_id, client_secret) {
    try {
      const response = await fetch(this.endPoints.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`)}`
        },
        body: body,
      });

      return response;

    } catch (error) {
      throw new Error('Error calling API: ' + error.message);
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
      throw new Error('Error calling API: ' + error.message);
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
      throw new Error('Error calling API: ' + error.message);
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
