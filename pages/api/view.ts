import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: NowRequest, res: NowResponse) => {
  const db = await connectToDatabase();
  const groups = await db.collection('groups').find({}).toArray();

  const reminders = [];
  groups.forEach((group: StandupGroup) => {
    group.members
      .filter((m) => m.update !== '')
      .forEach((member: Member) => {
        console.log(member);
      });
  });

  await Promise.all(reminders);

  res.json({
    status: 200,
  });
};
