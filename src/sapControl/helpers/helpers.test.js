import { generateRandomString, randomItem, uriEncode } from './helpers';

test('uriEncode test', () => {
  const mockUriData = {
    number: 1,
    stringData: 'test',
  };
  const result = uriEncode(mockUriData);
  expect(result).toBe('number=1&stringData=test');
});

test('generateRandomString test', () => {
  const randomString = generateRandomString(10);
  expect(randomString.length).toBe(10);
});

test('randomItem returns an item from the array', () => {
  const numberArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const randomNumber = randomItem(numberArray);
  const isInArray = numberArray.includes(randomNumber);
  expect(isInArray).toBeTruthy();
});
