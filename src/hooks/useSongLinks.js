import { useEffect, useReducer, useState } from 'react';
import { LOAD } from '../linkedSongs/linkedSongsConstants';

import axios from 'axios';

import { useSpotify } from '../context/SpotifyContext';
import linkedSongReducer from '../reducer/linkedSongReducer';

export const useSongLinks = () => {
  const { spotifyProfile } = useSpotify();
  const [linkedSongs, dispatch] = useReducer(linkedSongReducer, new Map());
  //   const [linkedSongs, setLinkedSongs] = useState(new Map());
  const playedSongs = new Set();

  useEffect(() => {
    const userId = spotifyProfile?.userId;
    const loadLinkedSongs = async () => {
      console.log('Loading linked songs');
      const response = await axios.get(`/linkedSongs/load?userId=${userId}`);
      const loadedLinkedSongs = new Map();
      response?.data?.forEach((song) => loadedLinkedSongs.set(song.uri, song));
      console.log(loadedLinkedSongs);
      dispatch({ type: LOAD, linkedSongs: loadedLinkedSongs });

      // setLinkedSongs(loadedLinkedSongs);
    };
    if (userId) {
      loadLinkedSongs();
    }
  }, [spotifyProfile]);

  const playLinkedSong = (uri) => {
    if (playedSongs.has(uri)) return;
    //   console.log(linkedSongs);
    const linkedSong = linkedSongs.get(uri);
    if (linkedSong?.before) {
      console.log(`Found song before ${linkedSong}`);
      playLinkedSong(linkedSong.before);
    }

    // console.log(`playing ${uri}`);
    playedSongs.add(uri);

    if (linkedSong?.after) {
      playLinkedSong(linkedSong.after);
    }
    return playedSongs;
  };

  const getLinkedSong = (uri) => {
    console.log(playedSongs);
    if (playedSongs.has(uri)) return [];
    const listOfSongs = [];
    // [...linked];
    //   console.log(linkedSongs);
    const linkedSong = linkedSongs.get(uri);
    if (linkedSong?.before) {
      //   listOfSongs.push(...playLinkedSong(linkedSong.before, listOfSongs));
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
      //   listOfSongs.push(...playLinkedSong(linkedSong.after, listOfSongs));
      if (!playedSongs.has(linkedSong?.after))
        listOfSongs.push(...getLinkedSong(linkedSong.after));
    }

    console.log('returning from getLinkedSong');
    console.table(listOfSongs);
    return listOfSongs;
  };

  const processLinkedSongs = (songUris) => {
    console.log('in processLinked songs');
    console.log(linkedSongs);
    // will check each uri and append the before and after as necessary to each
    const newSongList = [];
    songUris.forEach((song) => {
      console.log(`Processing ${song}`);
      newSongList.push(...getLinkedSong(song));
    });
    console.log(newSongList);
    return newSongList;
    // return songUris;
  };

  const linkedSongController = () => {};

  return { linkedSongs, processLinkedSongs, setLinkedSongs };
};
