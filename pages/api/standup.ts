import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import {
  sendMsg,
  StandupGroup,
  Member,
  About,
  telegramTypes,
} from './_helpers';

const standupTemplate = `Welcome!

To get started, add this bot to your chat and type /subscribe to subscribe them to your updates.

Afterwards, post a message here and it will automatically be sent to your chat at 11:00 am. You will receive a few reminders if you do not submit your standup before 8:00 am the day of.

Perfect for letting your friends, family, coworkers know what you're up to today or accomplished yesterday!`;

const leaveStandupGroup = async (
  chatId: number,
  userId: number,
  about: About,
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
    return await sendMsg(
      'This chat is now unsubscribed from your daily updates.',
      chatId,
      messageId
    );
  }

  return await sendMsg(
    'This chat is not yet subscribed to your daily updates.',
    chatId,
    messageId
  );
};

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

/** Just a random debugger */
const sendAboutMessage = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const { db } = await connectToDatabase();

  const user = await db.collection('users').findOne({ userId });
  if (user) {
    return await sendMsg(JSON.stringify(user), chatId, messageId);
  }
  return await sendMsg(
    'You dont exist in this chat. Create a subscription with /subscribe',
    chatId,
    messageId
  );
};

/** Time to make an update */
const submitStandup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number,
  message: string,
  body: any
) => {
  const type = Object.keys(body?.message).find((a) => telegramTypes[a]);
  let file_id = body.message?.[type]?.file_id;

  if (type === 'photo') {
    file_id = body?.message?.[type].slice(-1)[0].file_id;
  }

  const { db } = await connectToDatabase();
  let file_path = '';

  if (file_id) {
    try {
      const download_url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${file_id}`;
      const file = await fetch(download_url);
      const json = await file.json();
      if (json?.ok) {
        file_path = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${json?.result?.file_path}`;
      }
    } catch (e) {}
  }

  const addUpdate = await db.collection('users').updateOne(
    { userId },
    {
      $set: {
        submitted: true,
        botCanMessage: true,
      },
      $push: {
        updateArchive: {
          file_id,
          caption: body?.message?.caption,
          type,
          file_path,
          createdAt: Date.now(),
          body,
        },
      },
    }
  );

  // console.log(body);

  if (addUpdate.modifiedCount) {
    return await sendMsg(
      'Your update has been submitted.',
      chatId,
      messageId,
      true
    );
  }

  return await sendMsg(
    "You haven't subscribed any chats to your daily updates yet! Add this bot to your chat, then type /subscribe to subscribe them.",
    chatId,
    messageId
  );
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
    return await sendMsg(
      'This chat is already subscribed to your daily updates.',
      chatId,
      messageId
    );
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

  return await sendMsg(
    `This chat is now subscribed to your daily updates. Send me a message  @${process.env.BOT_NAME} to get started.`,
    chatId,
    messageId
  );
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req.query.key !== process.env.TELEGRAM_API_KEY) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  const { body } = req;
  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};

  // Don't try to parse this message if missing info
  if (!message || !Object.keys(message).some((a) => telegramTypes[a])) {
    console.log('Quitting early', message);
    return res.status(200).json({ status: 'invalid' });
  } else {
    console.log('Received valid request');
  }

  const isGroupCommand =
    (entities &&
      entities[0] &&
      entities[0].type === 'bot_command' &&
      chat.type === 'group') ||
    chat.type === 'supergroup';
  const isSubscribeCommand =
    isGroupCommand && text && text.search('/subscribe') !== -1;
  const isUnsubscribeCommand =
    isGroupCommand && text && text.search('/unsubscribe') !== -1;
  const isPrivateMessage = chat && chat.type === 'private';

  const isPrivateCommand =
    entities?.[0]?.type === 'bot_command' && chat?.type === 'private';
  const isPrivateStartCommand =
    isPrivateCommand && text && text.search('/start') !== -1;

  if (isPrivateStartCommand) {
    await startBot(from.id);
    const r = await sendMsg(standupTemplate, chat.id, message_id);
    return res.json({ status: r.status });
  } else if (isPrivateCommand) {
    const r = await sendMsg(
      'Add me to a chat, then send this command in that chat instead.',
      chat.id,
      message_id
    );
    return res.json({ status: r.status });
  } else if (isPrivateMessage) {
    const r = await submitStandup(
      chat.id,
      from.id,
      from,
      message_id,
      text,
      body
    );
    return res.json({ status: r.status });
  }

  if (isSubscribeCommand) {
    const r = await addToStandupGroup(
      chat.id,
      from.id,
      chat.title,
      from,
      message_id
    );
    return res.json({ status: r.status });
  } else if (isUnsubscribeCommand) {
    const r = await leaveStandupGroup(chat.id, from.id, from, message_id);
    return res.json({ status: r.status });
  } else {
    return res.status(500).json({ status: 'error' });
  }
};
