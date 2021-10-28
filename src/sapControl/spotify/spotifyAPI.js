import axios from 'axios';
import { searchType as SEARCHTYPE } from '../constants/enums';
import {
  sanitizeSpotifyPlayLists,
  configureSpotAxiosInstance,
  getSpotifyTrackSourceURL,
  getSpotifySearchUrl,
} from '../helpers/spotify/spotifyHelpers';
import { generateRandomString } from '../../server/utils';
import { uriEncode } from '../helpers/helpers';

const authUrl = {
  spotify: 'https://accounts.spotify.com/authorize',
};

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

    build: function () {
      return new spotifyAPI(this.authBuffer, this.clientId, this.redirectUrl);
    },
  };
}

function spotifyAPI(authBuffer, clientId, redirectUrl) {
  if (!clientId) {
    throw 'spotifyAPI cannot build object - clientId undefined or null.  Did you specify a clientId & clientSecret? with useCredentials()';
  }
  if (!redirectUrl) {
    throw 'spotifyAPI cannot build object - redirectUrl not defined or null.  Did you specify a redirectUrl with useRedirect()';
  }
  this.authBuffer = authBuffer;
  this.redirectUrl = redirectUrl;

  this.stateKey = 'spotify_auth_state';
  const state = generateRandomString(16);

  // spotify specific permissions
  const scope =
    'user-read-private user-read-email playlist-read-private user-modify-playback-state user-read-playback-state playlist-modify-public';

  const authParams = uriEncode({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    state: state,
    redirect_uri: redirectUrl,
  });

  const url = `${authUrl.spotify}?${authParams}`;

  this.accessToken = '';
  this.refreshToken = '';
  this.id = '';
  this.avatar = '';
  this.user = '';

  this.playLists = [];

  this.spotAxios = axios.create({
    baseURL: 'https://api.spotify.com/v1',
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
    // TODO - throw an error
    return { error: 'Failed to authenticate spotify' };
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

  res.redirect('/spotifycomplete');
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
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Authorization': `Basic ${this.authBuffer}`,
        },
      },
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
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Authorization': `Basic ${this.authBuffer}`,
        },
      },
    );

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token ?? this.refreshToken;

    this.spotAxios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${this.accessToken}`;
  } catch (err) {
    console.error(`Refresh Token error:\n ${err?.response?.statusText}`);
    return Promise.reject(err);
  }
};

// spotifyAPI.prototype.search = function (searchString, searchType) {

// }

spotifyAPI.prototype.getRandomSong = async function (
  searchString,
  searchType = SEARCHTYPE.TRACK,
) {
  const url = getSpotifySearchUrl(searchString, searchType);

  try {
    return await this.selectRandomSong(url);
  } catch (err) {
    console.error(`Get Random Song Error:`);
    console.error(`\n ${err}`);
    return Promise.reject(err);
    // return { error: err };
  }
};

spotifyAPI.prototype.selectRandomSong = async function (url, searchType) {
  let offset = 0;
  let { data } = await this.spotAxios.get(url);
  // let { data } = response;
  const totalSongs = data.tracks.total;
  console.log(`total songs = ${totalSongs}`);
  let songList = [];
  do {
    const randOffset = totalSongs < 1000 ? totalSongs : 980;
    offset = Math.floor(Math.random() * randOffset);
    console.log(`offset ${offset}`);
    ({ data } = await this.spotAxios.get(`${url}&offset=${offset}`));
    console.log(data);
    songList =
      searchType === SEARCHTYPE.ARTIST
        ? data.tracks.items.filter(
            (track) => track.artists[0].name === searchString,
          )
        : data.tracks.items;
  } while (songList.length === 0);
  const randomTrack = Math.floor(Math.random() * songList.length);
  return songList[randomTrack];
};
