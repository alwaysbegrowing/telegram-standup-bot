import { connectToDatabase } from '../_connectToDatabase';
import { sendMsg, sendReaction } from '../_helpers';
import { ALREADY_SUBSCRIBED_MESSAGE, SUBSCRIBED_MESSAGE } from '../_locale.en';
import { About, Member, StandupGroup } from '../_types';

export const addToStandupGroup = async (
  chatId: number,
  userId: number,
  title: string,
  about: About,
  messageId: number,
) => {
  const { db } = await connectToDatabase();

  const userExistsInGroup = await db.collection('users').findOne({
    userId,
    'groups.chatId': chatId,
  });

  console.log('adding');

  if (userExistsInGroup) {
    console.log({
      chatId,
      messageId,
      userId,
    });
    return await sendReaction({ chat: { id: `${chatId}` }, messageId });
    // return await sendMsg(ALREADY_SUBSCRIBED_MESSAGE, chatId, messageId);
  }

  const group: StandupGroup = {
    chatId,
    title,
    winner: false,
  };

  const userExists = await db.collection('users').findOne({ userId });
  if (!userExists) {
    const member: Member = {
      userId,
      submitted: false,
      botCanMessage: false,
      updateArchive: [],
      about,
      groups: [group],
    };

    db.collection('users').insertOne(member);
  } else {
    db.collection('users').updateOne({ userId }, { $push: { groups: group } });
  }

  return await sendMsg(SUBSCRIBED_MESSAGE, chatId, messageId);
};
