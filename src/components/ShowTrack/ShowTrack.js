import React, { useState } from 'react';
import { usePlayMix } from '../../context/PlayMixContext';
import TrackEditor from '../TrackEditor/TrackEditor';

const ShowTrack = ({ track, edit }) => {
  const [editMode, setEditMode] = useState(edit || false);
  const [disableDup, setDisableDup] = useState(false);
  const { playMixController } = usePlayMix();

  const dupHandler = async () => {
    setDisableDup(true);
    await playMixController.duplicateTrack(track);
    setDisableDup(false);
  };
  return (
    <>
      {!editMode && (
        <>
          <p>{`${track?.type} from ${track?.label}`}</p>
          <button type="button" onClick={() => setEditMode(true)}>
            Edit
          </button>
          <button type="button" onClick={dupHandler} disabled={disableDup}>
            Dup
          </button>
        </>
      )}
      {editMode && (
        <TrackEditor track={track} onSave={() => setEditMode(false)} />
      )}
    </>
  );
};

export default ShowTrack;
