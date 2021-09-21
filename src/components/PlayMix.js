import React, { useState } from 'react';
import axios from 'axios';

import TrackSelector from './TrackSelector';
import MixTracks from './MixTracks';
import { getRandomSong } from '../server/utils';

const PlayMix = () => {
  const [playMixTracks, setPlayMixTracks] = useState([]);
  const [addTrack, setAddTrack] = useState(false);

  const saveTrack = async ({ type, name, artist }) => {
    const newTrack = { type, name: name.label, uri: name.uri };
    console.log(type);
    console.log(name);
    setAddTrack(false);
    if (type === 'random') {
      let song;
      if (artist) {
        song = await getRandomSong({ artist: artist });
        newTrack.name = artist;
      } else {
        song = await getRandomSong();
      }
      newTrack.uri = song.uri;
    }
    setPlayMixTracks([...playMixTracks, newTrack]);
  };

  const sendToSpotify = async () => {
    const songUris = playMixTracks.map((track) => track.uri);
    const data = await axios.post('/playsong', { songs: songUris });
    if (data.status !== 200) {
      console.log('There was an error!');
      console.error(data.statusText);
    }
  };

  return (
    <div>
      We'll have a list of tracks - and an add button at the top. The add button
      will give a selector (song, random)
      <button type="button" onClick={() => setAddTrack(true)}>
        Add Track
      </button>
      {addTrack && <TrackSelector saveTrack={saveTrack} />}
      {playMixTracks && <MixTracks playMixTracks={playMixTracks} />}
      {playMixTracks.length > 5 && (
        <button type="button" onClick={sendToSpotify}>
          Send to Spotify
        </button>
      )}
    </div>
  );
};

export default PlayMix;
