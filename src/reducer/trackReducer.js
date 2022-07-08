import { generateRandomString } from '../sapControl/helpers/helpers';

const randomCheck = {};

const addTrack = (track, repeat) => {
  const tmpTrackList = [];
  for (let i = 0; i < repeat; i++) {
    const trackId = `${track?.id}${String.fromCharCode(i + 97)}`;
    tmpTrackList.push({ ...track, id: trackId });
  }
  return tmpTrackList;
};

const getId = () => {
  let id = generateRandomString(8);
  while (randomCheck[id]) {
    id = generateRandomString(8);
  }
  randomCheck[id] = id;
  return id;
};

export default function trackReducer(trackList, action) {
  switch (action?.type) {
    case 'add': {
      const { track } = action;
      return trackList.length == 0
        ? [{ ...track, id: getId() }]
        : [...trackList, { ...track, id: getId() }];
    }
    case 'edit': {
      const { track } = action;
      console.log('editing this track');
      console.log(track);
      const newTrackList = [...trackList];
      const index = newTrackList.findIndex((t) => t.id === track.id);
      console.log(index);
      newTrackList.splice(index, 1, track);
      return newTrackList;
    }
    case 'duplicate': {
      const { track } = action;
      const newTrackList = [...trackList];
      const tracksToAdd = [track, { ...track, id: getId() }];
      newTrackList.splice(track?.id, 1, ...tracksToAdd);
      return newTrackList;
    }
    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
