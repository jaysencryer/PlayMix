import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSpotify } from '../../context/SpotifyContext';
import { useLinks } from '../../context/PlayMixContext';

import { mapTracksToSongUris } from '../../helpers/generateSong';

import './PlayMixes.css';

const USE_LINKS = true;

const PlayMixes = ({ selectMix }) => {
  const [playMixes, setPlayMixes] = useState([]);
  const { spotifyProfile, spotifyClient } = useSpotify();
  const { linkedSongsController } = useLinks();
  const userId = spotifyProfile?.userId;

  const playPlayMix = async (mix) => {
    console.log(mix);
    const songUris = await mapTracksToSongUris(spotifyClient, mix?.tracks);
    console.log(songUris);

    spotifyClient.playSong(
      USE_LINKS
        ? linkedSongsController.getSongListWithLinks(songUris)
        : songUris,
    );
  };

  useEffect(() => {
    const loadMixes = async () => {
      const response = await axios.get(`/playmix/load?userId=${userId}`);
      console.log(response);
      setPlayMixes(response.data);
    };
    if (spotifyProfile?.userId) {
      loadMixes();
    }
  }, [spotifyProfile]);

  return (
    <ul id="playmix-container">
      {playMixes.length > 0 &&
        playMixes.map((mix) => (
          <li key={mix._id}>
            <span onClick={() => selectMix(mix)}>{mix.name}</span>
            <button
              aria-label={`Play ${mix.name} Play Mix now`}
              onClick={() => playPlayMix(mix)}
              type="button"
            >
              Play
            </button>
          </li>
        ))}
    </ul>
  );
};

export default PlayMixes;
