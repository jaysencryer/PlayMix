import { getLinkedSongList, mainLink } from './songLink';

test('songLink returns song', () => {
  const songArray = getLinkedSongList(['uri1', 'uri4', 'uri8', 'uri3']);
  console.log(songArray);
});
