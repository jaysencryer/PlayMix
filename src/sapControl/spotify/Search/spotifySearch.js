import {
  getSpotifySearchUrlByType,
  getSpotifySongSearchUrl,
  sanitizedSpotifySongList,
  validateSearchType,
} from '../../helpers/spotify/spotifyHelpers';
import { searchType as SEARCHTYPE } from '../../constants/enums';

export const searchSpotifySongs = async function (
  searchString,
  searchType = SEARCHTYPE.TRACK,
) {
  const url = getSpotifySongSearchUrl(searchString, searchType);

  try {
    const { data } = await this.spotAxios.execute.get(url);
    return sanitizedSpotifySongList(data);
  } catch (err) {
    console.error(`Search Spotify Songs Error:`);
    return Promise.reject(err);
  }
};

export const searchSpotifyArtists = async function (searchString) {
  const url = getSpotifySearchUrlByType(searchString, SEARCHTYPE.ARTIST);
  try {
    const { data } = await this.spotAxios.execute.get(url);
    const artistList = data.artists.items.map((artist) => ({
      name: artist.name,
    }));
    return artistList;
  } catch (err) {
    console.error(`Search Spotify Artists Error:`);
    return Promise.reject(err);
  }
};

export const searchSpotify = async function (
  searchString,
  searchType,
  byType = false,
) {
  validateSearchType(searchType);
  switch (searchType) {
    case SEARCHTYPE.ARTIST: {
      if (byType) {
        return await this.searchSpotifyArtists(searchString);
      }
      return await this.searchSpotifySongs(searchString, SEARCHTYPE.ARTIST);
    }
    case SEARCHTYPE.TRACK: {
      return await this.searchSpotifySongs(searchString);
    }
    default: {
      return await this.searchSpotifySongs(searchString, searchType);
    }
  }
};
