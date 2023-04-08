import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/_connectToDatabase';
import { getSubmissionDates, sendMsg } from './lib/_helpers';
import { setWinners } from './lib/_lottery';
import { Member, StandupGroup, UpdateArchive } from './lib/_types';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.query.key !== process.env.TELEGRAM_API_KEY
  ) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { previousSubmitTimestamp, nextSubmitTimestamp } = getSubmissionDates();

  const { db } = await connectToDatabase();

  const markAllSent = async () => {
    console.log('Marking as sent');

    const response = await db.collection('users').updateMany(
      {
        'updateArchive.sent': false,
      },
      { $set: { 'updateArchive.$[elem].sent': true, submitted: false } },
      {
        arrayFilters: [
          {
            'elem.sent': false,
          },
        ],
        multi: true,
      }
    );

    console.log(response);
  };

  let groupUpdates = [];

  groupUpdates = await db
    .collection('users')
    .aggregate([
      {
        $project: { updateArchive: 1, groups: 1, about: 1 },
      },
      {
        $unwind: '$updateArchive',
      },
      {
        $match: {
          'updateArchive.sent': false,
        },
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

  const sent = {};
  const sendUpdatePromises = [];

  const totalMedia = {};

  groupUpdates
    .filter((g: Member) => !!g.groups.length && !!g.updateArchive)
    .forEach((user: Member) => {
      user.updateArchive.forEach((update: UpdateArchive) => {
        const id =
          update.body?.message?.media_group_id ||
          update.body?.message?.message_id;

        if (
          Array.isArray(totalMedia[user.about.id]) &&
          totalMedia[user.about.id].includes(id)
        )
          return;

        totalMedia[user.about.id] = Array.isArray(totalMedia[user.about.id])
          ? [...totalMedia[user.about.id], id]
          : [id];
      });
    });

  groupUpdates
    .filter((g: Member) => !!g.groups.length && !!g.updateArchive)
    .forEach((user: Member) => {
      user.groups
        .filter((g) => !!g)
        .forEach((group: StandupGroup) => {
          // only send update to this group if the user won for this group!
          if (!group || !group?.winner) {
            return;
          }

          const chat_id = group.chatId;
          let total = user.updateArchive.length;
          let prefixTotal = 1;

          user.updateArchive.forEach((update: UpdateArchive) => {
            total = totalMedia[user.about.id].length;

            const body = update?.body || {};
            const groupId = body?.message?.media_group_id;
            const type = groupId ? 'group' : update?.type || 'text';

            if (
              Array.isArray(sent[chat_id]) &&
              sent[chat_id].includes(groupId)
            ) {
              console.log(groupId, 'already sent');
              return true;
            }

            if (type === 'group') {
              sent[chat_id] = Array.isArray(sent[chat_id])
                ? [...sent[chat_id], groupId]
                : [groupId];
            }

            const prefix =
              total > 1
                ? `${prefixTotal}/${total}: ${user.about.first_name}`
                : `- ${user.about.first_name}`;

            sendUpdatePromises.push(
              sendMsg(
                prefix,
                group.chatId,
                null,
                true,
                update,
                user.updateArchive
              )
            );

            prefixTotal += 1;
          });
        });
    });

  await Promise.all(sendUpdatePromises);

  if (sendUpdatePromises.length) {
    await markAllSent();
  } else {
    console.log('nothing to send');
  }

  // Next round of users getting chosen!
  await setWinners();

  return res.status(200).json({ status: 'ok' });
};
