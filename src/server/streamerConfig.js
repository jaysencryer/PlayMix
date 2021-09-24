import { generateRandomString, getSpotifyToken, uriEncode } from './utils';

export const sapAuthorize = {
  spotify: function (clientId, clientSecret, redirectUrl) {
    this.authBuffer = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    this.redirectUrl = redirectUrl;
    this.stateKey = 'spotify_auth_state';
    this.state = generateRandomString(16);

    const scope =
      'user-read-private user-read-email playlist-read-private user-modify-playback-state user-read-playback-state playlist-modify-public';

    const authParams = uriEncode({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      state: this.state,
      redirect_uri: redirectUrl,
    });

    this.authUrl = `${authUrl.spotify}?${authParams}`;

    return this;
  },
};

export const sapToken = {
  spotify: async function (code, redirectUrl, authBuffer) {
    const tokenBody = {
      code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code',
    };
    const formBody = uriEncode(tokenBody);
    console.log(authBuffer);
    // TODO: does not work!
    const spotifyToken = await getSpotifyToken(formBody, authBuffer);
    return spotifyToken;
  },
};
