export function sapSongBuilder() {
  return {
    // determine streaming service this song is for
    forStreamer: function (streamer) {
      this.streamer = streamer;
      return this;
    },

    useProfile: function (sapProfile) {
      this.sapProfile = sapProfile;
      return this;
    },

    useUri: function (uri) {
      this.uri = uri;
      return this;
    },

    build: function () {
      return new sapSong(this.streamer, this.sapProfile, this.uri);
    },
  };
}

function sapSong(streamer, sapProfile, uri) {
  this.streamer = streamer;
  this.sapProfile = sapProfile;
  this.uri = uri;

  // What functions do we want a song to do?

  this.play = function () {
    // should use the streamers play function
    this.streamer.play(this.uri);
  };
}
