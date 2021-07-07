import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const { db } = await connectToDatabase();
  const groups = await db.collection('groups').find({}).toArray();

  const reminders = [];

  // Only remind a person once even if they're in many groups
  const remindedUserIds = [];

  groups
    .filter((g) => !!g.members.length)
    .forEach((group: StandupGroup) => {
      group.members.forEach((member: Member) => {
        if (
          member.submitted === false &&
          !remindedUserIds.includes(`${member.about.id}`)
        ) {
          remindedUserIds.push(`${member.about.id}`);
          reminders.push(
            sendMsg(
              'Reminder, please submit an update. Updates are due by 11 AM EST',
              member.about.id
            )
          );
        }
      });
    });

  await Promise.all(reminders);

  res.status(200).json({ status: 'ok' });
};
