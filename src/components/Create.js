import React, { useState } from 'react';
import axios from 'axios';
import Song from '../Song/Song';
import SpotifySearchBar from '../SpotifySearchBar';

const Create = ({ user }) => {
  const [tracks, setTracks] = useState([]);
  const [addTrack, setAddTrack] = useState(false);
  const [library, setLibrary] = useState('spotify');

  let numTracks = tracks.length;

  const clickHandler = () => {
    setAddTrack(true);
  };

  const selectHandler = (option) => {
    const trackToAdd = { name: option.label, uri: option.uri };
    setTracks([...tracks, trackToAdd]);
    setAddTrack(false);
  };

  const submitPlayList = () => {
    const name = document.querySelector('#playlist_name').value;
    const uris = tracks.map((track) => track.uri);
    const response = axios.post('/playlist', { name: name, uris: uris });
    console.log(response);
  };

  return (
    <div>
      <p>Click add to add a song to this play list.</p>
      Name
      <input type="text" id="playlist_name" />
      <button onClick={() => clickHandler()}>Add</button>
      {numTracks >= 3 && (
        <button onClick={() => submitPlayList()}>Publish PlayList</button>
      )}
      {addTrack && (
        <SpotifySearchBar
          onSelect={(selected) => selectHandler(selected)}
          type="track"
          library={library}
        />
      )}
      {numTracks > 0 &&
        tracks.map((track) => (
          <Song key={track.uri} name={track.name} uri={track.uri}>
            {track.name}
          </Song>
        ))}
    </div>
  );
};

export default Create;
