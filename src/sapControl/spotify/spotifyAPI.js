import axios from 'axios';

import { searchType as SEARCHTYPE } from '../constants/enums';

import {
  generateRandomString,
  randomFloored,
  randomItem,
  uriEncode,
} from '../helpers/helpers';

import {
  configureSpotAxiosInstance,
  filterSpotifySongsByType,
  getSpotifySearchUrlByType,
  getSpotifySongSearchUrl,
  getSpotifyTrackSourceURL,
  sanitizeSpotifyPlayLists,
  sanitizedSpotifySongList,
  setSpotAxiosHeader,
} from '../helpers/spotify/spotifyHelpers';

import * as SPOTIFY from '../helpers/spotify/spotifyConstants';

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
  this.redirectUrl = redirectUrl;
  this.authorizedUrl = authorizedUrl ?? '/spotifycomplete';

  this.accessTokenHeader = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': `Basic ${this.authBuffer}`,
    },
  };

  this.stateKey = 'spotify_auth_state';
  const state = generateRandomString(16);

  // spotify specific permissions
  const scope = SPOTIFY.SCOPE;

  const authParams = uriEncode({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    state: state,
    redirect_uri: redirectUrl,
  });

  const url = `${SPOTIFY.AUTHURL}?${authParams}`;

  this.accessToken = '';
  this.refreshToken = '';
  this.id = '';
  this.avatar = '';
  this.user = '';

  this.playLists = [];

  this.spotAxios = axios.create({
    baseURL: SPOTIFY.API_BASE_URL,
  });

  this.connect = function (req, res) {
    res.cookie(this.stateKey, state);
    res.redirect(url);
  };
}

spotifyAPI.prototype.getProfile = async function () {
  return {
    id: this.id,
    user: this.user,
    avatar: this.avatar,
    accessToken: this.accessToken,
    refreshToken: this.refreshToken,
  };
};

spotifyAPI.prototype.authorize = async function (req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[this.stateKey] : null;

  if (state === null || state !== storedState) {
    console.error('Failed to authenticate spotify');
    return Promise.reject('Failed to authenticate Spotify');
  }

  const tokenBody = {
    code,
    redirect_uri: this.redirectUrl,
    grant_type: 'authorization_code',
  };

  const formBody = uriEncode(tokenBody);
  const spotifyToken = await this.getAccessToken(formBody);

  // TODO - does getAccessToken throw?

  if ('error' in spotifyToken) {
    console.error('Failed to retrieve spotify Token');
    return { error: 'Failed to retrieve spotify Token' };
  }

  this.accessToken = spotifyToken.access_token;
  this.refreshToken = spotifyToken.refresh_token;

  configureSpotAxiosInstance(this);

  const profile = await this.spotAxios.get('/me');
  ({ id: this.id, display_name: this.user } = profile.data);
  this.avatar = profile.data.images[0].url;

  res.redirect(this.authorizedUrl);
};

spotifyAPI.prototype.responseErrorInterceptor = async function (
  error,
  APIobject,
) {
  console.error(
    `spotAxios response Error Interceptor : ${error.response.status}`,
  );

  const originalRequest = error.config;

  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    await APIobject.refreshAccessToken();

    const refreshedHeader = {
      ...originalRequest.headers,
      Authorization: `Bearer ${APIobject.accessToken}`,
    };

    return APIobject.spotAxios({
      ...originalRequest,
      headers: refreshedHeader,
    });
  }

  return Promise.reject(error);
};

spotifyAPI.prototype.requestErrorInterceptor = function (error) {
  console.error('Intercepted request error!');
  console.error(error);
  return Promise.reject(error.message);
};

spotifyAPI.prototype.playSong = async function (uriList) {
  try {
    await this.spotAxios.put('/me/player/play', { uris: uriList });
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.getPlayLists = async function () {
  try {
    await this.getAllUsersPlaylists();
    return this.playLists;
  } catch (err) {
    console.error(`Error retrieving playLists`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.getAllUsersPlaylists = async function () {
  let totalPlaylists = 0;
  let offsetParm = '';
  let offset = 0;
  let limit = 50;

  do {
    const { data } = await this.spotAxios.get(
      `/me/playlists?limit=${limit}${offsetParm}`,
    );

    totalPlaylists = data.total;

    if (this.playLists.length === totalPlaylists) return; // playlists haven't changed

    offset += 50;
    limit = offset + limit > totalPlaylists ? totalPlaylists - offset : 50;

    this.playLists = [
      ...this.playLists,
      ...sanitizeSpotifyPlayLists(data?.items),
    ];

    offsetParm = `&offset=${offset}`;
  } while (this.playLists.length < totalPlaylists);
};

spotifyAPI.prototype.getTracks = async function (trackSource, sourceUri) {
  const url = getSpotifyTrackSourceURL(trackSource, sourceUri);

  try {
    const response = await this.spotAxios.get(url);
    return response.data;
  } catch (err) {
    console.error(`Error getting ${trackSource} tracks`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.getAccessToken = async function (formBody) {
  try {
    const response = await this.spotAxios.post(
      'https://accounts.spotify.com/api/token',
      formBody,
      this.accessTokenHeader,
    );
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  } catch (err) {
    console.error('spotifyAPI.getAccessToken: Error');
    console.error(err?.response?.statusText);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.refreshAccessToken = async function () {
  console.info('Refreshing access token');

  try {
    const response = await this.spotAxios.post(
      'https://accounts.spotify.com/api/token',
      uriEncode({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
      this.accessTokenHeader,
    );

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token ?? this.refreshToken;

    setSpotAxiosHeader(this);
  } catch (err) {
    console.error(`Refresh Token error:\n ${err?.response?.statusText}`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.searchSpotifySongs = async function (
  searchString,
  searchType = SEARCHTYPE.TRACK,
) {
  const url = getSpotifySongSearchUrl(searchString, searchType);

  try {
    const { data } = await this.spotAxios.get(url);
    return sanitizedSpotifySongList(data);
  } catch (err) {
    console.error(`Search Spotify Songs Error:`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.searchSpotifyArtists = async function (searchString) {
  const url = getSpotifySearchUrlByType(searchString, SEARCHTYPE.ARTIST);
  try {
    const { data } = await this.spotAxios.get(url);
    const artistList = data.artists.items.map((artist) => ({
      name: artist.name,
    }));
    return artistList;
  } catch (err) {
    console.error(`Search Spotify Artists Error:`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.searchSpotify = async function (
  searchString,
  searchType,
  byType = false,
) {
  switch (searchType) {
    case SEARCHTYPE.ARTIST: {
      if (byType) {
        return await this.searchSpotifyArtists(searchString);
      }
      return await this.searchSpotifySongs(searchString, SEARCHTYPE.ARTIST);
    }
    case SEARCHTYPE.TRACK: {
      return await this.searchSpotifySongs(searchString);
    }
    default: {
      return await this.searchSpotifySongs('Never Gonna give You Up');
    }
  }
};

spotifyAPI.prototype.getRandomSong = async function (
  searchString = generateRandomString(2),
  searchType = SEARCHTYPE.TRACK,
) {
  try {
    return await this.selectRandomSpotifySong(searchString, searchType);
  } catch (err) {
    console.error(`Get Random Song Error:`);
    console.error(`\n ${err}`);
    return Promise.reject(err);
  }
};

spotifyAPI.prototype.selectRandomSpotifySong = async function (
  searchString,
  searchType,
) {
  const url = getSpotifySongSearchUrl(searchString, searchType);

  let totalSongs;
  let offset = 0;
  let songList = [];

  do {
    let { data } = await this.spotAxios.get(`${url}&offset=${offset}`);

    // This is skipped first time through
    if (totalSongs) {
      songList = filterSpotifySongsByType(
        data.tracks.items,
        searchString,
        searchType,
      );
    }
    totalSongs = totalSongs ?? data.tracks.total;
    console.log(`totalSongs = ${totalSongs}`);
    const randOffsetSize = totalSongs < 1000 ? totalSongs : 950;
    offset = randomFloored(randOffsetSize);
  } while (songList.length === 0);

  return randomItem(songList);
};
