import fetch from 'node-fetch';
import axios from 'axios';

import { searchType, source } from '../sapControl/constants/enums';

export const generateRandomSearch = () => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const randVowel = Math.floor(Math.random() * 4);
  const randSecondLetter = Math.floor(Math.random() * 26) + 97;
  return `${vowels[randVowel]}${String.fromCharCode(randSecondLetter)}`;
};

export const generateRandomString = (length) => {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const searchSpotify = async (accessToken, searchString, type) => {
  const encodedString = encodeURIComponent(searchString);
  try {
    const data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${encodedString}&type=${type}&limit=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    console.log(data);
    if (type === 'track') {
      const songList = data.tracks.items.map((track) => ({
        artist: track.artists[0].name,
        title: track.name,
        uri: track.uri,
      }));
      return songList;
    }
    if (type === 'artist') {
      const artistList = data.artists.items.map((artist) => ({
        name: artist.name,
      }));
      return artistList;
    }
  } catch (err) {
    console.error(`Search Spotify Error:\n ${err}`);
    return { error: err };
  }
};

export const randomSong = async (
  accessToken,
  searchString,
  type = searchType.TRACK,
) => {
  const encodedString =
    type === searchType.ARTIST
      ? encodeURIComponent(`"${searchString}"`)
      : encodeURIComponent(searchString);
  // console.log(accessToken);
  console.log(searchString, encodedString, type);
  let offset = 0;
  try {
    let data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${type}%3A${encodedString}%20NOT%20karaoke&type=track&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (data.error) {
      if (data.error.message === 'Invalid access token') {
        // TODO - refresh logic
        console.log('refresh token and try again');
      }
    }
    const totalSongs = data.tracks.total;
    console.log(`total songs = ${totalSongs}`);
    let songList = [];
    do {
      const randOffset = totalSongs < 1000 ? totalSongs : 980;
      offset = Math.floor(Math.random() * randOffset);
      console.log(`offset ${offset}`);
      data = await spotFetch(
        `https://api.spotify.com/v1/search?query=${type}%3A${encodedString}%20NOT%20karaoke&type=track&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      // console.table(data.tracks.items);

      songList =
        type === searchType.ARTIST
          ? data.tracks.items.filter(
              (track) => track.artists[0].name === searchString,
            )
          : data.tracks.items;
      // console.log(songList.length);
    } while (songList.length === 0);
    const randomTrack = Math.floor(Math.random() * songList.length);
    // console.log(randomTrack);

    // const song = data.tracks.items.filter(
    //   (track, index) => index === randomTrack,
    // );
    return songList[randomTrack];
  } catch (err) {
    console.error(`Random Spotify Error:\n ${err}`);
    return { error: err };
  }
};

export const addSpotifyPlayList = async (
  accessToken,
  userId,
  playListName,
  uris,
) => {
  console.log(`${accessToken}`);
  try {
    const response = await spotFetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: playListName, public: true }),
      },
    );
    console.log(response);
    const playId = response.id;
    const addsongs = await spotFetch(
      `https://api.spotify.com/v1/playlists/${playId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ uris: uris }),
      },
    );
    console.log(addsongs);
  } catch (err) {
    console.error(`add Spotify PlayList Error:\n ${err.message}`);
    return { error: err };
  }
};

// Custom fetch method to deal with Json-ing and error handling
const spotFetch = async (url, body) => {
  // console.log(body);
  try {
    const response = await fetch(url, body);
    if (response.status === 204) {
      // This is returned by Spotify Player with no Json data.
      return { message: 'Player successful' };
    }
    // console.log(response);
    const data = await response.json();
    if (data.error) throw data.error;
    return data;
  } catch (err) {
    console.error(`spotFetch error:\n ${err.message}`);
    return { error: err };
  }
};

export const getRandomSong = async (type = {}) => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const randVowel = Math.floor(Math.random() * 4);
  const randSecondLetter = Math.floor(Math.random() * 26) + 97;
  const randSearchTerm = `${vowels[randVowel]}${String.fromCharCode(
    randSecondLetter,
  )}`;
  let randSong;
  if ('artist' in type) {
    console.log(`Looking for song from Artist ${type.artist}`);
    randSong = await axios.get(`/random/artist?query=${type.artist}`);
  } else if ('playList' in type) {
    // TODO: make this cleaner! and error checking?
    // const uri = type.playList.split(':')[2];
    const response = await axios.get(
      `/tracks?source=${source.PLAYLIST}&uri=${type.playList}`,
    );
    console.log(response);
    const songList = response.data.items;
    // console.log(songList);
    const randSelect = Math.floor(Math.random() * songList.length);
    randSong = { data: songList[randSelect].track };
    console.log('playlist randSong');
    console.log(randSong);
  } else {
    randSong = await axios.get(`/random`);
  }

  return randSong.data;
};
