import React, { useState } from 'react';

import './SelectBar.css';

const SelectBar = ({
  options = ['Yes', 'No'],
  onClick = () => {},
  selected,
}) => {
  const [activeOption, setActiveOption] = useState(selected || options?.[0]);

  return (
    <div id="select-bar">
      {options &&
        options.map((option, index) => (
          <button
            key={`${index}${option}`}
            className={`select-btn ${activeOption === option ? 'active' : ''}`}
            value={option}
            onClick={() => {
              onClick(option);
              setActiveOption(option);
            }}
          >
            {option}
          </button>
        ))}
    </div>
  );
};

export default SelectBar;
