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
  type: string;
  file_path: string;
  file_id: string;
  body: any;
  userId: number;
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
  groups: Array<StandupGroup>;
}

export const sendMsg = async (
  text: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  theUpdate: any = {}
) => {
  console.log(theUpdate);
  const body = theUpdate?.body || {};
  const type = theUpdate?.type || 'text';
  const file_id = theUpdate?.file_id || '';
  const apiUrl = telegramTypes[type] || telegramTypes.text;

  console.log({
    text,
    chat_id,
    reply_to_message_id,
    disable_notification,
    theUpdate,
    telegramTypes,
    apiUrl,
    file_id,
    type,
    body,
  });

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
  } else if (type === 'text' && body?.message?.[type]) {
    data = {
      ...data,
      [type]: `${text}\n${body?.message?.[type]}`,
    };
  }

  console.log(data);

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
