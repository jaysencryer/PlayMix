import React, { useState } from 'react';
import axios from 'axios';

import TrackSelector from './TrackSelector';
import MixTracks from './MixTracks';
import { getRandomSong } from '../server/utils';
import generateSong from '../helpers/generateSong';

import { trackType, trackMode } from '../constants/enums';

const newTrack = {
  type: trackType.DEFAULT,
  mode: trackMode.DEFAULT,
};

const newSong = {
  name: '',
  uri: '',
};

const PlayMix = () => {
  const [playMixTracks, setPlayMixTracks] = useState([]);
  // const [addTrack, setAddTrack] = useState(false);
  const [playMixSongs, setPlayMixSongs] = useState([]);

  const saveTrack = async (id, track) => {
    // const newTrack = { type, name: name.label, uri: name.uri };
    console.log(id);
    console.log(track);
    let addedSong;
    if (track.type === trackType.RANDOM) {
      addedSong = await generateSong(track);
    } else {
      addedSong = { name: track.label, uri: track.uri };
    }
    const newList = playMixSongs.map((song, index) =>
      index === id ? addedSong : song,
    );
    console.log(newList[id]);
    setPlayMixSongs([...newList]);
  };

  const sendToSpotify = async () => {
    const songUris = playMixSongs.map((song) => song.uri);
    console.log(songUris);

    const data = await axios.post('/playsong', { songs: songUris });
    if (data.status !== 200) {
      console.log('There was an error!');
      console.error(data.statusText);
    }
  };

  const saveAsPlayList = async () => {
    const date = new Date();
    const name = `PlayMix ${date.toLocaleDateString()}`;
    const uris = playMixSongs.map((song) => song.uri);
    const response = axios.post('/playlist', { name: name, uris: uris });
    console.log(response);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setPlayMixTracks([...playMixTracks, { ...newTrack }]);
          setPlayMixSongs([...playMixSongs, { ...newSong }]);
        }}
      >
        Add Track
      </button>
      {playMixTracks &&
        playMixTracks.map((track, id) => (
          <section key={`${id}${track.type}`}>
            <span>{`${id + 1} `}</span>

            <TrackSelector id={id} track={track} saveTrack={saveTrack} />
          </section>
        ))}
      {/* {playMixTracks && <MixTracks playMixTracks={playMixTracks} />} */}
      {playMixTracks.length > 5 && (
        <>
          <button type="button" onClick={sendToSpotify}>
            Send to Spotify
          </button>
          <button type="button" onClick={saveAsPlayList}>
            Save as PlayList
          </button>
        </>
      )}
      {playMixSongs &&
        playMixSongs.map((song) => <div key={song.uri}>{song.name}</div>)}
    </div>
  );
};

export default PlayMix;
