import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg } from './_helpers';
import { Member } from '../lib/types';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.query.key !== process.env.TELEGRAM_API_KEY
  ) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { db } = await connectToDatabase();
  const users = await db.collection('users').find({}).toArray();

  const notSubmittedMessage = `Reminder: please submit an update.

  You can send me a simple message, or spice it up with a video / photo with a caption, gif, voice message, or video message!

  Your update will send one hour from now.`;

  const submittedMessage = `Reminder: the update you previously submitted will be posted in one hour from now.

  If you want to change your update, send me a simple message, or spice it up with a video / photo with a caption, gif, voice message, or video message!`;

  const reminders = [];
  users
    .filter((g) => !!g.groups.length)
    .forEach((user: Member) => {
      reminders.push(
        sendMsg(
          user.submitted ? submittedMessage : notSubmittedMessage,
          user.userId
        )
      );
    });

  await Promise.all(reminders);

  return res.status(200).json({ status: 'ok', sendCount: reminders.length });
};
