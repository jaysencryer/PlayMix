export const playSong = async function (uriList) {
  try {
    await this.spotAxios.put('/me/player/play', { uris: uriList });
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
    return Promise.reject(err);
  }
};
