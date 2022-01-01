import axios from 'axios';
import { trackMode, trackType, source } from '../sapControl/constants/enums';
import { randomItem } from '../sapControl/helpers/helpers';

const getPlayListSongs = async (playListUri) => {
  const { data: playListSongs } = await axios.get(
    `/tracks?source=${source.PLAYLIST}&uri=${playListUri}`,
  );
  return playListSongs.items.map((item) => item.track);
};

const getRandomSong = async (type = trackMode.SPOTIFY, searchString = '') => {
  let randomSongURL = '/random';
  if (type !== trackMode.SPOTIFY) {
    randomSongURL += `/${type}?query=${searchString}`;
  }
  const { data } = await axios.get(randomSongURL);
  return data;
};

const generateSong = async (track) => {
  const { type, mode, uri: trackUris, label, id } = track;
  let song;

  if (type !== trackType.RANDOM) {
    // why are we here?
    return;
  }

  switch (mode) {
    // case trackMode.ARTIST: {
    //   song = await getRandomSong(trackMode.ARTIST, label);
    //   break;
    // }
    // case trackMode.GENRE: {
    //   song = await getRandomSong(trackMode.GENRE, label);
    //   break;
    // }
    case trackMode.PLAYLIST: {
      let allPlayListUris = [];
      if (label === 'All Playlists') {
        // TODO - if we have users playlists maybe don't do the get.
        // we need to know users playlists.
        const { data: usersPlayLists } = await axios.get('/playlists');
        allPlayListUris = usersPlayLists.map((list) => list.uri.split(':')[2]);
      } else {
        allPlayListUris = trackUris.map((uri) => uri.split(':')[2]);
      }
      const playListUri = randomItem(allPlayListUris);
      const playListSongs = await getPlayListSongs(playListUri);
      song = randomItem(playListSongs);
      break;
    }
    default:
      song = await getRandomSong(mode, label);
      break;
  }

  return { name: song.name, uri: song.uri, id: id };
};

export default generateSong;
