import { source, searchType as SEARCHTYPE } from '../../constants/enums';

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

export const getSpotifySearchUrl = (searchString, searchType) => {
  const encodedString =
    searchType === SEARCHTYPE.TRACK
      ? encodeURIComponent(`"${searchString}"`)
      : encodeURIComponent(searchString);
  const queryString = `${searchType}%3A${encodedString}%20NOT%20karaoke&type=track`;
  return `/search?query=${queryString}`;
};
