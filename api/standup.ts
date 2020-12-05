import { NowRequest, NowResponse } from "@vercel/node";
import { connectToDatabase } from "./_connectToDatabase";
import { sendMsg, StandupGroup, Member, About } from "./_helpers";

const standupTemplate = `Welcome! Please use the below template for your standups. Standups are due at 10m. You will recieve a few reminders if you do not submit your standup.

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
        "members.$[elem].lastSubmittedAt": Date.now(),
        "members.$[elem].update": message,
      },
    },
    { arrayFilters: [{ "elem.about.id": userId }] }
  );

  if (addUpdate.modifiedCount) {
    return sendMsg("Your update has been submitted.", chatId, messageId);
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

  return sendMsg("Welcome to the standup group! :)", chatId, messageId);
};

export default async (req: NowRequest, res: NowResponse) => {
  const { body } = req;
  //   console.log(body)

  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};
  console.log(text);
  const isGroupCommand =
    entities?.[0]?.type === "bot_command" && chat?.type === "group";
  const isJoinCommand = isGroupCommand && text?.search("/join") !== -1;
  const isLeaveCommand = isGroupCommand && text?.search("/leave") !== -1;
  const isPrivateMessage = chat?.type === "private";

  const isPrivateCommand =
    entities?.[0]?.type === "bot_command" && chat?.type === "private";
  const isPrivateStartCommand =
    isPrivateCommand && text?.search("/start") !== -1;

  if (isPrivateStartCommand) {
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
  } else if (isLeaveCommand) {
    const r = await leaveStandupGroup(chat.id, from.id, from, message_id);
    return res.json({ status: r.status });
  } else {
    return res.json({ status: 500 });
  }
};
