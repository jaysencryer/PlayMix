import React from 'react';
import axios from 'axios';

const Song = ({ name, uri }) => {
  const playSong = async (uri) => {
    const data = await axios.post('/playsong', { songs: [uri] });
    if (data.status === 200) {
      console.log('no error?');
    }
  };
  return <div onClick={() => playSong(uri)}>{name}</div>;
};

export default Song;
