import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useSpotify } from '../../context/SpotifyContext';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';

const ShowLinks = ({ song }) => {
  const { spotifyProfile, spotifyClient } = useSpotify();
  console.log(song);
  return (
    <div>
      <h3>{song.name}</h3>
      <button type="button" onClick={() => spotifyClient.playSong([song.uri])}>
        Play
      </button>
      <p>{song.uri}</p>
      <p>{song.before?.name || <button>Add Link Before</button>}</p>
      <p>{song.after?.name || <button>Add Link After</button>}</p>
    </div>
  );
};

const LinkedSongs = () => {
  const [linkedSongs, setLinkedSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState({});
  const { spotifyProfile, spotifyClient } = useSpotify();
  const userId = spotifyProfile?.userId;

  useEffect(() => {
    const loadLinkedSongs = async () => {
      const response = await axios.get(`/linkedSongs/load?userId=${userId}`);
      console.log(response);
      setLinkedSongs(response.data);
    };
    if (spotifyProfile?.userId) {
      loadLinkedSongs();
    }
  }, [spotifyProfile]);

  return (
    <div style={{ marginTop: 50 }}>
      {linkedSongs.length > 0 &&
        linkedSongs.map((song) => <ShowLinks key={song.uri} song={song} />)}
      Select Song
      <SpotifySearchBar
        onSelect={(selected) =>
          setCurrentSong({ name: selected.label, uri: selected.uri })
        }
        type={SEARCHTYPE.TRACK}
        library="spotify"
      />
      <button
        type="button"
        label="Add"
        onClick={() => {
          console.log(currentSong);
          setLinkedSongs([
            ...linkedSongs,
            {
              name: currentSong.name,
              uri: currentSong.uri,
              before: null,
              after: null,
            },
          ]);
        }}
      >
        Add
      </button>
    </div>
  );
};

export default LinkedSongs;
