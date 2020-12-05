import { NowRequest, NowResponse } from "@vercel/node";
import fetch from "node-fetch";
const connectToDatabase = require("./_connectToDatabase");

interface StandupGroup {
  chatId: string;
  updateTime: string;
  members: Member[];
}

interface Member {
  submitted: boolean;
  lastSubmittedAt: string;
  update: string;
  about: About;
}
interface About {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
}

const leaveStandupGroup = async (
  chatId: string,
  userId: string,
  about: About,
  messageId: string
) => {
  const db = await connectToDatabase();
  const removedUserFromGroup = await db.collection("groups").updateOne({
    chatId},
   {$pull: { members: {'about.id': userId }},
  });
  if (removedUserFromGroup.modifiedCount) {
    return sendMsg("You have left the group.", chatId, messageId);
  }

  return sendMsg(
    "You aren't currently in a group. Join with /join !",
    chatId,
    messageId
  );
};

const addToStandupGroup = async (
  chatId: string,
  userId: string,
  about: About,
  messageId: string
) => {
  const member: Member = {
    submitted: false,
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

const sendMsg = async (
  text: string,
  chat_id: string,
  reply_to_message_id: string
) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage`;
  const data = {
    reply_to_message_id,
    chat_id,
    text,
  };
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

module.exports = async (req: NowRequest, res: NowResponse) => {
  console.log("msg");
  const { body } = req;
  const { message } = body || {};
  const { chat, entities, text, message_id, from } = message || {};
  const isGroupCommand =
    entities?.[0]?.type === "bot_command" && chat?.type === "group";
  const isJoinCommand = isGroupCommand && text?.search("join") !== -1;
  const isLeaveCommand = isGroupCommand && text?.search("leave") !== -1;

  if (isJoinCommand) {
    const r = await addToStandupGroup(chat.id, from.id, from, message_id);
    res.json({ status: r.status });
  } else if (isLeaveCommand) {
    const r = await leaveStandupGroup(chat.id, from.id, from, message_id);
    res.json({ status: r.status });
  } else {
    res.json({ status: 500 });
  }
};
