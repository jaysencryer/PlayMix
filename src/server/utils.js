import fetch from 'node-fetch';

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

    return { user: data.display_name, avatar: data.images[0].url };
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

export const searchSpotify = async (accessToken, searchString) => {
  const encodedString = encodeURIComponent(searchString);
  try {
    const data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${encodedString}&type=track&limit=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    console.log(data);
    const songList = data.tracks.items.map((track) => ({
      artist: track.artists[0].name,
      title: track.name,
    }));
    return songList;
  } catch (err) {
    console.error(`Search Spotify Error:\n ${err}`);
    return { error: err };
  }
};

export const randomSong = async (accessToken, searchString) => {
  // const encodedString = encodeURIComponent(searchString);
  let offset = 0;
  try {
    let data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${searchString}&type=track&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const totalSongs = data.tracks.total;
    console.log(`total songs = ${totalSongs}`);
    const randOffset = totalSongs < 1000 ? totalSongs : 1000;
    offset = Math.floor(Math.random() * randOffset);
    console.log(`offset ${offset}`);
    data = await spotFetch(
      `https://api.spotify.com/v1/search?query=${searchString}%20NOT%20karaoke&type=track&offset=${offset}`,
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

export const playSpotifySong = async (accessToken, uri) => {
  // const uris = [uri];
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
      body: JSON.stringify({ uris: [uri] }),
    });
    console.log(data);

    return data;
  } catch (err) {
    console.error(`Play Spotify song Error:\n ${err.message}`);
    return { error: err };
  }
};

// Custom fetch method to deal with Json-ing and error handling
const spotFetch = async (url, body) => {
  try {
    const response = await fetch(url, body);
    const data = await response.json();
    if (data.error) throw data.error;
    return data;
  } catch (err) {
    console.error(`spotFetch error:\n ${err}`);
    return { error: err };
  }
};
