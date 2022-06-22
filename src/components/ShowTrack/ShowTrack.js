import React, { useState } from 'react';
import TrackEditor from '../TrackEditor/TrackEditor';

const ShowTrack = ({ client, track, id, saveTrack, edit }) => {
  const [editMode, setEditMode] = useState(edit || false);
  return (
    <>
      {!editMode && (
        <div>
          <p>{` ${track.type} from ${track.label}`}</p>
          <button onClick={() => setEditMode(true)}>Edit</button>
        </div>
      )}
      {editMode && (
        <TrackEditor
          client={client}
          id={id}
          track={track}
          saveTrack={saveTrack}
          onSave={() => setEditMode(false)}
        />
      )}
    </>
  );
};

export default ShowTrack;
