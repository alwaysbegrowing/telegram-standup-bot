import { connectToDatabase } from '../_connectToDatabase';
import { sendMsg, sendReaction } from '../_helpers';
import { ALREADY_SUBSCRIBED_MESSAGE, SUBSCRIBED_MESSAGE } from '../_locale.en';
import type { About, Member, StandupGroup } from '../_types';

export const addToStandupGroup = async (
  chatId: number,
  userId: number,
  title: string,
  about: About,
  messageId: number,
) => {
  const { db } = await connectToDatabase();

  const userExistsInGroup = await db.collection<Member>('users').findOne({
    userId,
    'groups.chatId': chatId,
  });

  if (userExistsInGroup) {
    // await sendReaction({
    //   chat: { id: `${chatId}` },
    //   messageId,
    //   reactions: ['⚠️'],
    // });
    return await sendMsg(ALREADY_SUBSCRIBED_MESSAGE, chatId, messageId);
  }

  const group: StandupGroup = {
    chatId,
    title,
    winner: false,
  };

  const userExists = await db.collection<Member>('users').findOne({ userId });
  if (!userExists) {
    const member: Member = {
      userId,
      submitted: false,
      botCanMessage: false,
      updateArchive: [],
      about,
      groups: [group],
    };

    db.collection<Member>('users').insertOne(member);
  } else {
    db.collection<Member>('users').updateOne(
      { userId },
      { $push: { groups: group } },
    );
  }

  // return await sendReaction({
  //   chat: { id: `${chatId}` },
  //   messageId,
  //   reactions: ['✅'],
  // });
  return await sendMsg(SUBSCRIBED_MESSAGE, chatId, messageId);
};
