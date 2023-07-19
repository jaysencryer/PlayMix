import React, { useState } from 'react';

import { useSpotify } from '../../context/SpotifyContext';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import { useLinks } from '../../context/PlayMixContext';
import { BEFORE, AFTER } from '../../linkedSongs/linkedSongsConstants';

const ShowLinks = ({ song, addLinkedSong }) => {
  const { spotifyClient } = useSpotify();

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
  const { linkedSongs, linkedSongsController } = useLinks();
  const [currentSong, setCurrentSong] = useState({});

  const addLinkedSong = (editSong, position) => {
    linkedSongsController.addLinkedSong(currentSong, editSong, position);
  };

  return (
    <div style={{ marginTop: 50 }}>
      <button
        type="button"
        onClick={() => linkedSongsController.saveLinkedSongs()}
      >
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
      <button
        type="button"
        label="Add"
        onClick={() => linkedSongsController.addLinkedSong(currentSong)}
      >
        Add
      </button>
    </div>
  );
};

export default LinkedSongs;
