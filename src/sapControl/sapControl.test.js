import { SapControlBuilder } from './sapControl';

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

test('Can I build a sapController for spotify', () => {
  const testController = SapControlBuilder()
    .useStreamer('spotify')
    .useAuth(mockId, mockSecret)
    .redirect(mockUrl)
    .build();

  expect(testController.redirectUrl).toBe(mockUrl);
});

test('SapControlBuilder throws error if invalid streamer used', () => {
  expect(() => SapControlBuilder().useStreamer('invalid').build()).toThrowError(
    'Invalid streamer in SapControlBuilder()',
  );
});
