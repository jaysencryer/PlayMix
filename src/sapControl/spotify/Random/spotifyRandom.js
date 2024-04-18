import {
  generateRandomString,
  randomFloored,
  randomItem,
} from '../../helpers/helpers';
import { searchType as SEARCHTYPE } from '../../constants/enums';
import {
  getSpotifySongSearchUrl,
  filterSpotifySongsByType,
  validateSearchType,
} from '../../helpers/spotify/spotifyHelpers';

export const getRandomSong = async function (
  searchString = generateRandomString(2),
  searchType = SEARCHTYPE.TRACK,
) {
  validateSearchType(searchType);
  return await this.selectRandomSpotifySong(searchString, searchType);
};

export const selectRandomSpotifySong = async function (
  searchString,
  searchType,
) {
  const url = getSpotifySongSearchUrl(searchString, searchType);

  let totalSongs;
  let offset = 0;
  let songList = [];

  try {
    do {
      console.log(url);
      let { data } = await this.spotAxios.execute.get(
        `${url}&offset=${offset}`,
      );

      // This is skipped first time through
      if (totalSongs) {
        songList = filterSpotifySongsByType(
          data.tracks.items,
          searchString,
          searchType,
        );
      }
      totalSongs = totalSongs ?? data.tracks.total;
      //   console.log(`totalSongs = ${totalSongs}`);
      const randomOffsetSize = totalSongs < 1000 ? totalSongs : 950;
      offset = randomFloored(randomOffsetSize);
      offset = offset ? offset : 20;
    } while (songList.length === 0);

    return randomItem(songList);
  } catch (err) {
    console.error(`Get Random Song Error:`);

    return Promise.reject(err);
  }
};
