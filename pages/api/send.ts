import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member } from './_helpers';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.query.key !== process.env.TELEGRAM_API_KEY
  ) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  // Releases are at 4pm UTC every day
  const nextSubmit = new Date();
  nextSubmit.setUTCHours(15);
  nextSubmit.setUTCMinutes(8);
  nextSubmit.setUTCSeconds(0);
  const nextSubmitTimestamp = nextSubmit.getTime();
  nextSubmit.setUTCDate(nextSubmit.getUTCDate() - 1);
  const previousSubmitTimestamp = nextSubmit.getTime();

  const { db } = await connectToDatabase();

  const markAllSent = async () => {
    const response = await db.collection('users').updateMany(
      {
        'updateArchive.createdAt': {
          $gte: previousSubmitTimestamp,
          $lt: nextSubmitTimestamp,
        },
      },
      { $set: { 'updateArchive.$[elem].sent': true, submitted: false } },
      {
        arrayFilters: [
          {
            'elem.createdAt': {
              $gte: previousSubmitTimestamp,
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
    .find({
      submitted: true,
      'updateArchive.createdAt': {
        $gte: previousSubmitTimestamp,
        $lt: nextSubmitTimestamp,
      },
    })
    .project({ updateArchive: { $slice: -1 } })
    .toArray();

  const sendUpdatePromises = [];
  groupUpdates
    .filter((g: Member) => !!g.groups.length)
    .forEach((user: Member) => {
      user.groups.forEach((group: StandupGroup) => {
        console.log(user.about.first_name, 'sending', group.title);
        const theUpdate = user.updateArchive.slice(-1)[0];
        sendUpdatePromises.push(
          sendMsg(user.about.first_name, group.chatId, null, true, theUpdate)
        );
      });
    });

  await Promise.allSettled(sendUpdatePromises);
  if (sendUpdatePromises.length) {
    console.log('Marking as sent');
    await markAllSent();
  }

  return res.status(200).json({ status: 'ok' });
};
