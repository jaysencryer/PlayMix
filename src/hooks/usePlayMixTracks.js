import { useEffect, useReducer, useState } from 'react';
import trackReducer from '../reducer/trackReducer';

import { generateSongList, getUris } from '../helpers/generateSong';
import { useSongLinks } from './useSongLinks';
import { useSpotify } from '../context/SpotifyContext';
import axios from 'axios';

const usePlayMixTracks = (mix) => {
  const [playMixTracks, dispatch] = useReducer(trackReducer, []);
  const [playMixSongs, setPlayMixSongs] = useState([]);
  const [playMixName, setPlayMixName] = useState();
  const id = mix?._id;
  const { spotifyClient, spotifyProfile } = useSpotify();
  const { processLinkedSongs } = useSongLinks();

  const USING_LINKS = true;

  const initializePlayMixName = () => {
    const date = new Date();
    setPlayMixName(mix?.name || `PlayMix ${date.toLocaleDateString()}`);
  };

  const initializePlayMixTracks = () => {
    if (!mix?.tracks) return;
    dispatch({ type: 'initialize', tracks: mix?.tracks });
  };

  useEffect(() => {
    initializePlayMixName();
    initializePlayMixTracks();
  }, []);

  const playMixController = {
    addTrack: async (track) => {
      dispatch({ type: 'add', track });
    },
    updateTrack: async (track) => dispatch({ type: 'edit', track }),
    duplicateTrack: async (track) => dispatch({ type: 'duplicate', track }),
    savePlayList: async () => {
      let songs;
      if (playMixSongs.length > 0) {
        songs = getUris(playMixSongs);
      } else {
        songs = await generateSongList(spotifyClient, playMixTracks);
      }
      const uris = USING_LINKS
        ? processLinkedSongs(getUris(songs))
        : getUris(songs);
      await spotifyClient.addSpotifyPlayList(playMixName, uris);
    },
    addToQueue: async () => {
      const songs = await generateSongList(spotifyClient, playMixTracks);
      const songUris = USING_LINKS
        ? processLinkedSongs(getUris(songs))
        : getUris(songs);
      await spotifyClient.playSong(songUris);
      setPlayMixSongs(songs);
    },
    savePlayMix: async () => {
      const postBody = {
        playmix: {
          _id: id,
          name: playMixName,
          ownerId: spotifyProfile?.userId,
          tracks: playMixTracks,
        },
      };
      const response = await axios.post('/playmix/save', postBody);
      console.log(response);
      // TODO - error handling, extract to own file
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
