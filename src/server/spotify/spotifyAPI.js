import axios from 'axios';
import {
  uriEncode,
  generateRandomString,
  getSpotifyToken,
  getSpotifyProfile,
  storePlayLists,
} from '../utils';

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

  this.connect = function (req, res) {
    res.cookie(this.stateKey, state);
    res.redirect(url);
  };
}

spotifyAPI.prototype.getProfile = async function () {
  const profile = await getSpotifyProfile(this.accessToken);
  return {
    ...profile,
    accessToken: this.accessToken,
    refreshToken: this.refreshToken,
  };
};

spotifyAPI.prototype.spotifyGet = async function (url) {
  const spotAxios = axios.create({
    headers: { Authorization: `Bearer ${this.accessToken}` },
  });
  try {
    const response = await spotAxios.get(url);
    // console.log(response);
    // if (response.error) throw response.error;
    return response;
  } catch (err) {
    console.error(`spotifyGet error:\n ${err.message}`);
    return { error: err };
  }
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
  const spotifyToken = await getSpotifyToken(formBody, this.authBuffer);

  if ('error' in spotifyToken) {
    console.error('Failed to retrieve spotify Token');
    return { error: 'Failed to retrieve spotify Token' };
  }

  this.accessToken = spotifyToken.access_token;
  this.refreshToken = spotifyToken.refresh_token;

  ({
    id: this.id,
    user: this.user,
    avatar: this.avatar,
  } = await getSpotifyProfile(this.accessToken));

  res.redirect('/spotifycomplete');
};

spotifyAPI.prototype.playSong = async function (uriList) {
  try {
    this.spotifyPut('player/play', {
      body: JSON.stringify({ uris: uriList }),
    });
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
    return { error: err };
  }
};

spotifyAPI.prototype.getPlayLists = async function () {
  let totalPlaylists = 0;
  let offsetParm = '';
  let offset = 0;
  let limit = 50;
  const baseUrl = 'http://api.spotify.com/v1/me/playlists?';

  try {
    do {
      const response = await this.spotifyGet(
        `${baseUrl}limit=${limit}${offsetParm}`,
      );
      // TODO error checking?
      const { data } = response;
      totalPlaylists = data.total;
      if (this.playLists.length === totalPlaylists) break; // playlists haven't changed
      offset += 50;
      limit = offset + limit > totalPlaylists ? totalPlaylists - offset : 50;
      this.playLists = [...this.playLists, ...storePlayLists(data?.items)];
      offsetParm = `&offset=${offset}`;
    } while (this.playLists.length < totalPlaylists);
    return this.playLists;
  } catch (err) {
    console.error(`Error retrieving playLists`);
    console.error(err);
    return { error: err };
  }
};
