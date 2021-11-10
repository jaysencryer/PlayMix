import axios from 'axios';

import * as SPOTIFY from '../helpers/spotify/spotifyConstants';

export const createSpotAxiosInstance = async function () {
  this.spotAxios = axios.create({
    baseURL: SPOTIFY.API_BASE_URL,
  });
};

export const responseErrorInterceptor = async function (error) {
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

    return this.spotAxios({
      ...originalRequest,
      headers: refreshedHeader,
    });
  }

  return Promise.reject(error);
};

export const requestErrorInterceptor = function (error) {
  console.error('Intercepted request error!');
  console.error(error);
  return Promise.reject(error.message);
};

export const setSpotAxiosHeader = function () {
  this.spotAxios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${this.accessToken}`;
};

export const configureSpotAxiosInstance = function () {
  this.setSpotAxiosHeader();

  this.spotAxios.interceptors.response.use(
    function (response) {
      return response;
    },
    async (error) => this.responseErrorInterceptor(error),
  );
};
