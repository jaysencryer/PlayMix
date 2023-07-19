import { useEffect, useReducer } from 'react';
import axios from 'axios';

import { useSpotify } from '../context/SpotifyContext';
import linkedSongReducer, { ADD, LOAD } from '../reducer/linkedSongReducer';

export const useSongLinks = () => {
  const { spotifyProfile } = useSpotify();
  const [linkedSongs, dispatch] = useReducer(linkedSongReducer, new Map());
  const playedSongs = new Set();
  const userId = spotifyProfile?.userId;

  useEffect(() => {
    const loadLinkedSongs = async () => {
      console.log('Loading linked songs');
      const response = await axios.get(`/linkedSongs/load?userId=${userId}`);
      const loadedLinkedSongs = new Map();
      response?.data?.forEach((song) => loadedLinkedSongs.set(song.uri, song));
      console.log(loadedLinkedSongs);
      dispatch({ type: LOAD, linkedSongs: loadedLinkedSongs });
    };

    if (userId) {
      loadLinkedSongs();
    }
  }, [spotifyProfile]);

  const getLinkedSong = (uri) => {
    if (playedSongs.has(uri)) return [];

    const listOfSongs = [];
    const linkedSong = linkedSongs.get(uri);

    if (linkedSong?.before) {
      console.log(`Found a song before ${linkedSong.name}`);
      if (!playedSongs.has(linkedSong?.before)) {
        console.log('checking links for before song');
        listOfSongs.push(...getLinkedSong(linkedSong.before));
      } else {
        console.log('before song already in list');
      }
    }

    console.log(`adding ${uri}`);
    if (!listOfSongs.includes(uri)) listOfSongs.push(uri);
    playedSongs.add(uri);

    if (linkedSong?.after) {
      console.log(`Found a song after ${linkedSong.name}`);

      if (!playedSongs.has(linkedSong?.after))
        listOfSongs.push(...getLinkedSong(linkedSong.after));
    }

    console.log('returning from getLinkedSong');
    console.table(listOfSongs);
    return listOfSongs;
  };

  const processLinkedSongs = (songUris) => {
    playedSongs.clear();
    console.log('in processLinked songs');
    console.log('played songs = ');
    console.table(playedSongs);
    // will check each uri and append the before and after as necessary to each
    const newSongList = [];
    songUris.forEach((song) => {
      console.log(`Processing ${song}`);
      newSongList.push(...getLinkedSong(song));
    });
    console.log(newSongList);
    return newSongList;
  };

  const linkedSongsController = {
    getSongListWithLinks: (songUris) => processLinkedSongs(songUris),

    addLinkedSong: (songToAdd, existingSong = null, position = null) =>
      dispatch({ type: ADD, songToAdd, existingSong, position, userId }),

    saveLinkedSongs: async () => {
      const postBody = {
        ownerId: userId,
        linkedSongs: Array.from(linkedSongs.values()),
      };
      const response = await axios.post(`/linkedSongs/save`, postBody);
      console.log(response);
    },
  };

  return { linkedSongs, linkedSongsController };
};
