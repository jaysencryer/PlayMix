import axios from 'axios';
import React, { useState } from 'react';
import { getRandomSong } from './RandomSong';

const RandomList = () => {
  const [songUris, setSongUris] = useState([]);

  const clickHandler = async () => {
    let existingUris = [];
    for (let i = 0; i < 20; i++) {
      let randSong = await getRandomSong();
      existingUris.push(randSong.uri);
    }
    setSongUris(existingUris);
  };

  const playSongs = async () => {
    const data = await axios.post('/playsong', { songs: songUris });
    if (data.status === 200) {
      console.log('no error?');
    }
  };
  return (
    <div>
      <button onClick={() => clickHandler()}>Make Random PLayList</button>
      {songUris && (
        <div onClick={() => playSongs()}>
          {songUris.map((song, index) => (
            <div key={index}>{song}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RandomList;
