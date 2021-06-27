import { NowRequest, NowResponse } from "@vercel/node";
import { connectToDatabase } from "./_connectToDatabase";
import { sendMsg, StandupGroup, Member, About } from "./_helpers";

const standupTemplate = `Welcome! Simply post your standup here and it will automatically be posted to your group at 10m. You will recieve a few reminders if you do not submit your standup before 8am the day of.
Please use the following template for your standups:
Yesterday - 

Today -

Roadblocks - `;

const leaveStandupGroup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const db = await connectToDatabase();
  const removedUserFromGroup = await db.collection("groups").updateOne(
    {
      chatId,
    },
    { $pull: { members: { "about.id": userId } } }
  );
  if (removedUserFromGroup.modifiedCount) {
    return sendMsg("You have left the group.", chatId, messageId);
  }

  return sendMsg(
    "You aren't currently in a group. Join with /join !",
    chatId,
    messageId
  );
};

const startBot = async (userId: number) => {
  const db = await connectToDatabase();

  await db.collection("groups").updateMany(
    { "members.about.id": userId },
    {
      $set: {
        "members.$[elem].botCanMessage": true,
      },
    },
    { arrayFilters: [{ "elem.about.id": userId }] }
  );
};

const sendAboutMessage = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number,
) => {
  const db = await connectToDatabase();

  const group = await db.collection("groups").findOne({ chatId });
  if (group) {
  return sendMsg(JSON.stringify(group), chatId, messageId)
  }
  return sendMsg('There is no group for this channel. Create a group with /join', chatId, messageId)
};
const submitStandup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number,
  message
) => {
  const db = await connectToDatabase();
  const addUpdate = await db.collection("groups").updateOne(
    { "members.about.id": userId },
    {
      $set: {
        "members.$[elem].submitted": true,
        "members.$[elem].botCanMessage": true,
        "members.$[elem].lastSubmittedAt": Date.now(),
        "members.$[elem].update": message,
      },
    },
    { arrayFilters: [{ "elem.about.id": userId }] }
  );

  if (addUpdate.modifiedCount) {
    return sendMsg("Your update has been submitted.", chatId, messageId, true);
  }
  return sendMsg(
    "You aren't currently part of a standup group. Add this bot to your group, then use the /join comand to create a standup group",
    chatId,
    messageId
  );
};

const addToStandupGroup = async (
  chatId: number,
  userId: number,
  about: About,
  messageId: number
) => {
  const member: Member = {
    submitted: false,
    botCanMessage: false,
    lastSubmittedAt: "",
    update: "",
    about,
  };
  const db = await connectToDatabase();

  const userExistsInGroup = await db.collection("groups").findOne({
    chatId,
    "members.about.id": userId,
  });
  if (userExistsInGroup) {
    return sendMsg("You are already in the group.", chatId, messageId);
  }

  const groupExists = await db.collection("groups").findOne({ chatId });
  if (!groupExists) {
    const group: StandupGroup = {
      chatId,
      updateTime: "",
      members: [member],
    };
    db.collection("groups").insertOne(group);
  } else {
    db.collection("groups").updateOne(
      { chatId },
      { $push: { members: member } }
    );
  }

  return sendMsg(
    "You've been added to the standup group! Send me a private message @SuperSimpleStandupBot to recieve reminders.",
    chatId,
    messageId
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  const { body } = req;
  console.log(body)

  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};
  if (!text) return
  const isGroupCommand =
    (entities &&
    entities[0] &&
    entities[0].type === "bot_command" &&
    chat.type === "group") || chat.type === "supergroup";
  const isJoinCommand = isGroupCommand && text.search("/join") !== -1;
  const isLeaveCommand = isGroupCommand && text.search("/leave") !== -1;
  const isAboutCommand = isGroupCommand && text.search("/about") !== -1;
  const isPrivateMessage = chat && chat.type === "private";
  console.log({isGroupCommand, isJoinCommand, isAboutCommand, isPrivateMessage})

  const isPrivateCommand =
    entities &&
    entities[0] &&
    entities[0].type === "bot_command" &&
    chat &&
    chat.type === "private";
  const isPrivateStartCommand =
    isPrivateCommand && text.search("/start") !== -1;

  if (isPrivateStartCommand) {
    await startBot(from.id);
    const r = await sendMsg(standupTemplate, chat.id, message_id);
    return res.json({ status: r.status });
  } else if (isPrivateCommand) {
    const r = await sendMsg(
      "This command will not work in a private message. Please add me to a group to use this command.",
      chat.id,
      message_id
    );
    return res.json({ status: r.status });
  } else if (isPrivateMessage) {
    const r = await submitStandup(chat.id, from.id, from, message_id, text);
    return res.json({ status: r.status });
  }

  if (isJoinCommand) {
    const r = await addToStandupGroup(chat.id, from.id, from, message_id);
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
