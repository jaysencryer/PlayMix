import {
  authorize,
  configureSpotifyProfile,
  connect,
  getAccessToken,
  refreshAccessToken,
} from './spotifyAuth';

import {
  configureSpotAxiosInstance,
  createSpotAxiosInstance,
  responseErrorInterceptor,
  requestErrorInterceptor,
  setSpotAxiosHeader,
} from './spotifyAxiosInstance';

import { playSong } from './spotifyPlay';

import {
  getPlayLists,
  getAllUsersPlaylists,
  getTracks,
} from './spotifyPlayLists';

import { getRandomSong, selectRandomSpotifySong } from './spotifyRandom';

import {
  searchSpotify,
  searchSpotifySongs,
  searchSpotifyArtists,
} from './spotifySearch';

export function spotifyAPIBuilder() {
  return {
    useCredentials: function (clientId, clientSecret) {
      this.clientId = clientId;
      this.authBuffer = this.authBuffer = Buffer.from(
        `${clientId}:${clientSecret}`,
      ).toString('base64');
      return this;
    },

    useRedirect: function (redirectUrl) {
      this.redirectUrl = redirectUrl;
      return this;
    },

    useAuthorizedUrl: function (authorizedUrl) {
      this.authorizedUrl = authorizedUrl;
      return this;
    },

    build: function () {
      return new spotifyAPI(
        this.authBuffer,
        this.clientId,
        this.redirectUrl,
        this.authorizedUrl,
      );
    },
  };
}

function spotifyAPI(authBuffer, clientId, redirectUrl, authorizedUrl) {
  if (!clientId) {
    throw 'spotifyAPI cannot build object - clientId undefined or null.  Did you specify a clientId & clientSecret? with useCredentials()';
  }
  if (!redirectUrl) {
    throw 'spotifyAPI cannot build object - redirectUrl not defined or null.  Did you specify a redirectUrl with useRedirect()';
  }

  this.authBuffer = authBuffer;
  this.clientId = clientId;
  this.redirectUrl = redirectUrl;
  this.authorizedUrl = authorizedUrl ?? '/spotifycomplete';

  this.playLists = [];

  this.createSpotAxiosInstance();
}

spotifyAPI.prototype.getProfile = async function () {
  console.log(this);
  return {
    id: this.id,
    user: this.user,
    avatar: this.avatar,
    accessToken: this.accessToken,
    refreshToken: this.refreshToken,
  };
};

Object.assign(spotifyAPI.prototype, {
  authorize,
  configureSpotAxiosInstance,
  configureSpotifyProfile,
  connect,
  createSpotAxiosInstance,
  getAccessToken,
  getAllUsersPlaylists,
  getPlayLists,
  getRandomSong,
  getTracks,
  playSong,
  refreshAccessToken,
  requestErrorInterceptor,
  responseErrorInterceptor,
  searchSpotify,
  searchSpotifyArtists,
  searchSpotifySongs,
  selectRandomSpotifySong,
  setSpotAxiosHeader,
});
