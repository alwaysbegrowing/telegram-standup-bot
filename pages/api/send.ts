import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/_connectToDatabase';
import { sendMsg } from './lib/_helpers';
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

const getMediaIdsByUserId = (userId, groupUpdates) => {
  const mediaIds = [];

  groupUpdates
    .filter((user) => user.about.id === userId)
    .forEach((user) => {
      user.updateArchive.forEach((update) => {
        const id =
          update?.body?.message?.media_group_id ||
          update?.body?.message?.message_id;

        if (!mediaIds.includes(id)) {
          mediaIds.push(id);
        }
      });
    });

  return mediaIds;
};

const sendUpdatesToGroups = async (
  user,
  group,
  sendUpdatePromises,
  mediaIds
) => {
  if (!group || !group?.winner) {
    return;
  }

  const chatId = group.chatId;
  const updates = user.updateArchive;
  const userTotalUpdates = updates.length;
  const groupTotalUpdates = mediaIds.length;

  let prefixTotal = 1;

  updates.forEach((update) => {
    const body = update?.body || {};
    const groupId = body?.message?.media_group_id;
    const type = groupId ? 'group' : update?.type || 'text';

    if (type === 'group' && mediaIds.includes(groupId)) {
      console.log(groupId, 'already sent');
      return true;
    }

    const total = groupTotalUpdates || userTotalUpdates;

    const prefix =
      total > 1
        ? `${prefixTotal}/${total}: ${user.about.first_name}`
        : `- ${user.about.first_name}`;

    sendUpdatePromises.push(
      sendMsg(prefix, chatId, null, true, update, updates)
    );

    if (type === 'group') {
      mediaIds.push(groupId);
    }

    prefixTotal += 1;
  });
};

const sendUpdatesToAllGroups = async (groupUpdates) => {
  const sendUpdatePromises = [];

  groupUpdates.forEach(async (user) => {
    const mediaIds = getMediaIdsByUserId(user.about.id, groupUpdates);

    user.groups
      .filter((group) => !!group)
      .forEach((group) =>
        sendUpdatesToGroups(user, group, sendUpdatePromises, mediaIds)
      );
  });

  await Promise.all(sendUpdatePromises);
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (validateApiKey(req)) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { db } = await connectToDatabase();

  await markAllSent(db);

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
    return res.status(200).json({ status: 'ok' });
  }

  await sendUpdatesToAllGroups(groupUpdates);

  // Next round of users getting chosen!
  await setWinners();

  return res.status(200).json({ status: 'ok' });
};
