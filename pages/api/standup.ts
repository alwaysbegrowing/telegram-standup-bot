import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/_connectToDatabase';
import { sendMsg } from './lib/_helpers';
import { StandupGroup, Member, About, telegramTypes } from './lib/_types';
import {
  ALREADY_SUBSCRIBED_MESSAGE,
  GROUP_MEDIA_SUBMITTED_MESSAGE,
  INVALID_EDIT_MESSAGE,
  INVALID_PRIVATE_MESSAGE,
  INVALID_UNSUBSCRIBE_MESSAGE,
  NO_SUBSCRIBED_GROUPS_MESSAGE,
  START_MESSAGE,
  SUBSCRIBED_MESSAGE,
  UNSUBSCRIBED_MESSAGE,
  UPDATE_EDITED_MESSAGE,
  UPDATE_SUBMITTED_MESSAGE,
} from './lib/_locale.en';

/**
 * The beginning
 *
 * @param userId
 */
const startBot = async (userId: number) => {
  const { db } = await connectToDatabase();

  await db.collection('users').updateOne(
    { userId },
    {
      $set: {
        botCanMessage: true,
      },
    }
  );
};

const leaveStandupGroup = async (
  chatId: number,
  userId: number,
  messageId: number
) => {
  const { db } = await connectToDatabase();
  const removedUserFromGroup = await db.collection('users').updateOne(
    {
      userId,
    },
    { $pull: { groups: { chatId } } }
  );

  if (removedUserFromGroup.modifiedCount) {
    return await sendMsg(UNSUBSCRIBED_MESSAGE, chatId, messageId);
  }

  return await sendMsg(INVALID_UNSUBSCRIBE_MESSAGE, chatId, messageId);
};

// A message is sent to the bot
const submitStandup = async (
  chatId: number,
  userId: number,
  messageId: number,
  body: any
) => {
  console.log(body);

  const isEdit = !!body?.edited_message;
  let message = body?.message || body?.edited_message;
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
    dbResponse = await db.collection('users').updateOne(
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
        multi: true,
      }
    );
  } else {
    dbResponse = await db.collection('users').updateOne(
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
            createdAt: Date.now(),
            body,
          },
        },
      }
    );
  }

  // Already told the user they submitted
  if (!sendMessage) {
    return { status: 200 };
  }

  if (dbResponse.modifiedCount || dbResponse.modifiedCount) {
    return await sendMsg(SUCCESS_MESSAGE, chatId, messageId, true);
  }

  if (isEdit && dbResponse.modifiedCount === 0) {
    return await sendMsg(INVALID_EDIT_MESSAGE, chatId, messageId);
  }

  return await sendMsg(NO_SUBSCRIBED_GROUPS_MESSAGE, chatId, messageId);
};

const addToStandupGroup = async (
  chatId: number,
  userId: number,
  title: string,
  about: About,
  messageId: number
) => {
  const { db } = await connectToDatabase();

  const userExistsInGroup = await db.collection('users').findOne({
    userId,
    'groups.chatId': chatId,
  });

  console.log('adding');

  if (userExistsInGroup) {
    return await sendMsg(ALREADY_SUBSCRIBED_MESSAGE, chatId, messageId);
  }

  const group: StandupGroup = {
    chatId,
    title,
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

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req.query.key !== process.env.TELEGRAM_API_KEY) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { body } = req;

  let message = body?.message || body?.edited_message;
  const { chat, entities, text, message_id, from } = message || {};

  // Don't try to parse this message if missing info
  if (!message || !Object.keys(message).some((a) => telegramTypes[a])) {
    console.log('Quitting early', message, body);
    // This has to be a 200 or else Telegram will try to resend it
    return res.status(200).json({ status: 'invalid' });
  }

  // Between you and the bot in a public group
  const inGroup = chat?.type === 'group' || chat?.type === 'supergroup';
  const isBotCommand = entities?.[0]?.type === 'bot_command';
  const isGroupCommand = inGroup && isBotCommand;
  const isSubscribeCommand = isGroupCommand && text?.includes('/subscribe');
  const isUnsubscribeCommand = isGroupCommand && text?.includes('/unsubscribe');

  // Between you and the bot in a private chat
  const isPrivateMessage = chat?.type === 'private';
  const isPrivateCommand = isBotCommand && isPrivateMessage;
  const isStartCommand = isPrivateCommand && text?.includes('/start');

  if (isStartCommand) {
    await startBot(from.id);
    const r = await sendMsg(START_MESSAGE, chat.id, message_id);
    return res.json({ status: r.status });
  }

  // We only accept start command as a private command
  if (isPrivateCommand) {
    const r = await sendMsg(INVALID_PRIVATE_MESSAGE, chat.id, message_id);
    return res.json({ status: r.status });
  }

  // Private to the bot, must be a standup update so lets save it
  if (isPrivateMessage) {
    const r = await submitStandup(chat.id, from.id, message_id, body);
    const status = r?.status || 200;
    return res.json({ status });
  }

  // In a group
  if (isSubscribeCommand) {
    const r = await addToStandupGroup(
      chat.id,
      from.id,
      chat.title,
      from,
      message_id
    );
    return res.json({ status: r.status });
  }

  // In a group
  if (isUnsubscribeCommand) {
    const r = await leaveStandupGroup(chat.id, from.id, message_id);
    return res.json({ status: r.status });
  }

  return res.status(200).json({ status: 'invalid command' });
};
