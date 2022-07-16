import { useEffect, useReducer, useState } from 'react';
import trackReducer from '../reducer/trackReducer';

import { trackType, trackMode } from '../sapControl/constants/enums';
import { validUri } from '../sapControl/helpers/spotify/spotifyHelpers';
import {
  generateSong,
  generateSongList,
  getUniqueSong,
  getUris,
  mapTracksToSongUris,
} from '../helpers/generateSong';
import { useSpotify } from '../context/SpotifyContext';
import axios from 'axios';
import { uriEncode } from '../sapControl/helpers/helpers';

const usePlayMixTracks = (mix) => {
  const [playMixTracks, dispatch] = useReducer(trackReducer, []);
  const [playMixSongs, setPlayMixSongs] = useState([]);
  const [playMixName, setPlayMixName] = useState();
  const id = mix?._id;
  //   const [initial, setInitial] = useState(true);
  const { spotifyClient, spotifyProfile } = useSpotify();

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

  // const getUniqueSong = async (track, songList) => {
  //   let addedSong;
  //   if (track.type === trackType.RANDOM) {
  //     let duplicateTrackerCount = 0;
  //     do {
  //       if (duplicateTrackerCount > 5) {
  //         // If we've picked a song that exists in the playmix already more than 5 times
  //         // we'll keep it - but mark it as invalid.
  //         addedSong.inValid = true;
  //         console.log(
  //           "given up on making sure it's not in playlist - just making it invalid",
  //         );
  //         console.log(addedSong);
  //         break;
  //       }
  //       addedSong = await generateSong(spotifyClient, track);
  //       duplicateTrackerCount++;
  //     } while (!songList.every((song) => song.uri !== addedSong.uri));
  //   } else {
  //     addedSong = { name: track.label, uri: track.uri, id: track.id };
  //   }
  //   addedSong.inValid = addedSong?.inValid ?? !validUri(addedSong.uri);
  //   return addedSong;
  // };

  // const refreshSongs = async () => {
  //   const newSongList = [];
  //   for (let track of playMixTracks) {
  //     const addedSong = await getUniqueSong(track, newSongList);
  //     newSongList.push({ ...addedSong });
  //   }
  //   return newSongList;
  // };

  // useEffect(() => {
  //   const generateSongList = async () => {
  //     const newSongList = await Promise.all(
  //       playMixTracks.map(async (track) => {
  //         const song = playMixSongs.find((song) => song?.id === track?.id);
  //         if (!song || !song?.uri) {
  //           // song not found or uri not established - add one
  //           const newSong = await getUniqueSong(track, playMixSongs);
  //           return newSong;
  //         } else {
  //           return song;
  //         }
  //       }),
  //     );
  //     console.table(newSongList);
  //     setPlayMixSongs(newSongList);
  //   };

  //   generateSongList();
  // }, [playMixTracks]);

  const playMixController = {
    addTrack: async (track) => {
      dispatch({ type: 'add', track });
    },
    updateTrack: async (track) => dispatch({ type: 'edit', track }),
    duplicateTrack: async (track) => dispatch({ type: 'duplicate', track }),
    savePlayList: async () => {
      const uris = [];
      if (playMixSongs.length > 0) {
        uris.push(...getUris(playMixSongs));
      } else {
        const songs = await generateSongList(spotifyClient, playMixTracks);
        uris.push(...getUris(songs));
      }
      await spotifyClient.addSpotifyPlayList(playMixName, uris);
    },
    addToQueue: async () => {
      const songs = await generateSongList(spotifyClient, playMixTracks);
      const songUris = getUris(songs);
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
