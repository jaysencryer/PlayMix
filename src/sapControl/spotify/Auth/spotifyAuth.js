import { generateRandomString, uriEncode } from '../../helpers/helpers';
import * as SPOTIFY from '../../helpers/spotify/spotifyConstants';

export const connect = function (res) {
  const state = generateRandomString(16);

  const authParams = uriEncode({
    response_type: 'code',
    client_id: this.clientId,
    scope: SPOTIFY.SCOPE,
    state: state,
    redirect_uri: this.redirectUrl,
  });

  const connectionUrl = `${SPOTIFY.AUTHURL}?${authParams}`;

  res.cookie(SPOTIFY.STATE_KEY, state);
  res.redirect(connectionUrl);
};

export const authorize = async function (req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[SPOTIFY.STATE_KEY] : null;
  if (state === null || state !== storedState) {
    console.error('Failed to authenticate spotify');
    return Promise.reject('Failed to authenticate Spotify');
  }

  const tokenPostBody = uriEncode({
    code,
    redirect_uri: this.redirectUrl,
    grant_type: 'authorization_code',
  });
  console.log(
    'About to initialize spotAxios, which gets the old access token!',
  );

  await this.spotAxios.initialize(tokenPostBody);

  await this.configureSpotifyProfile();

  res.redirect(this.authorizedUrl);
};

export const configureSpotifyProfile = async function () {
  const profile = await this.spotAxios.execute.get('/me');
  ({ id: this.userId, display_name: this.user } = profile.data);
  this.avatar = profile.data.images[0].url;
};

// export const getAccessToken = async function (formBody) {
//   const accessTokenHeader = {
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
//       'Authorization': `Basic ${this.authBuffer}`,
//     },
//   };
//   try {
//     const response = await this.spotAxios.post(
//       'https://accounts.spotify.com/api/token',
//       formBody,
//       accessTokenHeader,
//     );
//     this.accessToken = response?.data?.access_token;
//     this.refreshToken = response?.data?.refresh_token ?? this.refresh_token;
//   } catch (err) {
//     console.error('spotifyAPI.getAccessToken: Error');
//     console.error(err?.response?.statusText);
//     return Promise.reject(err);
//   }
// };

// export const refreshAccessToken = async function () {
//   console.info('Refreshing access token');
//   const postBody = {
//     grant_type: 'refresh_token',
//     refresh_token: this.refreshToken,
//   };
//   await this.getAccessToken(uriEncode(postBody));
// };
