import { createHash, createHmac } from 'crypto';
import memoize from 'fast-memoize';
import client from './_client';
import { ANONYMOUS } from './_locale.en';
import { Member } from './_types';

export const sendMsg = async (
  postfix: string,
  chat_id: number,
  reply_to_message_id: number = null,
) => {
  if (!client.connected) await client.connect();
  try {
    await client.sendMessage(chat_id, {
      message: postfix,
      replyTo: reply_to_message_id,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return { status: 500 };
  }

  return { status: 200 };
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

export const getDisplayName = (user: Member) => {
  const { first_name, last_name, username } = user.about;
  const userFullName = `${first_name || ''} ${last_name || ''}`.trim();
  if (userFullName) return userFullName;
  if (username) return username;

  return ANONYMOUS;
};
