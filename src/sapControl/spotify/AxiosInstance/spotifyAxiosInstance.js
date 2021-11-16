import axios from 'axios';

import { uriEncode } from '../../helpers/helpers';
import * as SPOTIFY from '../../helpers/spotify/spotifyConstants';

export function SpotAxiosBuilder() {
  return {
    useAuthBuffer: function (authbuffer) {
      this.authbuffer = authbuffer;
      return this;
    },
    build: function () {
      return new spotAxios(this.authbuffer);
    },
  };
}

function spotAxios(authbuffer) {
  this.authBuffer = authbuffer;
  this.execute = axios.create({
    baseURL: SPOTIFY.API_BASE_URL,
  });
}

spotAxios.prototype.initialize = async function (postBody) {
  await this.getAccessToken(postBody);
  this.setSpotAxiosHeader();
  this.setSpotAxiosInterceptors();
};

spotAxios.prototype.getAccessToken = async function (postBody) {
  const accessTokenHeader = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': `Basic ${this.authBuffer}`,
    },
  };
  try {
    const response = await this.execute.post(
      'https://accounts.spotify.com/api/token',
      postBody,
      accessTokenHeader,
    );
    this._accessToken = response?.data?.access_token;
    this._refreshToken = response?.data?.refresh_token ?? this._refreshToken;
  } catch (err) {
    console.error('spotAxios.getAccessToken: Error');
    return Promise.reject(err);
  }
};

spotAxios.prototype.refreshAccessToken = async function () {
  console.info('Refreshing access token');
  const postBody = {
    grant_type: 'refresh_token',
    refresh_token: this._refreshToken,
  };
  await this.getAccessToken(uriEncode(postBody));
};

spotAxios.prototype.responseErrorInterceptor = async function (error) {
  console.error(
    `spotAxios response Error Interceptor : ${error.response.status}`,
  );

  const originalRequest = error.config;

  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    await this.refreshAccessToken();

    this.setSpotAxiosHeader();

    const refreshedHeader = {
      ...originalRequest.headers,
      Authorization: `Bearer ${this._accessToken}`,
    };

    return this.execute({
      ...originalRequest,
      headers: refreshedHeader,
    });
  }

  return Promise.reject(error);
};

// spotAxios.prototype.requestErrorInterceptor = function (error) {
//   console.error('Intercepted request error!');
//   console.error(error);
//   return Promise.reject(error.message);
// };

spotAxios.prototype.setSpotAxiosHeader = function () {
  this.execute.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${this._accessToken}`;
};

spotAxios.prototype.setSpotAxiosInterceptors = function () {
  this.execute.interceptors.response.use(
    function (response) {
      return response;
    },
    async (error) => this.responseErrorInterceptor(error),
  );
};
