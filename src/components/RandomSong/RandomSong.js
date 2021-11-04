import axios from 'axios';
import React, { useState } from 'react';
import Song from '../Song/Song';

export const getRandomSong = async () => {
  const { data: randSong } = await axios.get(`/random`);
  return randSong;
};

const RandomSong = () => {
  const [song, setSong] = useState({});

  const clickHandler = async () => {
    const randSong = await getRandomSong();
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
