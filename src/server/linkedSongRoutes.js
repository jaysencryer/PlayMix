import express from 'express';

import LinkedSong from '../model/LinkedSong';

const router = express.Router();

const updateLinkedSong = async (_id, ownerId, name, uri, before, after) => {
  try {
    const response = await LinkedSong.updateOne(
      { _id },
      { ownerId, name, uri, before, after },
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
  //   const { _id, ownerId, name, uri, before, after } = req?.body?.linkedSongs;
  const ownerId = req?.body?.ownerId;
  const linkedSongs = req?.body?.linkedSongs;
  console.log(req?.body?.linkedSongs);

  if (!authorized(req.session, ownerId)) {
    res.send({ error: 'Error: Unauthorized' });
    return;
  }

  const responses = [];

  for (let song of linkedSongs) {
    console.log(song);
    const { _id, name, uri, before, after } = song;
    if (_id) {
      const response = await updateLinkedSong(
        _id,
        ownerId,
        name,
        uri,
        before,
        after,
      );
      responses.push(response);
    } else {
      console.log(`Saving ${song.name}`);
      const response = await saveLinkedSong(ownerId, name, uri, before, after);
      responses.push(response);
    }
  }

  res.send(responses);
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
