import axios from 'axios';
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

export const getAccessToken = async function (postBody) {
  const accessTokenHeader = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': `Basic ${this.authBuffer}`,
    },
  };
  try {
    const response = await axios.post(
      SPOTIFY.TOKEN_URL,
      postBody,
      accessTokenHeader,
    );
    console.log(response?.data);
    return {
      authorizedUrl: this.authorizedUrl,
      accessToken: response?.data?.access_token,
      refreshToken: response?.data?.refresh_token,
    };
  } catch (err) {
    console.error('spotifyAPI.getAccessToken: Error');
    return Promise.reject(err);
  }
};

export const refreshAccessToken = async function (refreshToken) {
  const postBody = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };
  return await this.getAccessToken(uriEncode(postBody));
};

export const authorize = async function (req) {
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

  return await this.getAccessToken(tokenPostBody);
};
