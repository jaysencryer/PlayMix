import express from 'express';

import LinkedSong from '../model/LinkedSong';

const router = express.Router();

const updateLinkedSong = async (_id, name, uri, before, after) => {
  try {
    const response = await LinkedSong.updateOne(
      { _id },
      { name, uri, before, after },
    );
    return response;
  } catch (error) {
    return error;
  }
};

const saveLinkedSong = async (ownerId, name, uri, before, after) => {
  const mix = new LinkedSong({
    ownerId,
    name,
    uri,
    before,
    after,
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
  const { _id, ownerId, name, uri, before, after } = req?.body?.linkedSong;

  if (!authorized(req.session, ownerId)) {
    res.send({ error: 'Error: Unauthorized' });
    return;
  }

  if (_id) {
    const response = await updateLinkedSong(_id, name, uri, before, after);
    res.send(response);
    return;
  }

  const response = await saveLinkedSong(ownerId, name, uri, before, after);
  res.send(response);
});

router.get('/load', async (req, res) => {
  const session = req?.session;
  const userId = req?.query?.userId;
  if (!authorized(session, userId)) {
    res.send({ error: 'Error: unauthorized' });
    return;
  }
  const linkedSongs = LinkedSong.find();
  const result = linkedSongs.where({ ownerId: userId });
  result.exec((err, linkedSongs) => {
    res.send(linkedSongs);
  });
});

export default router;
