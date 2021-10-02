import React, { useState } from 'react';
import axios from 'axios';

import TrackSelector from '../TrackSelector/TrackSelector';
import MixTracks from '../MixTracks';
import generateSong from '../../helpers/generateSong';

import { trackType, trackMode } from '../../constants/enums';

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

  const saveTrack = async (id, track, repeat = 1) => {
    const newTrackList = [];
    const newSongList = [];

    // Set PlayMix Tracks
    for (let i = 0; i < repeat; i++) {
      newTrackList.push({ ...track });
    }
    const oldTrackList = [...playMixTracks];

    // add the new track into the list
    oldTrackList.splice(id, 1, ...newTrackList);
    console.table(oldTrackList);
    setPlayMixTracks(oldTrackList);

    // Set actual songs (this is async and takes more time)
    for (let i = 0; i < repeat; i++) {
      const addedSong = await getUniqueSong(track, newSongList);
      newSongList.push({ ...addedSong });
    }

    const oldSongList = [...playMixSongs];
    oldSongList.splice(id, 1, ...newSongList);

    console.table(oldSongList);
    setPlayMixSongs(oldSongList);
  };

  const getUniqueSong = async (track, songList) => {
    let addedSong;
    if (track.type === trackType.RANDOM) {
      do {
        addedSong = await generateSong(track);
        console.log(addedSong.uri);
      } while (!songList.every((song) => song.uri !== addedSong.uri));
    } else {
      addedSong = { name: track.label, uri: track.uri };
    }
    return addedSong;
  };

  const regenerateSongs = async () => {
    const newSongList = [];
    for (let track of playMixTracks) {
      const addedSong = await getUniqueSong(track, newSongList);
      newSongList.push({ ...addedSong });
    }

    console.log('We get here!');
    console.table(newSongList);
    setPlayMixSongs(newSongList);
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
    <section id="playmix-screen-container">
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
          <section key={`${id}${track.type}`} className="playmix-track">
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
          <button type="button" onClick={regenerateSongs}>
            Regenerate List
          </button>
        </>
      )}
      {/* {playMixSongs &&
        playMixSongs.map((song) => <div key={song.uri}>{song.name}</div>)} */}
    </section>
  );
};

export default PlayMix;
