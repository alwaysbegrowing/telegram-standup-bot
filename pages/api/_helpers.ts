import fetch from 'node-fetch';

export interface StandupGroup {
  chatId: number;
  updateTime: string;
  members: Member[];
}

export interface UpdateArchive {
  update: string;
  createdAt: string;
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
  lastSubmittedAt: string;
  update: string;
  updateArchive: Array<UpdateArchive>;
  about: About;
}

export const sendMsg = async (
  text: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false
) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage`;
  const data = {
    reply_to_message_id,
    chat_id,
    text,
    disable_notification,
  };
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
