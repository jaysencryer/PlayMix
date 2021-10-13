import axios from 'axios';
import { trackMode, trackType } from '../constants/enums';
import { getRandomSong } from '../server/utils';

const generateSong = async (track) => {
  const { type, mode, uri, label, id } = track;
  let song;

  if (type !== trackType.RANDOM) {
    // why are we here?
    return;
  }
  // TODO add default case
  switch (mode) {
    case trackMode.SPOTIFY: {
      song = await getRandomSong();
      break;
    }
    case trackMode.ARTIST: {
      song = await getRandomSong({ artist: label });
      break;
    }
    case trackMode.PLAYLIST: {
      let playListUri;
      let uriList = [];
      if (label === 'All Playlists') {
        // we need to know users playlists.
        const { data: response } = await axios.get('/playlists');
        // pick a random number between 0 and total playlists
        uriList = response.map((list) => list.uri.split(':')[2]);
      } else {
        uriList = uri.map((u) => u.split(':')[2]);
      }

      const randomList = Math.floor(Math.random() * uriList.length);
      const playList = uriList[randomList];
      playListUri = playList;
      song = await getRandomSong({ playList: playListUri });
      break;
    }
  }
  console.log(song);
  return { name: song.name, uri: song.uri, id: id };
};

export default generateSong;
