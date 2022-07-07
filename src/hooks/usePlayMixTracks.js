import { useEffect, useReducer, useState } from 'react';
import trackReducer from '../reducer/trackReducer';

import { trackType, trackMode } from '../sapControl/constants/enums';
import { validUri } from '../sapControl/helpers/spotify/spotifyHelpers';
import generateSong from '../helpers/generateSong';
import { useSpotify } from '../context/SpotifyContext';

const usePlayMixTracks = () => {
  const [playMixTracks, dispatch] = useReducer(trackReducer, []);
  const [playMixSongs, setPlayMixSongs] = useState([]);
  const [playMixName, setPlayMixName] = useState();
  const [initial, setInitial] = useState(true);
  const { spotifyClient } = useSpotify();
  //   let initial = true;

  const initializePlayMixName = () => {
    const date = new Date();
    setPlayMixName(`PlayMix ${date.toLocaleDateString()}`);
  };

  useEffect(() => {
    initializePlayMixName();
  }, []);

  const getUniqueSong = async (track, songList) => {
    let addedSong;
    if (track.type === trackType.RANDOM) {
      do {
        addedSong = await generateSong(spotifyClient, track);
        console.log(addedSong.uri);
      } while (!songList.every((song) => song.uri !== addedSong.uri));
    } else {
      addedSong = { name: track.label, uri: track.uri, id: track.id };
    }
    if (!validUri(addedSong.uri)) {
      addedSong = { ...addedSong, inValid: true };
    }
    return addedSong;
  };

  const regenerateSongs = async () => {
    const newSongList = [];
    for (let track of playMixTracks) {
      const addedSong = await getUniqueSong(track, newSongList);
      newSongList.push({ ...addedSong });
    }

    return newSongList;
  };

  const playMixController = {
    addTrack: async (id, track, repeat = 1) => {
      dispatch({ type: 'add', track, data: { id, repeat } });
      const newSongList = [];
      const oldSongList = [...playMixSongs];
      if (repeat > 1) {
        for (let i = 0; i < repeat; i++) {
          const addedSong = await getUniqueSong(track, newSongList);
          const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
          newSongList.push({ ...addedSong, id: trackId });
        }
        oldSongList.splice(id, 1, ...newSongList);
      } else {
        const addedSong = await getUniqueSong(track, playMixSongs);
        oldSongList.splice(id, 1, { ...addedSong, id: id });
      }
      console.table(oldSongList);
      setPlayMixSongs(oldSongList);
    },
    savePlayList: async () => {
      const uris = playMixSongs.map((song) => song.uri);
      await spotifyClient.addSpotifyPlayList(playMixName, uris);
    },
    addToQueue: async () => {
      const songs = [];
      if (!initial) {
        console.log('not initial');
        const genSongs = await regenerateSongs();
        songs.push(...genSongs);
      } else {
        console.log('initial');
        songs.push(...playMixSongs);
      }
      const songUris = songs
        .filter((song) => !song?.uri?.inValid)
        .map((song) => song.uri);
      await spotifyClient.playSong(songUris);
      setPlayMixSongs(songs);
      setInitial(false);
    },
  };
  return {
    playMixTracks,
    playMixSongs,
    playMixName,
    setPlayMixName,
    playMixController,
  };
};

export default usePlayMixTracks;
