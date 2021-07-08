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

To get started, add this bot to your group and type /add to create a standup for your chat.

Afterwards, post a message here and it will automatically be sent to your group at 11:00 am. You will receive a few reminders if you do not submit your standup before 8:00 am the day of.

Please use the following template for your standups:

Yesterday:
...

Today:
...

Roadblocks
...`;

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
    return sendMsg('You have left the group.', chatId, messageId);
  }

  return sendMsg(
    "You aren't currently in a group. Join with /add !",
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
    return sendMsg(JSON.stringify(user), chatId, messageId);
  }
  return sendMsg(
    'You dont exist in this channel. Create a group with /add',
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
  const { db } = await connectToDatabase();
  const addUpdate = await db.collection('users').updateOne(
    { userId },
    {
      $set: {
        submitted: true,
        botCanMessage: true,
      },
      $push: {
        updateArchive: {
          update: message || '',
          file_id: body.message?.[type]?.file_id,
          type: type,
          message: message || '',
          createdAt: Date.now(),
          body,
        },
      },
    }
  );

  if (addUpdate.modifiedCount) {
    return sendMsg('Your update has been submitted.', chatId, messageId, true);
  }

  return sendMsg(
    "You aren't currently part of a standup group. Add this bot to your group, then use the /add command to create a standup group",
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

  if (userExistsInGroup) {
    return sendMsg('You are already in the group.', chatId, messageId);
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
      file_id: '',
      type: 'text',
      groups: [group],
    };

    db.collection('users').insertOne(member);
  } else {
    db.collection('users').updateOne({ userId }, { $push: { groups: group } });
  }

  return sendMsg(
    `You've been added to the standup group! Send me a private message @${process.env.BOT_NAME} to receive reminders.`,
    chatId,
    messageId
  );
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const { body } = req;
  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};

  // Don't try to parse this message if missing info
  if (!message || !Object.keys(message).some((a) => telegramTypes[a])) {
    console.log('Quitting early', message);
    return res.status(200).json({ status: 'invalid' });
  }

  const isGroupCommand =
    (entities &&
      entities[0] &&
      entities[0].type === 'bot_command' &&
      chat.type === 'group') ||
    chat.type === 'supergroup';
  const isAddCommand = isGroupCommand && text && text.search('/add') !== -1;
  const isLeaveCommand = isGroupCommand && text && text.search('/leave') !== -1;
  const isAboutCommand = isGroupCommand && text && text.search('/about') !== -1;
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
      'This command will not work in a private message. Please add me to a group to use this command.',
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

  if (isAddCommand) {
    const r = await addToStandupGroup(
      chat.id,
      from.id,
      chat.title,
      from,
      message_id
    );
    return res.json({ status: r.status });
  } else if (isAboutCommand) {
    const r = await sendAboutMessage(chat.id, from.id, from, message_id);
    return res.json({ status: r.status });
  } else if (isLeaveCommand) {
    const r = await leaveStandupGroup(chat.id, from.id, from, message_id);
    return res.json({ status: r.status });
  } else {
    return res.status(500).json({ status: 'error' });
  }
};
