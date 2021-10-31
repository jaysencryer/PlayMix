import {
  source,
  searchType as SEARCHTYPE,
  searchType,
} from '../../constants/enums';

export const configureSpotAxiosInstance = (APIobject) => {
  APIobject.spotAxios.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${APIobject.accessToken}`;

  APIobject.spotAxios.interceptors.response.use(
    function (response) {
      return response;
    },
    async (error) => APIobject.responseErrorInterceptor(error, APIobject),
  );
};

export const sanitizeSpotifyPlayLists = (jsonData) => {
  return jsonData.map((pList) => ({
    name: pList?.name,
    owner: pList?.owner?.display_name,
    uri: pList?.uri,
    href: pList?.href,
    images: pList?.images ? pList?.images[0]?.url : '',
    tracks: pList?.tracks,
  }));
};

export const getSpotifyTrackSourceURL = (trackSource, sourceUri) => {
  switch (trackSource) {
    case source.PLAYLIST:
      return `/playlists/${sourceUri}/tracks`;
    default: {
      throw new Error('Unknown Source');
    }
  }
};

const getSpotifySearchUrlBase = (searchString, searchType) => {
  const encodedString =
    searchType === SEARCHTYPE.ARTIST
      ? encodeURIComponent(`"${searchString}"`)
      : encodeURIComponent(searchString);
  return `/search?query=${searchType}%3A${encodedString}`;
};

export const getSpotifySongSearchUrl = (searchString, searchType) => {
  const url = getSpotifySearchUrlBase(searchString, searchType);
  return `${url}%20NOT%20karaoke&type=track`;
};

export const getSpotifySearchUrlByType = (searchString, searchType) => {
  const url = getSpotifySearchUrlBase(searchString, searchType);
  return `${url}&type=${searchType}`;
};

export const filterSpotifySongsByType = (songs, searchString, searchType) => {
  switch (searchType) {
    case SEARCHTYPE.ARTIST:
      return songs.filter(
        (song) =>
          song.artists[0].name.toLowerCase() === searchString.toLowerCase(),
      );
    default:
      return songs;
  }
};
