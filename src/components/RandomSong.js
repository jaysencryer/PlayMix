import axios from 'axios';
import React, { useState } from 'react';
import Song from './Song';

export const getRandomSong = async () => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const randVowel = Math.floor(Math.random() * 4);
  const randSecondLetter = Math.floor(Math.random() * 26) + 97;
  const randSearchTerm = `${vowels[randVowel]}${String.fromCharCode(
    randSecondLetter,
  )}`;
  const { data: randSong } = await axios.get(`/random?query=${randSearchTerm}`);
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
