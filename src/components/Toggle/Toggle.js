import React, { useState } from 'react';

import './Toggle.css';

const Toggle = ({ on, onClick }) => {
  const [switchOn, setSwitchOn] = useState(on ? true : false);
  const changeHandler = () => {
    setSwitchOn(!switchOn);
    onClick();
  };
  return (
    <label className="toggle">
      <input type="checkbox" onChange={changeHandler} checked={switchOn} />
      <span className="slider round"></span>
    </label>
  );
};

export default Toggle;
