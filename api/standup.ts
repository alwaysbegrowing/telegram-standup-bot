import { NowRequest, NowResponse } from "@vercel/node";

const sendMsg = async (chatId: string) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage`;
  const data = {
    parse_mode: "MarkdownV2",
    chat_id: chatId,
    text: "Welcome to standup :)",
  };
  console.log(data);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

module.exports = async (req: NowRequest, res: NowResponse) => {
    console.log('sent')
  const { body } = req;
  const { message, chat } = body || {};
  console.log(req.body);
  const isGroupCommand =
    message?.entities?.[0]?.type === "bot_command" && chat?.type === "group";
  const isJoinCommand = isGroupCommand && message?.text?.find("join");
  if (isJoinCommand) {
    console.log("should join the chat");
    const r = await sendMsg(chat?.id);
    res.json({ status: r.status });
  }
};
