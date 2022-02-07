import React, { useState } from 'react';
import Toggle from '../Toggle/Toggle';
import SelectBar from '../SelectBar/SelectBar';

import './TestBed.css';

const TestBed = () => {
  const [toggleOn, setToggleOn] = useState(false);

  const menuOptions = ['Playlist', 'Spotify', 'Artist'];

  const handleSelect = (selected) => {
    console.log(selected);
  };
  return (
    <div>
      <div className="top-part">
        <Toggle
          onClick={() => {
            setToggleOn(!toggleOn);
          }}
        />
        <p>{toggleOn ? 'on' : 'off'}</p>
      </div>
      <div className="select-part">
        <SelectBar options={menuOptions} onClick={handleSelect} />
      </div>
    </div>
  );
};
export default TestBed;
