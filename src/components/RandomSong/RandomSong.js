import axios from 'axios';
import React, { useState } from 'react';
import Song from '../Song/Song';

// export const getRandomSong = async () => {
//   const { data: randSong } = await axios.get(`/random`);
//   return randSong;
// };

const RandomSong = ({ client }) => {
  const [song, setSong] = useState({});
  console.log(client);

  const clickHandler = async () => {
    const randSong = await client.getRandomSong();
    // console.log(data);
    setSong(randSong);
  };

  return (
    <div>
      <button onClick={() => clickHandler()}>Pick Random Song</button>
      {song && <Song client={client} name={song.name} uri={song.uri} />}
    </div>
  );
};

export default RandomSong;
