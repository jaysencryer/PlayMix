import axios from 'axios';
import { source } from '../../constants/enums';
import { sanitizePlayLists } from '../helpers/helpers';
import {
  uriEncode,
  generateRandomString,
  getSpotifyToken,
} from '../../server/utils';

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

  const profile = await this.spotAxios.get('/me');
  ({ id: this.id, display_name: this.user } = profile.data);
  this.avatar = profile.data.images[0].url;

  res.redirect('/spotifycomplete');
};

spotifyAPI.prototype.playSong = async function (uriList) {
  try {
    this.spotAxios.put('/me/player/play', { uris: uriList });
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
    console.error(err);
    return { error: err };
  }
};
