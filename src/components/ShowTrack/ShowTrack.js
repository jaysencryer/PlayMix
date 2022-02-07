import React, { useState } from 'react';
import TrackEditor from '../TrackEditor/TrackEditor';

const ShowTrack = ({ track, id, saveTrack }) => {
  const [editMode, setEditMode] = useState(false);
  return (
    <>
      {!editMode && (
        <div>
          <p>{` ${track.type} from ${track.label}`}</p>
          <button onClick={() => setEditMode(true)}>Edit</button>
        </div>
      )}
      {editMode && <TrackEditor id={id} track={track} saveTrack={saveTrack} />}
    </>
  );
};

export default ShowTrack;
