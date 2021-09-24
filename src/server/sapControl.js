import { spotifyAPIBuilder } from './spotify/spotifyAPI';
import { sapAuthorize, sapToken } from './streamerConfig';

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

// function sapControl(streamer, clientId, clientSecret, redirectUrl) {
//   this.authorize = sapAuthorize[streamer](clientId, clientSecret, redirectUrl);
//   this.accessToken;
//   this.refreshToken;
//   //   console.log(this.authorize);
//   this.getAuth = function () {
//     return {
//       stateKey: this.authorize.stateKey,
//       state: this.authorize.state,
//       authUrl: this.authorize.authUrl,
//       authBuffer: this.authorize.authBuffer,
//     };
//   };

//   this.getToken = function (code) {
//     return sapToken[streamer](
//       code,
//       this.authorize.redirectUrl,
//       this.authorize.authBuffer,
//     );
//   };

//   this.buildProfile = async function (code) {
//     const tokenObject = await sapToken[streamer](
//       code,
//       this.authorize.redirectUrl,
//       this.authorize.authBuffer,
//     );
//     if ('error' in tokenObject) return;
//     this.accessToken = tokenObject.access_token;
//     this.refreshToken = tokenObject.refresh_token;
//   };
// }
