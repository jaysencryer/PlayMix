import { getId } from '../helpers/getId';

// const addTrack = (track, repeat) => {
//   const tmpTrackList = [];
//   for (let i = 0; i < repeat; i++) {
//     const trackId = `${track?.id}${String.fromCharCode(i + 97)}`;
//     tmpTrackList.push({ ...track, id: trackId });
//   }
//   return tmpTrackList;
// };

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
      // console.log('editing this track');
      // console.log(track);
      const newTrackList = [...trackList];
      const index = newTrackList.findIndex((t) => t.id === track.id);
      // console.log(index);
      newTrackList.splice(index, 1, track);
      return newTrackList;
    }
    case 'duplicate': {
      const { track } = action;
      const newTrackList = [...trackList];
      const tracksToAdd = [track, { ...track, id: getId() }];
      const index = newTrackList.findIndex((t) => t.id === track.id);
      newTrackList.splice(index, 1, ...tracksToAdd);
      return newTrackList;
    }
    case 'initialize': {
      const tracks = action?.tracks.map((track) => ({
        ...track,
        id: track?._id || getId(),
      }));

      return tracks;
    }
    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
