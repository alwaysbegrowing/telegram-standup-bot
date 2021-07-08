import fetch from 'node-fetch';

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

export interface StandupGroup {
  chatId: number;
  title: string;
}

export interface UpdateArchive {
  createdAt: string;
  body: any;
}

export interface About {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
}

export interface Member {
  userId: number;
  submitted: boolean;
  botCanMessage: boolean;
  updateArchive: Array<UpdateArchive>;
  about: About;
  file_id: string;
  type: string;
  groups: Array<StandupGroup>;
}

export const sendMsg = async (
  text: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  file_id: string = '',
  type: string = 'text',
  body: any = {}
) => {
  console.log({
    text,
    chat_id,
    reply_to_message_id,
    disable_notification,
    file_id,
    type,
    body,
    telegramTypes,
  });
  const apiUrl = telegramTypes[type] || telegramTypes.text;

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/${apiUrl}`;
  let data = {
    reply_to_message_id,
    chat_id,
    disable_notification,
    caption: body?.message?.caption,
    [type]: file_id || text,
  };

  if (type === 'poll') {
    data = {
      ...data,
      ...body?.message?.[type],
      options: body?.message?.[type]?.options?.map((o) => o?.text),
    };
  } else if (type === 'photo') {
    data = {
      ...data,
      [type]: body?.message?.[type].slice(-1)[0].file_id,
    };
  }

  console.log(data);

  if (type !== 'text' && text.includes('(@')) {
    await sendMsg(text, chat_id, reply_to_message_id);
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
