import {
  authorize,
  // configureSpotifyProfile,
  connect,
  getAccessToken,
  refreshAccessToken,
} from '../Auth/spotifyAuth';

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

  this.clientId = clientId;
  this.redirectUrl = redirectUrl;
  this.authorizedUrl = authorizedUrl ?? '/spotifycomplete';
  this.authBuffer = authBuffer;
}

Object.assign(spotifyAPI.prototype, {
  authorize,
  connect,
  getAccessToken,
  refreshAccessToken,
});
