import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

import './SpotifySearchBar.css';

const SpotifySearchBar = ({ type, onSelect, library, value }) => {
  const [newValue, setNewValue] = useState(value);
  console.log(`spotify searchBar value = ${value}`);
  const getOptions = async (inputValue) => {
    if (library === 'spotify') {
      const { data: response } = await axios.get(
        `/search/${type}?query=${inputValue}`,
      );
      // console.log(response.data);
      if (type === 'track') {
        // console.log(`returning tracks`);
        return response.data.map((song) => ({
          label: `${song.title} - ${song.artist}`,
          uri: song.uri,
        }));
      } else if (type === 'artist') {
        // console.log(`returning artists`);
        return response.data.map((artist) => ({
          label: artist.name,
        }));
      }
    }
  };

  const promiseOptions = (inputValue) => {
    if (inputValue.length > 3) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getOptions(inputValue));
        }, 1000);
      });
    }
  };

  const changeHandler = (selected) => {
    setNewValue(selected);
    onSelect(selected);
  };

  return (
    <div className="spotify-search-bar">
      <AsyncSelect
        onChange={changeHandler}
        cacheOptions
        loadOptions={promiseOptions}
        inputValue={newValue}
      />
    </div>
  );
};

export default SpotifySearchBar;
