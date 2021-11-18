import {
  getSpotifyTrackSourceURL,
  sanitizeSpotifyPlayLists,
} from '../../helpers/spotify/spotifyHelpers';

export const getPlayLists = async function () {
  try {
    await this.getAllUsersPlaylists();
    return this.playLists;
  } catch (err) {
    console.error(`Error retrieving playLists`);
    return Promise.reject(err);
  }
};

export const getAllUsersPlaylists = async function () {
  let totalPlaylists = 0;
  let offsetParm = '';
  let offset = 0;
  let limit = 50;

  do {
    const { data } = await this.spotAxios.execute.get(
      `/me/playlists?limit=${limit}${offsetParm}`,
    );

    totalPlaylists = data.total;

    if (this.playLists.length === totalPlaylists) return; // playlists haven't changed

    offset += 50;
    limit = offset + limit > totalPlaylists ? totalPlaylists - offset : 50;

    this.playLists = [
      ...this.playLists,
      ...sanitizeSpotifyPlayLists(data?.items),
    ];

    offsetParm = `&offset=${offset}`;
  } while (this.playLists.length < totalPlaylists);
};

export const getTracks = async function (trackSource, sourceUri) {
  const url = getSpotifyTrackSourceURL(trackSource, sourceUri);

  try {
    const response = await this.spotAxios.execute.get(url);
    return response.data;
  } catch (err) {
    console.error(`Error getting ${trackSource} tracks`);
    return Promise.reject(err);
  }
};

export const addSpotifyPlayList = async function (playListName, uris) {
  try {
    if (!Array.isArray(uris)) throw new Error(`Array of uri's must be sent`);
    const { data } = await this.spotAxios.execute.post(
      `/users/${this.userId}/playlists`,
      { name: playListName, public: true },
    );
    const playListId = data.id;
    await this.spotAxios.execute.post(`/playlists/${playListId}/tracks`, {
      uris: uris,
    });
  } catch (err) {
    console.error(`Add Spotify PlayList Error`);
    return Promise.reject(err);
  }
};
