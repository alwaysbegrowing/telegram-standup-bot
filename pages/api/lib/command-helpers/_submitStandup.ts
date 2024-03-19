import { connectToDatabase } from '../_connectToDatabase';
import { sendMsg } from '../_helpers';
import {
  GROUP_MEDIA_SUBMITTED_MESSAGE,
  INVALID_EDIT_MESSAGE,
  NO_SUBSCRIBED_GROUPS_MESSAGE,
  NO_WINNING_GROUPS_MESSAGE,
  UPDATE_EDITED_MESSAGE,
  UPDATE_SUBMITTED_MESSAGE,
} from '../_locale.en';
import { getWinningGroupsForUser } from '../_lottery';
import { telegramTypes } from '../_types';
import type { Member } from '@/pages/api/lib/_types';
import { sendReaction } from '@/pages/api/lib/_helpers';

// A message is sent to the bot
export const submitStandup = async (
  chatId: number,
  userId: number,
  messageId: number,
  body: any,
) => {
  console.log(body);

  // only winners get to submit an update
  const groups = await getWinningGroupsForUser(userId);
  if (!groups || !groups.length) {
    return await sendMsg(NO_WINNING_GROUPS_MESSAGE, chatId, messageId);
  }

  const isEdit = !!body?.edited_message;
  const message = body?.message || body?.edited_message;
  const type = Object.keys(message).find((a) => telegramTypes[a]);
  let file_id = message[type]?.file_id;

  if (type === 'photo') {
    file_id = message?.[type].slice(-1)[0].file_id;
  }

  let SUCCESS_MESSAGE = isEdit
    ? UPDATE_EDITED_MESSAGE
    : UPDATE_SUBMITTED_MESSAGE;

  let sendMessage = true;
  const { db } = await connectToDatabase();

  // Album
  const groupId = message?.media_group_id;
  if (groupId) {
    const mediaGroup = await db
      .collection('users')
      .find({
        userId,
      })
      .project({
        updateArchive: {
          $filter: {
            input: '$updateArchive',
            as: 'update',
            cond: {
              $eq: ['$$update.body.message.media_group_id', groupId],
            },
          },
        },
      })
      .toArray();

    if (
      Array.isArray(mediaGroup) &&
      mediaGroup.length &&
      mediaGroup?.[0]?.updateArchive.length
    ) {
      console.log('Found a group', mediaGroup[0].updateArchive);
      // Found a group
      // Since the first message was already sent don't send more
      sendMessage = false;
    } else {
      // Alter message to let them know we see all their media
      SUCCESS_MESSAGE = GROUP_MEDIA_SUBMITTED_MESSAGE;
    }
  }

  const entities = message?.entities || message?.caption_entities;

  let dbResponse;
  if (isEdit) {
    dbResponse = await db.collection<Member>('users').updateOne(
      {
        'updateArchive.body.message.message_id': message.message_id,
      },
      {
        $set: {
          'updateArchive.$[elem]': {
            sent: false,
            file_id,
            entities,
            caption: message?.caption,
            type,
            createdAt: Date.now(),
            body: {
              ...body,
              edited_message: true,
              message: body.edited_message,
            },
          },
        },
      },
      {
        arrayFilters: [
          {
            'elem.body.message.message_id': message.message_id,
            'elem.sent': false,
          },
        ],
      },
    );
  } else {
    dbResponse = await db.collection<Member>('users').updateOne(
      { userId },
      {
        $set: {
          submitted: true,
          botCanMessage: true,
        },
        $push: {
          updateArchive: {
            sent: false,
            file_id,
            entities,
            caption: message?.caption,
            type,
            createdAt: Date.now().toString(),
            body,
          },
        },
      },
    );
  }

  // Already told the user they submitted
  if (!sendMessage) {
    return { status: 200 };
  }

  if (dbResponse.modifiedCount || dbResponse.modifiedCount) {
    // return await sendReaction({
    //   chat: { id: `${chatId}` },
    //   messageId,
    //   reactions: ['👍'],
    // });
    return await sendMsg(SUCCESS_MESSAGE, chatId, messageId);
  }

  if (isEdit && dbResponse.modifiedCount === 0) {
    return await sendMsg(INVALID_EDIT_MESSAGE, chatId, messageId);
  }

  return await sendMsg(NO_SUBSCRIBED_GROUPS_MESSAGE, chatId, messageId);
};
