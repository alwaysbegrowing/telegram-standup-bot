import fetch from 'node-fetch';
import { telegramTypes } from './standup';

export interface StandupGroup {
  chatId: number;
  title: string;
  updateTime: string;
  members: Member[];
}

export interface UpdateArchive {
  update: string;
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
  submitted: boolean;
  botCanMessage: boolean;
  update: string;
  updateArchive: Array<UpdateArchive>;
  about: About;
  file_id: string;
  type: string;
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
      options: body.message[type].options.map((o) => o.text),
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
