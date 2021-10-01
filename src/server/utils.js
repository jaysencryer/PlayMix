import fetch from 'node-fetch';
import axios from 'axios';

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

export const uriEncode = (obj) => {
  let formBody = [];
  for (const property in obj) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(obj[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};

export const getSpotifyToken = async (formBody, authBuffer) => {
  console.log(`In getSpotifyToken ${formBody} ${authBuffer}`);
  try {
    const data = await spotFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: formBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization': `Basic ${authBuffer}`,
      },
    });

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (err) {
    console.error(`getSpotifyToken: Error occured\n${err}`);
    return { error: err };
  }
};

export const getSpotifyProfile = async (accessToken) => {
  try {
    const data = await spotFetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    // console.log(data);

    return { id: data.id, user: data.display_name, avatar: data.images[0].url };
  } catch (err) {
    console.error(`Access Token Error:\n ${err}`);
    return { error: err, avatar: '/images/blank.png' };
  }
};

export const storePlayLists = (jsonData) => {
  return jsonData.map((pList) => ({
    name: pList.name,
    owner: pList.owner.display_name,
    uri: pList.uri,
    href: pList.href,
    images: pList.images[0] ? pList.images[0].url : '',
    tracks: pList.tracks,
  }));
};

export const getSpotifyPlayLists = async (accessToken) => {
  let numOfPlayLists = 0;
  let playLists = [];
  let offSetString = '';
  let offset = 0;
  let limit = 50;

  try {
    do {
      const data = await spotFetch(
        `http://api.spotify.com/v1/me/playlists?limit=${limit}${offSetString}`,
        {
          headers: { Authorization: 'Bearer ' + accessToken },
        },
      );
      numOfPlayLists = data.total;
      // console.log(`This user has ${numOfPlayLists} playlists`);
      offset += 50;
      limit = offset + limit > numOfPlayLists ? numOfPlayLists - offset : 50;
      playLists = [...playLists, ...storePlayLists(data.items)];
      offSetString = `&offset=${offset}`;
      // console.log(playLists.length, offSetString, limit);
    } while (playLists.length < numOfPlayLists);
    return playLists;
  } catch (err) {
    console.error(`Loading playlists Error:\n ${err}`);
    return { error: err };
  }
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

export const randomSong = async (accessToken, searchString) => {
  const encodedString = encodeURIComponent(searchString);
  console.log(encodedString);
  let offset = 0;
  try {
    let data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${encodedString}%20NOT%20karaoke&type=track&offset=${offset}`,
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
    const randOffset = totalSongs < 1000 ? totalSongs : 980;
    offset = Math.floor(Math.random() * randOffset);
    console.log(`offset ${offset}`);
    data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${encodedString}%20NOT%20karaoke&type=track&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const randomTrack = Math.floor(Math.random() * 20);
    console.log(randomTrack);
    const song = data.tracks.items.filter(
      (track, index) => index === randomTrack,
    );
    return song[0];
  } catch (err) {
    console.error(`Random Spotify Error:\n ${err}`);
    return { error: err };
  }
};

export const playSpotifySong = async (accessToken, uris) => {
  try {
    const devices = await spotFetch(
      'http://api.spotify.com/v1/me/player/devices',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    console.log(devices);
    const data = await spotFetch('https://api.spotify.com/v1/me/player/play', {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'PUT',
      body: JSON.stringify({ uris: uris }),
    });

    return data;
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
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

export const getSpotifyTracks = async (url, accessToken) => {
  try {
    // GET the track listing from Spotify
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    return { response: response, data: data };
  } catch (err) {
    console.error(`Loading tracks Error:\n ${err}`);
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
    randSong = await axios.get(`/random/artist?name=${type.artist}`);
  } else if ('playList' in type) {
    // TODO: make this cleaner! and error checking?
    // const uri = type.playList.split(':')[2];
    const { data: response } = await axios.get(
      `/playlist/tracks?url=https://api.spotify.com/v1/playlists/${type.playList}`,
    );
    console.log(response);
    const songList = response.data.tracks.items;
    console.log(songList);
    const randSelect = Math.floor(Math.random() * songList.length);
    randSong = { data: songList[randSelect].track };
    console.log('playlist randSong');
    console.log(randSong);
  } else {
    randSong = await axios.get(`/random?query=${randSearchTerm}`);
  }

  return randSong.data;
};
