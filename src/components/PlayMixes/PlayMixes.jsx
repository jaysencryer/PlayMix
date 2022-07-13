import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSpotify } from '../../context/SpotifyContext';

const PlayMixes = ({ selectMix }) => {
  const [playMixes, setPlayMixes] = useState([]);
  const { spotifyProfile } = useSpotify();
  const userId = spotifyProfile?.userId;

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
    <div>
      {playMixes.length > 0 &&
        playMixes.map((mix) => (
          <div key={mix._id} onClick={() => selectMix(mix)}>
            {mix.name}
          </div>
        ))}
    </div>
  );
};

export default PlayMixes;
