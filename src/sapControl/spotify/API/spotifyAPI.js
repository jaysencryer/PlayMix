import {
  authorize,
  configureSpotifyProfile,
  connect,
  getAccessToken,
  refreshAccessToken,
} from '../Auth/spotifyAuth';

import { SpotAxiosBuilder } from '../AxiosInstance/spotifyAxiosInstance';

import { playSong } from '../Play/spotifyPlay';

import {
  addSpotifyPlayList,
  getPlayLists,
  getAllUsersPlaylists,
  getTracks,
} from '../PlayLists/spotifyPlayLists';

import {
  getRandomSong,
  selectRandomSpotifySong,
} from '../Random/spotifyRandom';

import {
  searchSpotify,
  searchSpotifySongs,
  searchSpotifyArtists,
} from '../Search/spotifySearch';

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

  this.clientId = clientId;
  this.redirectUrl = redirectUrl;
  this.authorizedUrl = authorizedUrl ?? '/spotifycomplete';
  this.authBuffer = authBuffer;

  this.playLists = [];

  // this.spotAxios = SpotAxiosBuilder().useAuthBuffer(authBuffer).build();
}

spotifyAPI.prototype.getProfile = function () {
  return {
    id: this.userId,
    user: this.user,
    avatar: this.avatar,
    accessToken: this.accessToken,
    refreshToken: this.refreshToken,
  };
};

Object.assign(spotifyAPI.prototype, {
  addSpotifyPlayList,
  authorize,
  configureSpotifyProfile,
  connect,
  getAccessToken,
  getAllUsersPlaylists,
  getPlayLists,
  getRandomSong,
  getTracks,
  playSong,
  refreshAccessToken,
  searchSpotify,
  searchSpotifyArtists,
  searchSpotifySongs,
  selectRandomSpotifySong,
});
