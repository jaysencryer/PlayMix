const features = {
  xmix2022: ['123543387'],
};

const featureToggle = (userId, featureKey) => {
  return features[featureKey].includes(userId);
};

export default featureToggle;
