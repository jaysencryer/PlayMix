import React, { useState } from 'react';
import axios from 'axios';

// import TrackSelector from '../TrackSelector/TrackSelector';
import ShowTrack from '../ShowTrack/ShowTrack';
// import DragTest from '../DragTest/DragTest';
import generateSong from '../../helpers/generateSong';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { validUri } from '../../sapControl/helpers/spotify/spotifyHelpers';

import './PlayMix.css';
import { useSpotify } from '../../context/spotifyContext';

const newTrack = {
  type: trackType.SONG,
  mode: trackMode.SPOTIFY,
};

const newSong = {
  name: '',
  uri: '',
};

const PlayMix = () => {
  const [playMixTracks, setPlayMixTracks] = useState([]);
  // const [addTrack, setAddTrack] = useState(false);
  const [playMixSongs, setPlayMixSongs] = useState([]);
  const { spotifyClient } = useSpotify();

  const saveTrack = async (id, track, repeat = 1) => {
    const newTrackList = [];
    const newSongList = [];
    console.log(id, track, repeat);
    // Set PlayMix Tracks
    for (let i = 0; i < repeat; i++) {
      console.log(`i = ${i}`);
      // create new unique track id
      const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
      newTrackList.push({ ...track, id: trackId });
    }
    const oldTrackList = [...playMixTracks];

    // add the new track into the list
    oldTrackList.splice(id, 1, ...newTrackList);
    console.table(oldTrackList);
    setPlayMixTracks(oldTrackList);

    // Set actual songs (this is async and takes more time)
    for (let i = 0; i < repeat; i++) {
      const addedSong = await getUniqueSong(track, newSongList);
      const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
      newSongList.push({ ...addedSong, id: trackId });
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
        addedSong = await generateSong(spotifyClient, track);
        console.log(addedSong.uri);
      } while (!songList.every((song) => song.uri !== addedSong.uri));
    } else {
      addedSong = { name: track.label, uri: track.uri, id: track.id };
    }
    if (!validUri(addedSong.uri)) {
      addedSong = { ...addedSong, inValid: true };
    }
    return addedSong;
  };

  const regenerateSongs = async () => {
    const newSongList = [];
    for (let track of playMixTracks) {
      const addedSong = await getUniqueSong(track, newSongList);
      newSongList.push({ ...addedSong });
    }

    console.table(newSongList);
    setPlayMixSongs(newSongList);
  };

  const sendToSpotify = async () => {
    const songUris = playMixSongs
      .filter((song) => !song?.uri?.inValid)
      .map((song) => song.uri);
    // console.log(songUris);

    await spotifyClient.playSong(songUris);
    // TODO - add error handling here?  or in client controller?
  };

  const saveAsPlayList = async () => {
    const date = new Date();
    const name = `PlayMix ${date.toLocaleDateString()}`;
    const uris = playMixSongs.map((song) => song.uri);
    const response = await spotifyClient.addSpotifyPlayList(name, uris);
    // TODO - add error handling here
  };

  return (
    <div id="playmix-screen-container">
      <div className="playmix-controller">
        {playMixSongs.length > 5 && (
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
        <button
          type="button"
          onClick={() => {
            const trackId = playMixTracks.length ?? 0;
            console.log(`trackId = ${trackId}`);
            setPlayMixTracks([...playMixTracks, { ...newTrack, id: trackId }]);
            setPlayMixSongs([...playMixSongs, { ...newSong, id: trackId }]);
          }}
        >
          Add Track
        </button>
      </div>
      <p>Create your PlayMix</p>
      {playMixTracks &&
        playMixTracks.map((track, id) => (
          <section key={`${track.id}${track.type}`} className="playmix-track">
            <ShowTrack
              id={id}
              track={track}
              saveTrack={saveTrack}
              edit={track?.label ?? true}
            />
          </section>
        ))}
    </div>
  );
};

export default PlayMix;
