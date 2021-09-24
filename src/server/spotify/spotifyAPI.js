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
  //   this.clientId = clientId;
  //   const authBuffer = authBuffer;
  // redirectUrl = redirectUrl;
  const stateKey = 'spotify_auth_state';
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
  this.profile;

  this.connect = function (req, res) {
    res.cookie(stateKey, state);
    res.redirect(url);
  };

  //   this.getAuth = function () {
  //     return { stateKey: this.authorize.stateKey, state: this.authorize.state };
  //   };

  this.authorize = async function (req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      // authentication error
      // TODO: error handling
      console.error('Failed to authenticate spotify');
      return { error: 'Failed to authenticate spotify' };
    }

    const tokenBody = {
      code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code',
    };

    const formBody = uriEncode(tokenBody);
    console.log('About to get token');
    const spotifyToken = await getSpotifyToken(formBody, authBuffer);
    if ('error' in spotifyToken) {
      console.error('Failed to retrieve spotify Token');
      return { error: 'Failed to retrieve spotify Token' };
    }
    this.accessToken = spotifyToken.access_token;
    this.refreshToken = spotifyToken.refresh_token;

    // this.profile = await spotifyProfileBuilder()
    //   .useToken(this.accessToken)
    //   .build();

    res.redirect('/spotifycomplete');
  };

  this.getProfile = async function () {
    const profile = await getSpotifyProfile(this.accessToken);
    return {
      ...profile,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  };
}

// export function spotifyProfileBuilder() {
//   return {
//     useToken: async function (accessToken) {
//       this.accessToken = accessToken;
//       return this;
//     },
//     build: function () {
//       console.log('building profile');
//       return new spotifyProfile(this.accessToken);
//     },
//   };
// }

// function spotifyProfile(accessToken) {
//   this.profile = getSpotifyProfile(accessToken);
//   this.id = profile.id;
//   this.user = profile.user;
//   this.avatar = profile.avatar;
//   this.accessToken = accessToken;
// }
