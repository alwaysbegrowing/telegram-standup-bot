import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
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

  const sentStandup = [];
  users
    .filter((g) => !!g.groups.length)
    .forEach((user: Member) => {
      user.groups.forEach((group: StandupGroup) => {
        sentStandup.push(
          sendMsg(
            user.about.first_name +
              ' (@' +
              user.about.username +
              '): \n' +
              user.updateArchive?.slice(-1)[0]?.body?.message?.text,
            group.chatId,
            null,
            false,
            user.file_id,
            user.type,
            user.updateArchive.slice(-1)[0].body
          )
        );
      });
    });

  await Promise.all(sentStandup);
  await markAllSent();

  return res.status(200).json({ status: 'ok' });
};
