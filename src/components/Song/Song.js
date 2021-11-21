import React from 'react';
import axios from 'axios';

const Song = ({ name, uri }) => {
  const playSong = async (uri) => {
    const response = await axios.post('/playsong', { songs: [uri] });
    console.log(response.data);
    if (response.data.status === 200) {
      console.log('no error?');
    } else {
      console.error(response.data.message);
    }
  };
  return <div onClick={() => playSong(uri)}>{name}</div>;
};

export default Song;
