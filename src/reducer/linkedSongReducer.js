import { ADD, AFTER, BEFORE, LOAD } from '../linkedSongs/linkedSongsConstants';

export { ADD, AFTER, BEFORE, LOAD };

const songAlreadyExistsInPosition = (song, position, linkedSongs) =>
  !Array.from(linkedSongs.values()).every((s) => {
    console.log(
      `Looking at ${s.name} at ${position} -uri = ${s[position]} vs song.uri = ${song.uri}`,
    );
    return s[position] !== song?.uri;
  });

export default function linkedSongReducer(linkedSongs, action) {
  switch (action?.type) {
    case ADD: {
      const { songToAdd, position, existingSong, userId } = action;

      /*
       Action is - adding 'songToAdd' 'position' 'existingSong'
       eg. Adding "What a wonderful World" "before" "All around the world"
       which also adds "All around the world" "after" "What a wonderful world"
      if position & existingSong are not present - this is a new song

      */

      console.log(action);
      const songExists = linkedSongs.has(songToAdd?.uri);
      const updatingExisting = position && existingSong ? true : false;
      console.log(
        `songExists ${songExists} updatingExisting ${updatingExisting}`,
      );

      if (!songExists) songToAdd['ownerId'] = userId;

      const counterPosition = position === BEFORE ? AFTER : BEFORE;
      // Make sure song isn't already a position song (Before's can only come before one song, After's can only come after one song)
      if (songAlreadyExistsInPosition(songToAdd, position, linkedSongs)) {
        console.log(`song is already a ${position}`);
        const songName = Array.from(linkedSongs.values()).filter(
          (song) => song[position] === songToAdd?.uri,
        )[0]?.name;
        console.log(
          `Not adding ${songToAdd?.name} as ${position} as it is already set as ${position} for ${songName}`,
        );
        return linkedSongs;
      }
      // If song exists make sure it doesn't already have a Before or After
      if (songExists && updatingExisting) {
        const songInCounterPosition = linkedSongs.get(songToAdd?.uri)[
          counterPosition
        ];
        console.log(`song in counter position ${songInCounterPosition}`);
        if (
          songInCounterPosition &&
          songInCounterPosition !== existingSong.uri
        ) {
          console.log(
            `Not adding ${songToAdd.name} as ${position} as it already has ${counterPosition} position`,
          );
          return linkedSongs;
        }
      }

      // if (
      //   songAlreadyExistsInPosition(songToAdd, counterPosition, linkedSongs)
      // ) {
      //   console.log(`song exists as a ${counterPosition}`);
      // }

      // Don't allow the song to be added to itself as a before or after
      if (songExists && existingSong?.uri === songToAdd?.uri) {
        console.log(`Cannot add ${songToAdd?.name} as a link to itself`);
        return linkedSongs;
      }

      if (
        songExists &&
        updatingExisting &&
        linkedSongs.get(songToAdd.uri)[position] === existingSong.uri
      ) {
        console.log('Woah, trying to create an infinte loop');
        return linkedSongs;
      }
      // console.log(`checking if we are updateing existing ${updatingExisting}`);
      if (updatingExisting) {
        console.log('updating existing');
        // Add the song to the position
        existingSong[position] = songToAdd?.uri;
        linkedSongs.set(existingSong?.uri, existingSong);
        // add or update song to list with link
        songToAdd[counterPosition] = existingSong?.uri;
      }

      if (songExists && !updatingExisting) {
        // we tried to add a song that already exists - we should ignore this
        return linkedSongs;
      }

      linkedSongs.set(songToAdd?.uri, songToAdd);

      const newSongList = new Map(linkedSongs);

      return newSongList;
    }
    case LOAD: {
      const { linkedSongs: newLinkedSongs } = action;
      return newLinkedSongs;
    }

    default:
      throw new Error(`Unhandled action ${action?.type}`);
  }
}
