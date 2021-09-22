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

    songData: function (type, label, artist, uri) {
      this.type = type;
      this.label = label;
      this.artist = artist;
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

export function spotifyBuilder() {
  return {
    build: function () {
        return new spotifyStreamer()
    }
  };
}

function spotifyStreamer() {

    this.getToken = async function (formBody, authBuffer) {
        try {
          const data = await spotFetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: formBody,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              'Authorization': `Basic ${authBuffer}`,
            },
          });
      
          return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          };
        } catch (err) {
          console.error(`getSpotifyToken: Error occured\n${err}`);
          return { error: err };
        }
      };
    this.getProfile = function () {
        this.
    }
}