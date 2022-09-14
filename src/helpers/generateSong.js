// import axios from 'axios';
import { trackMode, trackType, source } from '../sapControl/constants/enums';
import { randomItem } from '../sapControl/helpers/helpers';
import { validUri } from '../sapControl/helpers/spotify/spotifyHelpers';

const getPlayListSongs = async (client, playListUri) => {
  const response = await client.getTracks(source.PLAYLIST, playListUri);
  // console.log(response);
  return response.items.map((item) => item.track);
};

const getRandomSong = async (
  client,
  type = trackMode.SPOTIFY,
  searchString = '',
) => {
  if (type === trackMode.SPOTIFY) {
    return await client.getRandomSong();
  }
  return await client.getRandomSong(searchString, type);
};

export const generateSong = async (client, track) => {
  const { type, mode, uri: trackUris, label, id } = track;
  let song;

  if (type !== trackType.RANDOM) {
    // why are we here?
    return;
  }

  switch (mode) {
    // case trackMode.ARTIST: {
    //   song = await getRandomSong(trackMode.ARTIST, label);
    //   break;
    // }
    // case trackMode.GENRE: {
    //   song = await getRandomSong(trackMode.GENRE, label);
    //   break;
    // }

    // TODO: Figure this out

    case trackMode.PLAYLIST: {
      let allPlayListUris = [];
      if (label === 'All Playlists') {
        // TODO - if we have users playlists maybe don't do the get.
        // we need to know users playlists.
        if (client.playLists.length === 0) {
          // console.log('getting playlists');
          // If not load all users playlists
          client.playLists = await client.getPlayLists();
        }
        // const { data: usersPlayLists } = await axios.get('/playlists');
        allPlayListUris = client.playLists.map(
          (list) => list.uri.split(':')[2],
        );
      } else {
        allPlayListUris = trackUris.map((uri) => uri.split(':')[2]);
      }
      const playListUri = randomItem(allPlayListUris);
      const playListSongs = await getPlayListSongs(client, playListUri);
      song = randomItem(playListSongs);
      break;
    }
    default:
      song = await getRandomSong(client, mode, label);
      break;
  }

  return { name: song.name, uri: song.uri, id: id };
};

// export default generateSong;

export const getUniqueSong = async (client, track, songList) => {
  let addedSong;
  if (track.type === trackType.RANDOM) {
    let duplicateTrackerCount = 0;
    do {
      if (duplicateTrackerCount > 5) {
        // If we've picked a song that exists in the playmix already more than 5 times
        // we'll keep it - but mark it as invalid.
        addedSong.inValid = true;
        break;
      }
      addedSong = await generateSong(client, track);
      duplicateTrackerCount++;
    } while (!songList?.every((song) => song.uri !== addedSong.uri));
  } else {
    addedSong = { name: track.label, uri: track.uri, id: track.id };
  }
  // console.log(`validating uri ${addedSong.uri}`);
  addedSong.inValid = addedSong?.inValid ?? !validUri(addedSong.uri);
  // console.log('leaving unique song');
  return addedSong;
};

export const generateSongList = async (client, trackList) => {
  // for each track, generate a song make sure song is not already in list
  const tmpSongList = [];
  // console.log(trackList);
  if (!trackList) {
    return [];
  }
  // const emptyVar = await Promise.all(
  const songList = await Promise.all(
    trackList.map(async (track) => {
      const newSong = await getUniqueSong(client, track, tmpSongList);
      tmpSongList.push(newSong);
      return newSong;
    }),
  );
  return songList;
};

export const getUris = (songList) =>
  songList?.filter((song) => !song?.inValid).map((song) => song.uri);

export const mapTracksToSongUris = async (client, trackList) => {
  const songList = await generateSongList(client, trackList);
  // console.log(songList);
  return getUris(songList);
};
