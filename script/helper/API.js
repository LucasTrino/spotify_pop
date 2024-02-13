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

    console.log('Authorization Request OK!')
  }

  async fetchAccessToken(client_id, client_secret, code) {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=${this.redirect_uri}`;

    const data = await this.callAccessTokens(body, client_id, client_secret);

    return data;
  }

  async fetchRefreshAccessToken(refresh_token, client_id, client_secret) {
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;

    const data = await this.callAccessTokens(body, client_id, client_secret);
    return data;
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

      const data = await response.json();

      console.log("Success:", data);

      return data;

    } catch (error) {
      throw new Error('Error calling API: ' + error.message);
    }
  }

  async callAccessUser(token, refresh_token = null, client_id = null, client_secret = null) {
    try {
      const response = await fetch(this.endPoints.USER, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {

        const refreshedToken = await this.fetchRefreshAccessToken(refresh_token, client_id, client_secret);

        return this.callAccessUser(refreshedToken.access_token);
      }

      const data = await response.json();

      console.log("Success:", data);

      return data;

    } catch (error) {
      throw new Error('Error calling API: ' + error.message);
    }
  }

  async callApi(method, url, callback, access_token, refresh_token, client_id, client_secret, body = null) {
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
      return await callback(response, refresh_token, client_id, client_secret);
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

  async handleUserTopItems(response, refresh_token, client_id, client_secret, type, limit, offset, time_range) {
    console.log(response)
    if (response.status === 200) {
      const data = await response.json();
      console.log(data);
      return data;
    } else if (response.status === 401) {
      const refreshedTokens = await this.fetchRefreshAccessToken(refresh_token, client_id, client_secret);
      const accessToken = refreshedTokens.access_token;
      const refreshToken = refreshedTokens.access_token;
      return await this.callUserTopsItems(accessToken, refreshToken, client_id, client_secret, type, limit, offset, time_range);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error occurred');
    }
  }

  async callUserTopsItems(access_token, refresh_token, client_id, client_secret, type, limit, offset, time_range) {
    const url = this.buildUserTopItemsUrl(type, limit, offset, time_range);
    return await this.callApi('GET', url, this.handleUserTopItems.bind(this), access_token, refresh_token, client_id, client_secret, null);
  }

}
