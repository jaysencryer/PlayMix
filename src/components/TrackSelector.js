import React, { useEffect, useState } from 'react';
import axios from 'axios';

import SpotifySearchBar from './SpotifySearchBar';
import PlaylistSelector from './PlayListSelector';

import { trackType, trackMode } from '../constants/enums';

const TrackSelector = ({ track, id, saveTrack }) => {
  const [selectType, setSelectType] = useState(track.type);
  // const [trackName, setTrackName] = useState();
  const [randomMode, setRandomMode] = useState(track.mode);
  // const [artistName, setArtistName] = useState('');
  // const [playListSongs, setPlayListSongs] = useState('');

  // const typeSelectHandler = (event) => {
  //   const { target } = event;
  //   console.log(`randomMode = ${randomMode}`);
  //   if (target.value === 'random') {
  //     setTrackName({ label: 'random', uri: randomMode });
  //   }
  //   setTrackType(target.value);
  // };

  // const addTrackHandler = () => {
  //   console.log(
  //     `type: ${trackType} name: ${trackName.label} artist: ${artistName}`,

  const selectTrack = ({
    label,
    mode = randomMode,
    uri = 'generate',
    playId = null,
  }) => {
    // we've selected a track
    saveTrack(id, {
      type: selectType,
      mode: mode,
      label: label,
      uri: uri,
    });
  };

  // useEffect(() => {
  //   if (trackType === 'random' && randomMode === 'playlist' && playListSongs) {
  //     getRandomUri(playListSongs);
  //   }
  // }, [randomMode, trackType, playListSongs]);

  return (
    <div>
      <select
        name="type"
        id="selectType"
        value={selectType}
        onChange={(event) => setSelectType(event.target.value)}
      >
        <option value={trackType.DEFAULT} disabled hidden>
          Select Track Type
        </option>
        <option value={trackType.SONG}>Song</option>
        <option value={trackType.RANDOM}>Random</option>
      </select>
      {selectType === trackType.SONG && (
        <SpotifySearchBar
          onSelect={(selected) => selectTrack(selected)}
          type="track"
          library="spotify"
        />
      )}
      {selectType === trackType.RANDOM && (
        <>
          <select
            name="randomMode"
            id="randomMode"
            value={randomMode}
            onChange={(event) => {
              if (event.target.value === trackMode.SPOTIFY) {
                selectTrack({
                  mode: trackMode.SPOTIFY,
                  label: trackMode.SPOTIFY,
                });
              }
              setRandomMode(event.target.value);
            }}
          >
            <option value={trackMode.DEFAULT}>select mode</option>
            <option value={trackMode.PLAYLIST}>Play List</option>
            <option value={trackMode.SPOTIFY}>Spotify</option>
            <option value={trackMode.ARTIST}>Artist</option>
          </select>
          {randomMode === trackMode.PLAYLIST && (
            <PlaylistSelector setTracks={selectTrack} />
          )}
          {randomMode === trackMode.ARTIST && (
            <SpotifySearchBar
              onSelect={(selected) => selectTrack({ label: selected.label })}
              type="artist"
              library="spotify"
            />
          )}
        </>
      )}
      {/* {(trackType === 'random' || (trackType === 'song' && trackName)) && (
        <button type="button" onClick={addTrackHandler}>
          Add it!
        </button>
      )} */}
    </div>
  );
};

export default TrackSelector;
