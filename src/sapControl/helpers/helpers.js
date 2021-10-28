export const uriEncode = (obj) => {
  let formBody = [];
  for (const property in obj) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(obj[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};
