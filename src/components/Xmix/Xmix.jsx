import React, { useEffect, useState } from 'react';

import { useSpotify } from '../../context/SpotifyContext';
import generateXmix from '../../xmix/xmix-helpers';

const Xmix = () => {
  const { spotifyClient } = useSpotify();
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState('*');
  const [uris, setUris] = useState([]);

  useEffect(() => {
    const genX = async () => {
      const uris = await generateXmix(spotifyClient);
      console.table(uris);
      console.log('done');
      setUris(uris);
      setComplete(true);
    };

    genX();
  }, []);

  useEffect(() => {
    let interval = null;

    if (!complete) {
      interval = setInterval(() => {
        setProgress((progress) => progress + '*');
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [complete, progress]);

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div>Progress {progress}</div>

      {complete && (
        <>
          <div>Xmix generated</div>
          {uris.length > 0 && (
            <button type="button" onClick={() => spotifyClient.playSong(uris)}>
              Send to Spotify
            </button>
          )}
        </>
      )}
    </>
  );
};

export default Xmix;
