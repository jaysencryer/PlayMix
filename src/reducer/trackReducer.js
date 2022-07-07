const addTrack = (trackList, id, track, repeat) => {};

export default function trackReducer(trackList, action) {
  switch (action?.type) {
    case 'add': {
      const { id, repeat } = action?.data;
      const { track } = action;
      const newTrackList = addTrack(trackList, id, track, repeat);
      return newTrackList;
    }
    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
