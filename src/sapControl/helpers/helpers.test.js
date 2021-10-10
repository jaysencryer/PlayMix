import { sanitizePlayLists } from './helpers';

test('sanitizePlayLists works as expected', () => {
  const mockPlayList = [
    {
      name: 'test playlist',
      owner: { display_name: 'teddy tester' },
      uri: 'bleepbloop',
      href: 'http://somekindofurl',
      images: [
        { url: 'http://picture1', otherdata: 'test' },
        { url: 'http://picture2', otherdata: 'test2' },
      ],
      tracks: 'http://trackurl',
      datawedontneed: 'extra info',
      license: 'other unused data',
    },
  ];

  const sanitizedList = sanitizePlayLists(mockPlayList);

  expect(sanitizedList[0].name).toBe(mockPlayList[0].name);
  expect(sanitizedList[0].license).toBeUndefined();
  expect(sanitizedList[0].images).toBe(mockPlayList[0].images[0].url);
});

test('if playlist does not have field, expect all field to be undefined', () => {
  const emptyPlayList = [];

  const sanitizedList = sanitizePlayLists(emptyPlayList);
  const listToCheck = sanitizedList[0];
  for (let items in listToCheck) {
    if (items !== 'images') {
      expect(listToCheck[items]).toBeUndefined();
    } else {
      expect(listToCheck[items]).toBe('');
    }
  }
});
