import axios from 'axios';

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

  console.log(this.execute.interceptors);
}

spotAxios.prototype.refreshAccessToken = async function () {
  // console.info('SpotAxios - Refreshing access token');
  const { data } = await axios.get('/refreshToken');
  this.accessToken = data?.accessToken;
  this.refreshToken = data?.refreshToken || this.refreshToken;
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
