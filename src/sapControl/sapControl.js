import { spotifyAPIBuilder } from './spotify/spotifyAPI';

export function SapControlBuilder() {
  return {
    useStreamer: function (streamer) {
      this.streamer = streamer;
      return this;
    },
    useAuth: function (clientId, clientSecret) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      return this;
    },
    redirect: function (redirectUrl) {
      this.redirectUrl = redirectUrl;
      return this;
    },

    build: function () {
      if (!(this.streamer in sapControl)) {
        throw 'Invalid streamer in SapControlBuilder()';
      }
      return new sapControl[this.streamer](
        this.clientId,
        this.clientSecret,
        this.redirectUrl,
      );
    },
  };
}

const sapControl = {
  spotify: function (clientId, clientSecret, redirectUrl) {
    return spotifyAPIBuilder()
      .useCredentials(clientId, clientSecret)
      .useRedirect(redirectUrl)
      .build();
  },
};
