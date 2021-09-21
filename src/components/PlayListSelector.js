import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PlayListTrackSelector from './PlayListTrackSelector';

const PlayListSelector = () => {
  const [playListOption, setPlayListOption] = useState('default');
  const [options, setOptions] = useState([{ label: 'test' }]);
  const [tracks, setTracks] = useState('');

  const getPlayLists = async () => {
    const { data: response } = await axios.get('/playlists');
    // console.log(response);
    return response.map((list) => ({
      label: list.name,
      tracks: list.tracks.href,
    })); // Probably need track list too.
  };

  useEffect(() => {
    const getOptions = async () => {
      const plOptions = await getPlayLists();
      console.log(plOptions);
      setOptions(plOptions);
    };

    getOptions();
  }, []);

  return (
    <>
      {options && (
        <>
          <select
            name="playListSelector"
            value={playListOption}
            onChange={(selected) => {
              console.log(selected);
              setPlayListOption(selected.target.value);
              setTracks(options[selected.target.value].tracks);
            }}
          >
            <option value="default" hidden>
              Select PlayList
            </option>
            {options.map((list, index) => (
              <option key={index} value={`${index}`}>
                {list.label}
              </option>
            ))}
          </select>
          {tracks && <PlayListTrackSelector tracks={tracks} />}
        </>
      )}
      {playListOption}
      {tracks}
    </>
  );
};

export default PlayListSelector;
