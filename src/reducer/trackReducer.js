const addTrack = (id, track, repeat) => {
  const tmpTrackList = [];
  for (let i = 0; i < repeat; i++) {
    const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
    tmpTrackList.push({ ...track, id: trackId });
  }
  return tmpTrackList;
};

export default function trackReducer(trackList, action) {
  switch (action?.type) {
    case 'add': {
      const { id, repeat } = action?.data;
      const { track } = action;
      if (repeat > 1) {
        trackList.splice(id, 1, ...addTrack(id, track, repeat));
      } else {
        trackList.splice(id, 1, track);
      }
      return trackList;
    }
    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
