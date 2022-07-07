import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';

import './SpotifySearchBar.css';
import { useSpotify } from '../../context/SpotifyContext';

const SpotifySearchBar = ({ type, onSelect, library, value }) => {
  const [newValue, setNewValue] = useState(value);
  const { spotifyClient } = useSpotify();

  console.log(`spotify searchBar value = ${value}`);
  const getOptions = async (inputValue) => {
    console.log(`About to get options input ${inputValue} type ${type}`);
    if (library === 'spotify') {
      const searchByType = type === 'artist' ? true : false;
      const response = await spotifyClient.searchSpotify(
        inputValue,
        type,
        searchByType,
      );
      console.log('Got the options');
      console.log(response);
      // axios.get(        `/search/${type}?query=${inputValue}`,);
      if (type === 'track') {
        return response.map((song) => ({
          label: `${song.title} - ${song.artist}`,
          uri: song.uri,
        }));
      } else if (type === 'artist') {
        return response.map((artist) => ({
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
    console.log(`Input is changing to ${selected.label}`);
    onSelect(selected);
  };

  return (
    <div className="spotify-search-bar">
      <AsyncSelect
        onChange={changeHandler}
        cacheOptions
        loadOptions={promiseOptions}
        inputValue={newValue}
        onInputChange={(input) => setNewValue(input)}
      />
    </div>
  );
};

export default SpotifySearchBar;
