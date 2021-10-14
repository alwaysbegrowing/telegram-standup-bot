import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg } from './_helpers';
import { Member } from './lib/_types';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.query.key !== process.env.TELEGRAM_API_KEY
  ) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { db } = await connectToDatabase();
  const users = await db.collection('users').find({}).toArray();

  const notSubmittedMessage = `(1 hour reminder) Tick tock. Ready to submit an update?

Send me a message, or spice it up with some photos! Afterall, pictures tell a thousand words. Can you guess how many a video could tell? `;

  const submittedMessage = `(1 hour reminder) The update you previously submitted will be posted soon!

If you want to change your update, edit your last message.`;

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
