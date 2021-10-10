export const sanitizePlayLists = (jsonData) => {
  return jsonData.map((pList) => ({
    name: pList?.name,
    owner: pList?.owner?.display_name,
    uri: pList?.uri,
    href: pList?.href,
    images: pList?.images ? pList?.images[0]?.url : '',
    tracks: pList?.tracks,
  }));
};
