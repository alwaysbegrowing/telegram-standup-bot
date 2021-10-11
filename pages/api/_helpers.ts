import fetch from 'node-fetch';
import { createHash, createHmac } from 'crypto';
import { connectToDatabase } from '@/pages/api/_connectToDatabase';
import memoize from 'fast-memoize';
import { telegramTypes, UpdateArchive } from '../lib/types';

const appendAuthor = (caption = '', postfix = '', createdAt = '') => {
  let response = '';

  if (postfix) {
    response = caption ? `${caption}\n\n${postfix}` : postfix;
  } else {
    response = caption || '';
  }

  // TODO: think about timezone submissions
  if (createdAt) {
    // response = `${response}\n\n${createdAt}`;
  }

  // captions & texts
  const maxLengths = [1024, 4096];
  const captionLength = caption.length;

  if (maxLengths.includes(captionLength) && !caption.includes(postfix)) {
    response = appendAuthor(
      caption.slice(0, captionLength - (response.length - captionLength)),
      postfix,
      createdAt
    );
  }

  return response;
};

const draftBody = (
  postfix: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  theUpdate?: UpdateArchive
) => {
  const body = theUpdate?.body || {};
  const type = theUpdate?.type || 'text';
  const file_id = theUpdate?.file_id || '';

  let data = {
    reply_to_message_id,
    chat_id,
    disable_notification,
    caption: appendAuthor(
      body?.message?.caption,
      postfix,
      theUpdate?.createdAt
    ),
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
      [type]: appendAuthor(body.message[type], postfix, theUpdate?.createdAt),
    };
  }

  return data;
};

const sent = {};
export const sendMsg = async (
  postfix: string,
  chat_id: number,
  reply_to_message_id: number = null,
  disable_notification: boolean = false,
  theUpdate?: UpdateArchive,
  allUpdates?: UpdateArchive[]
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

  if (Array.isArray(sent[chat_id]) && sent[chat_id].includes(groupId)) {
    console.log(groupId, 'already sent');
    return false;
  }

  if (type === 'group') {
    sent[chat_id] = Array.isArray(sent[chat_id])
      ? [...sent[chat_id], groupId]
      : [groupId];
    const mediaGroup = allUpdates.filter((update: UpdateArchive) => {
      return update.body?.message?.media_group_id === groupId;
    });

    if (Array.isArray(mediaGroup) && mediaGroup.length) {
      data.media = [];
      mediaGroup.forEach((u, i) => {
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

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((r) => console.log(r));
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

export const getSubmissionDates = () => {
  // Releases are at 4pm UTC every day
  const nextSubmit = new Date();
  nextSubmit.setUTCHours(15);
  nextSubmit.setUTCMinutes(8);
  nextSubmit.setUTCSeconds(0);

  // Can manually send a day by setting it here (3 less than today for example)
  // nextSubmit.setUTCDate(nextSubmit.getUTCDate() - 3);

  // Manually send tomorrow's update by doing + 1
  // nextSubmit.setUTCDate(nextSubmit.getUTCDate() + 1);

  const nextSubmitTimestamp = nextSubmit.getTime();
  nextSubmit.setUTCDate(nextSubmit.getUTCDate() - 1);
  const previousSubmitTimestamp = nextSubmit.getTime();

  return { previousSubmitTimestamp, nextSubmitTimestamp };
};
