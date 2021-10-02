import {
  uriEncode,
  generateRandomString,
  getSpotifyToken,
  getSpotifyProfile,
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

  this.connect = function (req, res) {
    res.cookie(this.stateKey, state);
    res.redirect(url);
  };

  //   this.getAuth = function () {
  //     return { stateKey: this.authorize.stateKey, state: this.authorize.state };
  //   };

  // this.authorize = async function (req, res) {
  //   const code = req.query.code || null;
  //   const state = req.query.state || null;
  //   const storedState = req.cookies ? req.cookies[stateKey] : null;

  //   if (state === null || state !== storedState) {
  //     console.error('Failed to authenticate spotify');
  //     return { error: 'Failed to authenticate spotify' };
  //   }

  //   const tokenBody = {
  //     code,
  //     redirect_uri: redirectUrl,
  //     grant_type: 'authorization_code',
  //   };

  //   const formBody = uriEncode(tokenBody);
  //   const spotifyToken = await getSpotifyToken(formBody, authBuffer);

  //   if ('error' in spotifyToken) {
  //     console.error('Failed to retrieve spotify Token');
  //     return { error: 'Failed to retrieve spotify Token' };
  //   }

  //   this.accessToken = spotifyToken.access_token;
  //   this.refreshToken = spotifyToken.refresh_token;

  //   ({
  //     id: this.id,
  //     user: this.user,
  //     avatar: this.avatar,
  //   } = await getSpotifyProfile(this.accessToken));

  //   res.redirect('/spotifycomplete');
  // };

  //   async function configureProfile() {

  //   }

  // this.getProfile = async function () {
  //   const profile = await getSpotifyProfile(this.accessToken);
  //   return {
  //     ...profile,
  //     accessToken: this.accessToken,
  //     refreshToken: this.refreshToken,
  //   };
  // };
}

spotifyAPI.prototype.getProfile = async function () {
  const profile = await getSpotifyProfile(this.accessToken);
  return {
    ...profile,
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
