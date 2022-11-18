import React, { useState } from 'react';

import SourceEditor from '../SourceEditor/SourceEditor';

import './TrackEditor.css';
import { usePlayMix } from '../../context/PlayMixContext';

const TrackEditor = ({ track, onSave }) => {
  const { playMixController } = usePlayMix();
  const [addMode, setAddMode] = useState(track?.sources?.length == 0);

  const generateLabel = (track) => {
    const sourceCount = track?.sources.length;
    switch (sourceCount) {
      case 0:
        return 'no source';
      case 1:
        return track.sources[0].label;
      default:
        return `Random from ${sourceCount} sources`;
    }
  };

  const saveHandler = async (newSource) => {
    // update track with new source
    // TODO update track label
    const prevSources = [...track?.sources];
    const newSources = [...prevSources, newSource];
    const updatedTrack = { ...track, sources: newSources };
    updatedTrack.label = generateLabel(updatedTrack);
    await playMixController.updateTrack(updatedTrack);
    setAddMode(false);
  };

  const deleteHandler = async (index) => {
    const currentSources = [...track?.sources];
    currentSources.splice(index, 1);

    const updatedTrack = { ...track, sources: currentSources };
    await playMixController.updateTrack(updatedTrack);
  };

  const addHandler = () => {
    setAddMode(true);
  };

  return (
    <div id="playmix-trackeditor">
      {!addMode && (
        <>
          <div className="track-sources">
            {track?.sources &&
              track.sources.map((source, index) => (
                <div
                  key={`${source.label}${index}`}
                  className="track-source-detail"
                >
                  {source.label}
                  <button type="button" onClick={() => deleteHandler(index)}>
                    Delete
                  </button>
                </div>
              ))}
          </div>
          <div className="toolBar">
            <button type="button" onClick={addHandler}>
              Add Source
            </button>
            <button type="button" onClick={() => onSave()}>
              Save
            </button>
          </div>
        </>
      )}
      {addMode && <SourceEditor onSave={saveHandler} />}
    </div>
  );
};

export default TrackEditor;
