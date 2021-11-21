export const uriEncode = (obj) => {
  let formBody = [];
  for (const property in obj) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(obj[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};

export const randomFloored = (maxNumber) =>
  Math.floor(Math.random() * maxNumber);

export const randomItem = (array) => array[randomFloored(array.length)];

export const generateRandomString = (length) => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(randomFloored(possible.length));
  }
  return text;
};
