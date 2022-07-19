export const playSong = async function (uriList) {
  if (!Array.isArray(uriList) || uriList?.length === 0) {
    return Promise.reject('invalid or empty uri array sent');
  }

  try {
    await this.spotAxios.execute.put('/me/player/play', { uris: uriList });
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
    return Promise.reject(err);
  }
};
