import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, getSubmissionDates } from './_helpers';

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
        'updateArchive.createdAt': {
          $gt: previousSubmitTimestamp,
          $lt: nextSubmitTimestamp,
        },
      },
      { $set: { 'updateArchive.$[elem].sent': true, submitted: false } },
      {
        arrayFilters: [
          {
            'elem.createdAt': {
              $gt: previousSubmitTimestamp,
              $lt: nextSubmitTimestamp,
            },
          },
        ],
        multi: true,
      }
    );

    console.log(response);
  };

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
        $match: {
          'updateArchive.createdAt': {
            $gt: previousSubmitTimestamp,
            $lt: nextSubmitTimestamp,
          },
        },
      },
      {
        $group: {
          _id: '$about.id',
          about: { $first: '$about' },
          groups: { $first: '$groups' },
          latestUpdate: { $last: '$updateArchive' },
        },
      },
    ])
    .toArray();

  const sendUpdatePromises = [];
  groupUpdates
    .filter((g: Member) => !!g.groups.length && !!g.latestUpdate)
    .forEach((user: Member) => {
      user.groups.forEach((group: StandupGroup) => {
        sendUpdatePromises.push(
          sendMsg(
            user.about.first_name,
            group.chatId,
            null,
            true,
            user.latestUpdate
          )
        );
      });
    });

  await Promise.allSettled(sendUpdatePromises);
  if (sendUpdatePromises.length) {
    await markAllSent();
  }

  return res.status(200).json({ status: 'ok' });
};
