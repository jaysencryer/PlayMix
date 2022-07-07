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

export function spotifyClientBuilder() {
  return {
    useTokens: function (accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      return this;
    },

    build: function () {
      return new spotifyClient(this.accessToken, this.refreshToken);
    },
  };
}

function spotifyClient(accessToken, refreshToken) {
  if (!accessToken) {
    throw 'spotifyClient cannot build object - no accessToken.  Did you specify an accessToken with useTokens()';
  }
  if (!refreshToken) {
    throw 'spotifyClient cannot build object - no refreshToken.  Did you specify a refreshToken with useTokens()';
  }

  this.accessToken = accessToken;
  this.refreshToken = refreshToken;

  this.playLists = [];
  this.spotAxios = SpotAxiosBuilder()
    .useTokens(this.accessToken, this.refreshToken)
    .build();
  this.configureSpotifyProfile();
}

spotifyClient.prototype.configureSpotifyProfile = async function () {
  const profile = await this.spotAxios.execute.get('/me');
  ({ id: this.userId, display_name: this.user } = profile.data);
  this.avatar = profile.data.images[0].url;
};

Object.assign(spotifyClient.prototype, {
  addSpotifyPlayList,
  getAllUsersPlaylists,
  getPlayLists,
  getRandomSong,
  getTracks,
  playSong,
  searchSpotify,
  searchSpotifyArtists,
  searchSpotifySongs,
  selectRandomSpotifySong,
});
