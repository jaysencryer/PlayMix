const addTrack = (trackList, id, track, repeat) => {
  console.log(`in reducer addTrack with id ${id}, repeat ${repeat}`);
  console.log(track);
  const tmpTrackList = [];
  for (let i = 0; i < repeat; i++) {
    const trackId = `${track.id}${String.fromCharCode(i + 97)}`;
    tmpTrackList.push({ ...track, id: trackId });
  }
  console.log(tmpTrackList);
  const newTrackList = [...trackList];
  newTrackList.splice(id, 1, ...tmpTrackList);
  console.log(newTrackList);
  return newTrackList;
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
