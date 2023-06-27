import { ADD, BEFORE, AFTER } from '../linkedSongs/linkedSongsConstants';

export default function linkedSongReducer(linkedSongs, action) {
  switch (action?.type) {
    case ADD: {
      const { songToAdd, position, existingSong } = action;
      const songExists = linkedSongs.has(songToAdd?.uri);
      const counterPosition = position === BEFORE ? AFTER : BEFORE;
      // If song exists make sure it doesn't already have a Before or After
      if (songExists) {
        const songInCounterPosition = linkedSongs.get(songToAdd?.uri)[
          counterPosition
        ];
        if (
          songInCounterPosition &&
          songInCounterPosition !== existingSong.uri
        ) {
          console.log(
            `Not adding ${songToAdd.name} as ${position} as it is already an ${counterPosition}`,
          );
          return linkedSongs;
        }
      }
      // Make sure song isn't already a position song (Before's can only come before one song, After's can only come after one song)
      if (
        !Array.from(linkedSongs.values()).every(
          (song) => !(song[position]?.uri === songToAdd?.uri),
        )
      ) {
        console.log(`song is already a ${position}`);
        const songName = Array.from(linkedSongs.values()).filter(
          (song) => song[position]?.uri === songToAdd?.uri,
        )[0]?.name;
        console.log(
          `Not adding ${songToAdd?.name} as ${position} as it is already set as ${position} for ${songName}`,
        );
        return;
      }

      // Don't allow the song to be added to itself as a before or after
      if (songExists && existingSong?.uri === songToAdd?.uri) {
        console.log(`Cannot add ${songToAdd?.name} as a link to itself`);
        return;
      }
      // Add the song to the position

      existingSong[position] = songToAdd?.uri;
      // and add the song to the list with it's link
      songToAdd[counterPosition] = existingSong?.uri;

      linkedSongs.set(existingSong?.uri, existingSong);
      linkedSongs.set(songToAdd?.uri, songToAdd);

      const newSongList = new Map(linkedSongs);

      return newSongList;
    }
    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
