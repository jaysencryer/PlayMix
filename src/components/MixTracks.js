import React from 'react';

import Track from './Track';

const MixTracks = ({ playMixTracks }) => (
  <section>
    {playMixTracks &&
      playMixTracks.map((track, index) => (
        <Track key={`${index}${track.type}`} track={track} />
      ))}
  </section>
);

export default MixTracks;
