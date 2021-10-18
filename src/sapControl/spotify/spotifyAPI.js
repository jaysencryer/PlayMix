import axios from 'axios';
import { searchType, source } from '../../constants/enums';
import { sanitizePlayLists } from '../helpers/helpers';
import { uriEncode, generateRandomString } from '../../server/utils';
import CommunicationStayPrimaryLandscape from 'material-ui/svg-icons/communication/stay-primary-landscape';

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

  // headers: { Authorization: `Bearer ${this.accessToken}` },
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
    return { error: 'Failed to authenticate spotify' };
  }

  const tokenBody = {
    code,
    redirect_uri: this.redirectUrl,
    grant_type: 'authorization_code',
  };

  const formBody = uriEncode(tokenBody);
  const spotifyToken = await this.getAccessToken(formBody);

  if ('error' in spotifyToken) {
    console.error('Failed to retrieve spotify Token');
    return { error: 'Failed to retrieve spotify Token' };
  }

  this.accessToken = spotifyToken.access_token;
  this.refreshToken = spotifyToken.refresh_token;
  this.spotAxios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${this.accessToken}`;
  this.spotAxios.interceptors.response.use(function (response) {
    return response;
  }, this.responseErrorInterceptor);

  this.spotAxios.interceptors.request.use(
    (response) => response,
    this.requestErrorInterceptor,
  );

  const profile = await this.spotAxios.get('/me');
  ({ id: this.id, display_name: this.user } = profile.data);
  this.avatar = profile.data.images[0].url;

  res.redirect('/spotifycomplete');
};

spotifyAPI.prototype.responseErrorInterceptor = function (error) {
  console.error('Intercepted an error!');
  console.error(error.response.status);
  // const errorData = error.response.data;
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    this.refreshAccessToken();
    // somehow try again?
    return this.spotAxios(originalRequest);
  }
  return Promise.reject(error.response.data.error);
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
  let totalPlaylists = 0;
  let offsetParm = '';
  let offset = 0;
  let limit = 50;

  try {
    do {
      const response = await this.spotAxios.get(
        `/me/playlists?limit=${limit}${offsetParm}`,
      );
      // TODO error checking?
      const { data } = response;
      totalPlaylists = data.total;
      if (this.playLists.length === totalPlaylists) break; // playlists haven't changed
      offset += 50;
      limit = offset + limit > totalPlaylists ? totalPlaylists - offset : 50;
      this.playLists = [...this.playLists, ...sanitizePlayLists(data?.items)];
      offsetParm = `&offset=${offset}`;
    } while (this.playLists.length < totalPlaylists);

    return this.playLists;
  } catch (err) {
    console.error(`Error retrieving playLists`);
    console.error(err);
    return { error: err };
  }
};

spotifyAPI.prototype.getTracks = async function (trackSource, uri) {
  // Just doing playlists right now
  let url;
  switch (trackSource) {
    case source.PLAYLIST:
      url = `/playlists/${uri}/tracks`;
      break;
    default: {
      throw 'Unknown Source';
    }
  }
  try {
    const response = await this.spotAxios.get(url);
    return response.data;
  } catch (err) {
    console.error(`Error getting ${source} tracks\n${err.message}`);
    return { error: err };
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
    console.error(err.response.statusText);
    return { status: err.response.status, error: err.response.statusText };
  }
};

spotifyAPI.prototype.refreshAccessToken = async function () {
  console.log('Refreshing access token');
  try {
    const response = await this.spotAxios.post(
      'https://accounts.spotify.com/api/token',
      {
        headers: {
          Authorization: `Basic ${this.authBuffer}`,
        },
        Body: uriEncode({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      },
    );

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
  } catch (err) {
    console.error(`Refresh Token error:\n ${err.response.statusText}`);
    return { status: err.response.status, error: err.response.statusText };
  }
};

// spotifyAPI.prototype.search = function (searchString, searchType) {

// }

spotifyAPI.prototype.getRandomSong = async function (
  searchString,
  type = searchType.TRACK,
) {
  const encodedString =
    type === searchType.TRACK
      ? encodeURIComponent(`"${searchString}"`)
      : encodeURIComponent(searchString);
  let offset = 0;
  const queryString = `${type}%3A${encodedString}%20NOT%20karaoke&type=track`;
  try {
    const response = await this.spotAxios.get(
      `/search?query=${queryString}&offset=${offset}`,
    );
    let { data } = response;
    const totalSongs = data.tracks.total;
    console.log(`total songs = ${totalSongs}`);
    let songList = [];
    do {
      const randOffset = totalSongs < 1000 ? totalSongs : 980;
      offset = Math.floor(Math.random() * randOffset);
      console.log(`offset ${offset}`);
      ({ data } = await this.spotAxios.get(
        `/search?query=${queryString}&offset=${offset}`,
      ));
      console.log(data);
      songList =
        type === searchType.ARTIST
          ? data.tracks.items.filter(
              (track) => track.artists[0].name === searchString,
            )
          : data.tracks.items;
    } while (songList.length === 0);
    const randomTrack = Math.floor(Math.random() * songList.length);
    return songList[randomTrack];
  } catch (err) {
    console.error(`Get Random Song Error:`);
    console.error(`\n ${err}`);
    return { error: err };
  }
};
