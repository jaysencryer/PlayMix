import axios from 'axios';
import React, { useState } from 'react';

const RandomSong = () => {
  const [song, setSong] = useState({});
  const clickHandler = async () => {
    const { data: randSong } = await axios.get(
      '/random?query=caspar babypants',
    );
    console.log(randSong);
    setSong(randSong);
  };

  const playSong = async () => {
    const data = await axios.post('/playsong', { song: song.uri });
    if (data.ok) {
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
