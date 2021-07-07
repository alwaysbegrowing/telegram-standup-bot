import { NowRequest, NowResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { sendMsg, StandupGroup, Member, About } from './_helpers';

export const telegramTypes = {
  text: 'sendMessage',
  voice: 'sendVoice',
  audio: 'sendAudio',
  poll: 'sendPoll',
  video: 'sendVideo',
  photo: 'sendPhoto',
  video_note: 'sendVideoNote',
  animation: 'sendAnimation',
};

const standupTemplate = `Welcome!

To get started, add this bot to your group and type /add to create a standup for your chat.

Afterwards, post a message here and it will automatically be sent to your group at 11:00 am. You will recieve a few reminders if you do not submit your standup before 8:00 am the day of.

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
  const db = await connectToDatabase();
  const removedUserFromGroup = await db.collection('groups').updateOne(
    {
      chatId,
    },
    { $pull: { members: { 'about.id': userId } } }
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

const startBot = async (userId: number) => {
  const db = await connectToDatabase();

  await db.collection('groups').updateMany(
    { 'members.about.id': userId },
    {
      $set: {
        'members.$[elem].botCanMessage': true,
      },
    },
    { arrayFilters: [{ 'elem.about.id': userId }] }
  );
};

const sendAboutMessage = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const db = await connectToDatabase();

  const group = await db.collection('groups').findOne({ chatId });
  if (group) {
    return sendMsg(JSON.stringify(group), chatId, messageId);
  }
  return sendMsg(
    'There is no group for this channel. Create a group with /add',
    chatId,
    messageId
  );
};
const submitStandup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number,
  message: string,
  body: any
) => {
  const type = Object.keys(body?.message).find((a) => telegramTypes[a]);
  const db = await connectToDatabase();
  const addUpdate = await db.collection('groups').updateMany(
    { 'members.about.id': userId },
    {
      $set: {
        'members.$[elem].submitted': true,
        'members.$[elem].botCanMessage': true,
        'members.$[elem].update': message || '',
        'members.$[elem].file_id': body.message?.[type]?.file_id,
        'members.$[elem].type': type,
      },
      $push: {
        'members.$[elem].updateArchive': {
          message: message || '',
          createdAt: Date.now(),
          body,
        },
      },
    },
    { arrayFilters: [{ 'elem.about.id': userId }] }
  );

  if (addUpdate.modifiedCount) {
    return sendMsg('Your update has been submitted.', chatId, messageId, true);
  }

  return sendMsg(
    "You aren't currently part of a standup group. Add this bot to your group, then use the /add comand to create a standup group",
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
  const member: Member = {
    submitted: false,
    botCanMessage: false,
    update: '',
    updateArchive: [],
    about,
    file_id: '',
    type: 'text',
  };
  const db = await connectToDatabase();

  const userExistsInGroup = await db.collection('groups').findOne({
    chatId,
    'members.about.id': userId,
  });
  if (userExistsInGroup) {
    return sendMsg('You are already in the group.', chatId, messageId);
  }

  const groupExists = await db.collection('groups').findOne({ chatId });
  if (!groupExists) {
    const group: StandupGroup = {
      chatId,
      title,
      updateTime: '',
      members: [member],
    };
    db.collection('groups').insertOne(group);
  } else {
    db.collection('groups').updateOne(
      { chatId },
      { $push: { members: member } }
    );
  }

  return sendMsg(
    `You've been added to the standup group! Send me a private message @${process.env.BOT_NAME} to recieve reminders.`,
    chatId,
    messageId
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  const { body } = req;
  console.log(body);

  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};

  // Don't try to parse this message if missing info
  if (!message || !Object.keys(message).some((a) => telegramTypes[a])) {
    console.log('Quitting early', message);
    return res.json({ status: 200 });
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
  console.log({
    isGroupCommand,
    isAddCommand,
    isLeaveCommand,
    isAboutCommand,
    isPrivateMessage,
  });

  const isPrivateCommand =
    entities &&
    entities[0] &&
    entities[0].type === 'bot_command' &&
    chat &&
    chat.type === 'private';
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
    return res.json({ status: 500 });
  }
};
