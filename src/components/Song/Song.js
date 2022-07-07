import React from 'react';
import { useSpotify } from '../../context/SpotifyContext';

const Song = ({ name, uri }) => {
  const { spotifyClient } = useSpotify();
  return <div onClick={() => spotifyClient.playSong([uri])}>{name}</div>;
};

export default Song;
