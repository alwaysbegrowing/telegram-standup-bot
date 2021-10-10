import fetch from 'node-fetch';
import { createHash, createHmac } from 'crypto';
import { connectToDatabase } from '@/pages/api/_connectToDatabase';
import memoize from 'fast-memoize';

export const telegramTypes = {
  text: 'sendMessage',
  voice: 'sendVoice',
  audio: 'sendAudio',
  poll: 'sendPoll',
  video: 'sendVideo',
  photo: 'sendPhoto',
  video_note: 'sendVideoNote',
  animation: 'sendAnimation',
  group: 'sendMediaGroup',
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
}

export interface About {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string;
  hash: string;
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

const getCaption = (caption = '', postfix = '') => {
  let response = '';

  if (postfix) {
    response = caption ? `${caption}\n\n- ${postfix}` : `- ${postfix}`;
  } else {
    response = caption || '';
  }

  return response;
};

const draftBody = (
  postfix: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  theUpdate: any = {}
) => {
  const body = theUpdate?.body || {};
  const type = theUpdate?.type || 'text';
  const file_id = theUpdate?.file_id || '';

  let data = {
    reply_to_message_id,
    chat_id,
    disable_notification,
    caption: getCaption(body?.message?.caption, postfix),
    entities: body?.message?.entities,
    media: file_id,
    caption_entities: body?.message?.caption_entities,
    [type]: file_id || postfix,
    type,
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
      [type]: `${body.message[type]}\n\n- ${postfix}`,
    };
  }

  return data;
};

export const sendMsg = async (
  postfix: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  theUpdate: any = {}
) => {
  const body = theUpdate?.body || {};
  const groupId = body?.message?.media_group_id;
  const type = groupId ? 'group' : theUpdate?.type || 'text';
  const apiEndpoint = telegramTypes[type] || telegramTypes.text;

  let data = draftBody(
    postfix,
    chat_id,
    reply_to_message_id,
    disable_notification,
    theUpdate
  );

  if (type === 'group') {
    const { db } = await connectToDatabase();
    const mediaGroup = await db
      .collection('users')
      .find({
        userId: theUpdate?.body?.message?.from?.id,
      })
      .project({
        updateArchive: {
          $filter: {
            input: '$updateArchive',
            as: 'update',
            cond: {
              $eq: ['$$update.body.message.media_group_id', groupId],
            },
          },
        },
      })
      .toArray();

    if (
      Array.isArray(mediaGroup) &&
      mediaGroup.length &&
      mediaGroup?.[0]?.updateArchive.length
    ) {
      data.media = [];
      mediaGroup[0].updateArchive.forEach((u, i) => {
        data.media.push(
          draftBody(
            !i && postfix,
            chat_id,
            reply_to_message_id,
            disable_notification,
            u
          )
        );
      });
    }
  }

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/${apiEndpoint}`;

  console.log(url);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

const secret = createHash('sha256')
  .update(process.env.TELEGRAM_API_KEY)
  .digest();

const signatureMath = ({ hash, ...data }) => {
  if (!hash) {
    return false;
  }

  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
};

export const checkSignature = memoize(signatureMath);
