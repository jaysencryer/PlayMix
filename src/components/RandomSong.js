import axios from 'axios';
import React, { useState } from 'react';

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

  const playSong = async () => {
    const data = await axios.post('/playsong', { songs: [song.uri] });
    if (data.status === 200) {
      console.log('no error?');
    }
  };

  return (
    <div>
      <button onClick={() => clickHandler()}>Pick Random Song</button>
      {song && <div onClick={() => playSong()}>{song.name}</div>}
    </div>
  );
};

export default RandomSong;
