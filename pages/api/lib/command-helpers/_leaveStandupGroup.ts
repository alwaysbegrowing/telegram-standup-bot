import { connectToDatabase } from '../_connectToDatabase';
import { sendMsg } from '../_helpers';
import {
  INVALID_UNSUBSCRIBE_MESSAGE,
  UNSUBSCRIBED_MESSAGE,
} from '../_locale.en';
import type { Member } from '@/pages/api/lib/_types';

export const leaveStandupGroup = async (
  chatId: number,
  userId: number,
  messageId: number,
) => {
  const { db } = await connectToDatabase();
  const removedUserFromGroup = await db.collection<Member>('users').updateOne(
    {
      userId,
    },
    { $pull: { groups: { chatId } } },
  );

  if (removedUserFromGroup.modifiedCount) {
    return await sendMsg(UNSUBSCRIBED_MESSAGE, chatId, messageId);
  }

  return await sendMsg(INVALID_UNSUBSCRIBE_MESSAGE, chatId, messageId);
};
