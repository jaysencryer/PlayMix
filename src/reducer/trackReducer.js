const addTrack = (trackList, id, track, repeat) => {
  const newTrackList = [];
  for (let i = 0; i < repeat; i++) {
    const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
    newTrackList.push({ ...track, id: trackId });
  }
  trackList.splice(id, 1, ...newTrackList);
  return trackList;
};

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
