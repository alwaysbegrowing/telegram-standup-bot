import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { StandupGroup, Member } from './_helpers';

module.exports = async (req: NowRequest, res: NowResponse) => {
  const db = await connectToDatabase();
  const groups = await db.collection('groups').find({}).toArray();

  res.json({
    data: groups.filter((g: StandupGroup) => !!g.members.length),
    status: 200,
  });
};
