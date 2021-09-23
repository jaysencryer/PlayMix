import { sapAuthorize, sapToken } from './streamerConfig';

// export function sapSongBuilder() {
//   return {
//     // determine streaming service this song is for
//     forStreamer: function (streamer) {
//       this.streamer = streamer;
//       return this;
//     },

//     useProfile: function (sapProfile) {
//       this.sapProfile = sapProfile;
//       return this;
//     },

//     songData: function (type, label, artist, uri) {
//       this.type = type;
//       this.label = label;
//       this.artist = artist;
//       this.uri = uri;
//       return this;
//     },

//     build: function () {
//       return new sapSong(this.streamer, this.sapProfile, this.uri);
//     },
//   };
// }

// function sapSong(streamer, sapProfile, uri) {
//   this.streamer = streamer;
//   this.sapProfile = sapProfile;
//   this.uri = uri;

//   // What functions do we want a song to do?

//   this.play = function () {
//     // should use the streamers play function
//     this.streamer.play(this.uri);
//   };
// }

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
      return new sapControl(
        this.streamer,
        this.clientId,
        this.clientSecret,
        this.redirectUrl,
      );
    },
  };
}

function sapControl(streamer, clientId, clientSecret, redirectUrl) {
  this.authorize = sapAuthorize[streamer](clientId, clientSecret, redirectUrl);
  //   console.log(this.authorize);
  this.getAuth = function () {
    return {
      stateKey: this.authorize.stateKey,
      state: this.authorize.state,
      authUrl: this.authorize.authUrl,
      authBuffer: this.authorize.authBuffer,
    };
  };

  this.getToken = function (code) {
    return sapToken[streamer](
      code,
      this.authorize.redirectUrl,
      this.authorize.authBuffer,
    );
  };

  // // this.token = getToken[streamer];
}
