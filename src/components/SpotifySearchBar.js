import React from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

const SpotifySearchBar = ({ type, onSelect, library, value }) => {
  const getOptions = async (inputValue) => {
    if (library === 'spotify') {
      const { data: response } = await axios.get(
        `/search/${type}?q=${inputValue}`,
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

  return (
    <div>
      <AsyncSelect
        onChange={onSelect}
        cacheOptions
        loadOptions={promiseOptions}
        defaultValue={value ?? ''}
      />
    </div>
  );
};

export default SpotifySearchBar;
