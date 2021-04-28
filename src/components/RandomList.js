import axios from 'axios';
import React, { useState } from 'react';
import { getRandomSong } from './RandomSong';

const RandomList = () => {
  const [songUris, setSongUris] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const clickHandler = async () => {
    let existingUris = [];
    setIsLoading(true);
    for (let i = 0; i < 20; i++) {
      let randSong = await getRandomSong();
      existingUris.push(randSong.uri);
    }
    setIsLoading(false);
    setSongUris(existingUris);
  };

  const playSongs = async () => {
    const data = await axios.post('/playsong', { songs: songUris });
    if (!data.error) {
      console.log('no error?');
    }
  };
  return (
    <div>
      <button onClick={() => clickHandler()}>Make Random PLayList</button>
      {songUris && (
        <div onClick={() => playSongs()}>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            songUris.map((song, index) => <div key={index}>{song}</div>)
          )}
        </div>
      )}
    </div>
  );
};

export default RandomList;
