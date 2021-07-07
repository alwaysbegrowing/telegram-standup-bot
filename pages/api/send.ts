import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: NowRequest, res: NowResponse) => {
  const { db } = await connectToDatabase();

  const addUpdate = async () => {
    await db.collection('groups').updateMany(
      {},
      {
        $set: {
          'members.$[elem].submitted': false,
          'members.$[elem].update': '',
        },
      },
      { arrayFilters: [{ 'elem.submitted': true }] }
    );
  };
  const groups = await db.collection('groups').find({}).toArray();

  const sentStandup = [];
  groups
    .filter((g) => !!g.members.length)
    .forEach((group: StandupGroup) => {
      group.members
        .filter((m) => m.submitted)
        .forEach((member: Member) => {
          sentStandup.push(
            sendMsg(
              member.about.first_name +
                ' (@' +
                member.about.username +
                '): \n' +
                member.update,
              group.chatId,
              null,
              false,
              member.file_id,
              member.type,
              member.updateArchive.slice(-1)[0].body
            )
          );
        });
    });

  await Promise.all(sentStandup);
  await addUpdate();

  return res.status(200);
};
