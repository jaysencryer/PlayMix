import axios from 'axios';

import { uriEncode } from '../../helpers/helpers';
import * as SPOTIFY from '../../helpers/spotify/spotifyConstants';

export function SpotAxiosBuilder() {
  return {
    useTokens: function (accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return this;
    },

    build: function () {
      return new spotAxios(this.accessToken, this.refreshToken);
    },
  };
}

function spotAxios(accessToken, refreshToken) {
  this.accessToken = accessToken;
  this.refreshToken = refreshToken;
  this.execute = axios.create({
    baseURL: SPOTIFY.API_BASE_URL,
  });
  this.setSpotAxiosHeader();
  this.setSpotAxiosInterceptors();
}

// spotAxios.prototype.initialize = async function (postBody) {
// const { accessToken, refreshToken } = await this.getAccessToken(postBody);
// this.setSpotAxiosInterceptors();
// return { accessToken, refreshToken };
// };

// spotAxios.prototype.getAccessToken = async function (postBody) {
//   const accessTokenHeader = {
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
//       'Authorization': `Basic ${this.authBuffer}`,
//     },
//   };
//   try {
//     const response = await this.execute.post(
//       'https://accounts.spotify.com/api/token',
//       postBody,
//       accessTokenHeader,
//     );
//     // don't store it in server!
//     // this._accessToken = response?.data?.access_token;
//     // this._refreshToken = response?.data?.refresh_token ?? this._refreshToken;
//     return {
//       accessToken: response?.data?.access_token,
//       refreshToken: response?.data?.refresh_token,
//     };
//   } catch (err) {
//     console.error('spotAxios.getAccessToken: Error');
//     return Promise.reject(err);
//   }
// };

spotAxios.prototype.refreshAccessToken = async function () {
  console.info('SpotAxios - Refreshing access token');
  // const postBody = {
  //   grant_type: 'refresh_token',
  //   refresh_token: refreshToken,
  // };
  // const { refreshToken, accessToken } = await axios.get('/refreshToken');
  const { data } = await axios.get('/refreshToken');
  this.accessToken = data?.accessToken || this.accessToken;
  this.refreshToken = data?.refreshToken || this.refreshToken;
  // console.log(this);
  // await this.getAccessToken(uriEncode(postBody));
};

// TO DO - how do we make this take in an access token....
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
      Authorization: `Bearer ${this.accessToken}`,
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
  ] = `Bearer ${this.accessToken}`;
};

spotAxios.prototype.setSpotAxiosInterceptors = function () {
  this.execute.interceptors.response.use(
    function (response) {
      return response;
    },
    async (error) => this.responseErrorInterceptor(error),
  );
};
