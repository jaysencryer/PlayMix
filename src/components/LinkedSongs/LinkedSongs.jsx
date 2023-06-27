import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useSpotify } from '../../context/SpotifyContext';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
// import { useSongLinks } from '../../hooks/useSongLinks';
import { useLinks } from '../../context/PlayMixContext';

const BEFORE = 'before';
const AFTER = 'after';

// const defaultLinkedSongs = new Map();

const ShowLinks = ({ song, addLinkedSong }) => {
  const { spotifyClient } = useSpotify();
  console.log(song);
  return (
    <div>
      <h3>{song.name}</h3>
      <button type="button" onClick={() => spotifyClient.playSong([song.uri])}>
        Play
      </button>
      <p>{song.uri}</p>
      <p>
        Plays after:{` `}
        {song.before || (
          <button type="button" onClick={() => addLinkedSong(song, BEFORE)}>
            Add Link Before
          </button>
        )}
      </p>
      <p>
        Plays before:{` `}
        {song.after || (
          <button type="button" onClick={() => addLinkedSong(song, AFTER)}>
            Add Link After
          </button>
        )}
      </p>
    </div>
  );
};

const LinkedSongs = () => {
  const { linkedSongs, setLinkedSongs, linkedSongsController } = useLinks();
  //   const { linkedSongs, setLinkedSongs } = useSongLinks();
  //   const [linkedSongs, setLinkedSongs] = useState(defaultLinkedSongs);
  const [currentSong, setCurrentSong] = useState({});
  const { spotifyProfile } = useSpotify();
  const userId = spotifyProfile?.userId;

  //   const addLinkedSongBefore = (editSong) => addLinkedSong(editSong, BEFORE);
  //   const addLinkedSongAfter = (editSong) => addLinkedSong(editSong, AFTER);

  const addLinkedSong = (editSong, position) => {
    const songExists = linkedSongs.has(currentSong.uri);
    const counterPosition = position === BEFORE ? AFTER : BEFORE;
    // If song exists make sure it doesn't already have a Before or After
    if (songExists) {
      const songInCounterPosition = linkedSongs.get(currentSong.uri)[
        counterPosition
      ];
      if (songInCounterPosition && songInCounterPosition !== editSong.uri) {
        console.log(
          `Not adding ${currentSong.name} as ${position} as it is already an ${counterPosition}`,
        );
        return;
      }
    }
    // Make sure song isn't already a position song (Before's can only come before one song, After's can only come after one song)
    if (
      !Array.from(linkedSongs.values()).every(
        (song) => !(song[position]?.uri === currentSong.uri),
      )
    ) {
      console.log(`song is already a ${position}`);
      const songName = Array.from(linkedSongs.values()).filter(
        (song) => song[position]?.uri === currentSong.uri,
      )[0]?.name;
      console.log(
        `Not adding ${currentSong.name} as ${position} as it already set as ${position} for another ${songName}`,
      );
      return;
    }

    // Don't allow the song to be added to itself as a before or after
    if (songExists && editSong.uri === currentSong.uri) {
      console.log(`Cannot add ${currentSong.name} as a link to itself`);
      return;
    }

    // Add the song to the position

    editSong[position] = currentSong.uri;
    // and add the song to the list with it's link
    currentSong[counterPosition] = editSong.uri;

    linkedSongs.set(editSong.uri, editSong);
    linkedSongs.set(currentSong.uri, currentSong);

    const newSongList = new Map(linkedSongs);

    // const newSongList = linkedSongs.filter((song) => song.uri != editSong.uri);
    // newSongList.push(editSong);
    setLinkedSongs(newSongList);
  };

  const saveLinkedSongs = async () => {
    const postBody = {
      ownerId: userId,
      linkedSongs: Array.from(linkedSongs.values()),
    };
    const response = await axios.post(`/linkedSongs/save`, postBody);
    console.log(response);
  };

  const addNewLinkedSong = () => {
    console.log('In addNEw');
    console.log(linkedSongs);
    console.log(currentSong);
    const newSongList = new Map(
      linkedSongs.set(currentSong.uri, {
        ownerId: userId,
        name: currentSong.name,
        uri: currentSong.uri,
        before: null,
        after: null,
      }),
    );
    setLinkedSongs(newSongList);
  };

  //   useEffect(() => {
  //     const loadLinkedSongs = async () => {
  //       const response = await axios.get(`/linkedSongs/load?userId=${userId}`);
  //       console.log('Loading linked songs');
  //       const loadedLinkedSongs = new Map();
  //       response?.data?.forEach((song) => loadedLinkedSongs.set(song.uri, song));
  //       setLinkedSongs(loadedLinkedSongs);
  //     };
  //     if (spotifyProfile?.userId) {
  //       loadLinkedSongs();
  //     }
  //   }, [spotifyProfile]);

  return (
    <div style={{ marginTop: 50 }}>
      <button type="button" onClick={saveLinkedSongs}>
        Save
      </button>
      {linkedSongs.size > 0 &&
        Array.from(linkedSongs.values()).map((song) => (
          <ShowLinks key={song.uri} song={song} addLinkedSong={addLinkedSong} />
        ))}
      Select Song
      <SpotifySearchBar
        onSelect={(selected) =>
          setCurrentSong({ name: selected.label, uri: selected.uri })
        }
        type={SEARCHTYPE.TRACK}
        library="spotify"
      />
      <button type="button" label="Add" onClick={addNewLinkedSong}>
        Add
      </button>
    </div>
  );
};

export default LinkedSongs;
