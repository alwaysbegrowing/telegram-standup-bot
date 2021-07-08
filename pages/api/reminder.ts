import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const { db } = await connectToDatabase();
  const users = await db
    .collection('users')
    .find({ submitted: false })
    .toArray();

  const reminders = [];

  users
    .filter((g) => !!g.groups.length)
    .forEach((user: Member) => {
      reminders.push(
        sendMsg(
          'Reminder, please submit an update. Updates are due by 11 AM EST',
          user.userId
        )
      );
    });

  await Promise.all(reminders);

  return res.status(200).json({ status: 'ok', sendCount: reminders.length });
};
