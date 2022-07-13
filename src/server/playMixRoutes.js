import express from 'express';

import Mix from '../model/Mix';
import Track from '../model/Track';

const router = express.Router();

const updateMix = async (_id, name, tracks) => {
  try {
    const response = await Mix.updateOne({ _id }, { name, tracks });
    return response;
  } catch (error) {
    return error;
  }
};

const saveMix = async (ownerId, name, tracks) => {
  const mix = new Mix({
    ownerId,
    name,
    tracks,
  });

  try {
    const response = await mix.save();
    return response;
  } catch (error) {
    return error;
  }
};

const authorized = (session, userId) =>
  session?.playMixData?.authorized && userId === session?.playMixData?.userId;

router.post('/save', async (req, res) => {
  const { _id, ownerId, name, tracks } = req?.body?.playmix;
  const trackLoad = tracks.map((track) => new Track(track));

  if (!authorized(req.session, ownerId)) {
    res.send({ error: 'Error: Unauthorized' });
    return;
  }

  if (_id) {
    const response = await updateMix(_id, name, trackLoad);
    res.send(response);
    return;
  }

  const response = await saveMix(ownerId, name, trackLoad);
  res.send(response);
});

router.get('/load', async (req, res) => {
  const session = req?.session;
  const userId = req?.query?.userId;
  if (!authorized(session, userId)) {
    res.send({ error: 'Error: unauthorized' });
    return;
  }
  const mixes = Mix.find();
  const result = mixes.where({ ownerId: session?.playMixData?.userId });
  result.exec((err, mix) => {
    res.send(mix);
  });
});

export default router;
