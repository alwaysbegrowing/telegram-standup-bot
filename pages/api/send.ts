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

  const { db } = await connectToDatabase();

  const markAllSent = async () => {
    await db
      .collection('users')
      .updateMany({ submitted: true }, { $set: { submitted: false } });
  };

  const users = await db
    .collection('users')
    .find({ submitted: true })
    .toArray();

  const sendPromises = [];
  users
    .filter((g) => !!g.groups.length)
    .forEach((user: Member) => {
      user.groups.forEach(async (group: StandupGroup) => {
        const theUpdate = user.updateArchive.slice(-1)[0];

        await sendMsg(`${user.about.first_name}:`, group.chatId, null, true);
        await sendMsg(``, group.chatId, null, true, theUpdate);
      });
    });

  if (process.env.NODE_ENV === 'production') {
    await markAllSent();
  }

  return res.status(200).json({ status: 'ok' });
};
