import { VercelRequest, VercelResponse } from '@vercel/node';
import client from './lib/_client';
import { connectToDatabase } from './lib/_connectToDatabase';
import { setWinners } from './lib/_lottery';
import { validateApiKey } from './lib/_validateApiKey';

const markAllSent = async (db) => {
  console.log('Marking as sent');

  const response = await db
    .collection('users')
    .updateMany(
      { 'updateArchive.sent': false },
      { $set: { 'updateArchive.$[elem].sent': true, submitted: false } },
      { arrayFilters: [{ 'elem.sent': false }], multi: true }
    );

  console.log(response);
};

const sendUpdatesToGroups = async ({ user, group }: { user; group }) => {
  if (!group || !group?.winner) {
    return;
  }

  const chatId = group.chatId;
  const updates = user.updateArchive;

  const ids = updates
    .map((update) => update?.body?.message?.message_id)
    .filter((id) => !!id);

  return client.forwardMessages(chatId, {
    messages: ids,
    fromPeer: user.about.id,
  });
};

const sendUpdatesToAllGroups = async (groupUpdates) => {
  const sendUpdatePromises = [];

  groupUpdates.forEach(async (user) => {
    user.groups
      .filter((group) => !!group)
      .forEach((group) =>
        sendUpdatePromises.push(sendUpdatesToGroups({ user, group }))
      );
  });

  return Promise.all(sendUpdatePromises);
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (validateApiKey(req)) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { db } = await connectToDatabase();

  const groupUpdates = await db
    .collection('users')
    .aggregate([
      {
        $project: { updateArchive: 1, groups: 1, about: 1 },
      },
      {
        $unwind: '$updateArchive',
      },
      {
        $match: { 'updateArchive.sent': false },
      },
      {
        $group: {
          _id: '$about.id',
          about: { $first: '$about' },
          groups: { $first: '$groups' },
          updateArchive: { $push: '$updateArchive' },
        },
      },
    ])
    .toArray();

  if (!groupUpdates || groupUpdates.length === 0) {
    console.log('nothing to send');
  } else {
    if (!client.connected) await client.connect();

    await sendUpdatesToAllGroups(groupUpdates);
    await markAllSent(db);
  }

  // Next round of users getting chosen!
  await setWinners();

  return res.status(200).json({ status: 'ok' });
};
