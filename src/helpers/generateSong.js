import axios from 'axios';
import { trackMode, trackType } from '../constants/enums';
import { getRandomSong } from '../server/utils';

const generateSong = async (track) => {
  const { type, mode, uri, label } = track;
  let song;

  if (type !== trackType.RANDOM) {
    // why are we here?
    return;
  }

  switch (mode) {
    case trackMode.SPOTIFY: {
      song = await getRandomSong();
      // console.log('Random spotify');
      // console.log(song);
      break;
    }
    case trackMode.ARTIST: {
      console.log('Getting Random Artist song');
      song = await getRandomSong({ artist: label });
      break;
    }
    case trackMode.PLAYLIST: {
      let playListUri;
      if (label === 'All Playlists') {
        // we need to know users playlists.
        const { data: response } = await axios.get('/playlists');
        // console.log('play lists');
        // console.log(response);
        // pick a random number between 0 and total playlists
        const randomList = Math.floor(Math.random() * response.length);
        const playList = response[randomList].uri.split(':')[2];
        // console.log(`in random all playlist with uri ${playList}`);
        playListUri = playList;
        // song = await getRandomSong({ playList: playList });
      } else {
        playListUri = uri.split(':')[2];
      }
      song = await getRandomSong({ playList: playListUri });
      break;
    }
  }
  console.log(song);
  return { name: song.name, uri: song.uri };
};

export default generateSong;
