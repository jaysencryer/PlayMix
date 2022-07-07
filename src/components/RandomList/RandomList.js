import React, { useState } from 'react';
import { useSpotify } from '../../context/SpotifyContext';

const RandomList = () => {
  const [songUris, setSongUris] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { spotifyClient } = useSpotify();

  const clickHandler = async () => {
    let existingUris = [];
    setIsLoading(true);
    for (let i = 0; i < 20; i++) {
      let randSong = await spotifyClient.getRandomSong();
      existingUris.push(randSong.uri);
      setSongUris([...existingUris]);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button onClick={() => clickHandler()}>Make Random PLayList</button>
      {songUris && (
        <div onClick={() => spotifyClient.playSong(songUris)}>
          {isLoading && <p>Loading...</p>}
          {songUris &&
            songUris.map((song, index) => <div key={index}>{song}</div>)}
        </div>
      )}
    </div>
  );
};

export default RandomList;
