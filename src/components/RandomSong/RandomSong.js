import React, { useState } from 'react';
import { useSpotify } from '../../context/spotifyContext';
import Song from '../Song/Song';

const RandomSong = () => {
  const [song, setSong] = useState({});
  const { spotifyClient } = useSpotify();

  const clickHandler = async () => {
    const randSong = await spotifyClient.getRandomSong();
    // console.log(data);
    setSong(randSong);
  };

  return (
    <div>
      <button onClick={() => clickHandler()}>Pick Random Song</button>
      {song && <Song name={song.name} uri={song.uri} />}
    </div>
  );
};

export default RandomSong;
