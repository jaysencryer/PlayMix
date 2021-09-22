import React, { useEffect, useState } from 'react';
import axios from 'axios';

import SpotifySearchBar from './SpotifySearchBar';
import PlaylistSelector from './PlayListSelector';

const TrackSelector = ({ saveTrack }) => {
  const [trackType, setTrackType] = useState('select');
  const [trackName, setTrackName] = useState();
  const [randomMode, setRandomMode] = useState('spotify');
  const [artistName, setArtistName] = useState('');
  const [playListSongs, setPlayListSongs] = useState([
    { label: '', uri: 'spotify' },
  ]);

  const typeSelectHandler = (event) => {
    const { target } = event;
    console.log(target.value);
    if (target.value === 'random') {
      setTrackName({ label: 'random', uri: randomMode });
    }
    setTrackType(target.value);
  };

  const addTrackHandler = () => {
    console.log(
      `type: ${trackType} name: ${trackName.label} artist: ${artistName}`,
    );
    saveTrack({ type: trackType, name: trackName, artist: artistName });
  };

  const getRandomUri = async (songList) => {
    // choose a random song from the songList
    const url = songList.split('/tracks')[0];
    const { data: response } = await axios.get(`/playlist/tracks?url=${url}`);
    console.log(response);
    const retrievedList = response.data.tracks.items;
    const randSelect = Math.floor(Math.random() * retrievedList.length);
    console.log('random songs');
    console.log(retrievedList[randSelect].track.uri);
    setTrackName({ label: 'random', uri: retrievedList[randSelect].track.uri });
  };

  useEffect(() => {
    if (
      trackType === 'random' &&
      randomMode === 'playlist' &&
      playListSongs.label
    ) {
      getRandomUri(playListSongs);
    }
  }, [randomMode, trackType, playListSongs]);

  return (
    <div>
      <select
        name="type"
        id="trackType"
        value={trackType}
        onChange={typeSelectHandler}
      >
        <option value="select" disabled hidden>
          Select Track Type
        </option>
        <option value="song">Song</option>
        <option value="random">Random</option>
      </select>
      {trackType === 'song' && (
        <SpotifySearchBar
          onSelect={(selected) => setTrackName(selected)}
          type="track"
          library="spotify"
        />
      )}
      {trackType === 'random' && (
        <>
          <select
            name="randomMode"
            id="randomMode"
            value={randomMode}
            onChange={(event) => setRandomMode(event.target.value)}
          >
            <option value="playlist">Play List</option>
            <option value="spotify">Spotify</option>
            <option value="artist">Artist</option>
          </select>
          {randomMode === 'playlist' && (
            <PlaylistSelector setTracks={setPlayListSongs} />
          )}
          {randomMode === 'artist' && (
            <SpotifySearchBar
              onSelect={(selected) => setArtistName(selected.label)}
              type="artist"
              library="spotify"
            />
          )}
        </>
      )}
      {(trackType === 'random' || (trackType === 'song' && trackName)) && (
        <button type="button" onClick={addTrackHandler}>
          Add it!
        </button>
      )}
    </div>
  );
};

export default TrackSelector;
