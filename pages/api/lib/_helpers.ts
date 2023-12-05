import BigInt from 'big-integer';
import { createHash, createHmac } from 'crypto';
import memoize from 'fast-memoize';
import client from './_client';
import { ANONYMOUS } from './_locale.en';
import { Member } from './_types';
import { Api } from 'telegram';

export const CHANNEL_ID_LENGTH = 14; // 14 symbols, including -100 prefix
const LEGACY_CHANNEL_ID_MIN_LENGTH = 11; // Example: -1234567890

function checkIfChannelId(id: string) {
  if (id.length >= CHANNEL_ID_LENGTH) return id.startsWith('-100');
  // LEGACY Unprefixed channel id
  if (id.length === LEGACY_CHANNEL_ID_MIN_LENGTH && id.startsWith('-4'))
    return false;
  return id.length >= LEGACY_CHANNEL_ID_MIN_LENGTH;
}

export function getEntityTypeById(chatOrUserId: string) {
  if (!chatOrUserId.startsWith('-')) {
    return 'user';
  } else if (checkIfChannelId(chatOrUserId)) {
    return 'channel';
  } else {
    return 'chat';
  }
}
export function buildMtpPeerId(id: string, type: 'user' | 'chat' | 'channel') {
  if (type === 'user') {
    return BigInt(id);
  }

  if (type === 'channel') {
    if (id.length === CHANNEL_ID_LENGTH) {
      return BigInt(id.slice(4));
    }

    // LEGACY Unprefixed channel id
    return BigInt(id.slice(1));
  }

  return BigInt(id.slice(1));
}

export function buildInputPeer(
  chatOrUserId: string,
  accessHash?: string,
): Api.TypeInputPeer {
  const type = getEntityTypeById(chatOrUserId);

  if (type === 'user') {
    return new Api.InputPeerUser({
      userId: buildMtpPeerId(chatOrUserId, 'user'),
      accessHash: BigInt(accessHash!),
    });
  } else if (type === 'channel') {
    return new Api.InputPeerChannel({
      channelId: buildMtpPeerId(chatOrUserId, 'channel'),
      accessHash: BigInt(accessHash!),
    });
  } else {
    return new Api.InputPeerChat({
      chatId: buildMtpPeerId(chatOrUserId, 'chat'),
    });
  }
}
export type ApiReaction = Api.ReactionEmoji | Api.ReactionCustomEmoji;

export function buildInputReaction(reaction?: ApiReaction) {
  if (reaction && 'emoticon' in reaction) {
    return new Api.ReactionEmoji({
      emoticon: reaction.emoticon,
    });
  }

  if (reaction && 'documentId' in reaction) {
    return new Api.ReactionCustomEmoji({
      documentId: BigInt(reaction.documentId),
    });
  }

  return new Api.ReactionEmpty();
}
export async function sendReaction({
  chat,
  messageId,
  reactions,
  shouldAddToRecent,
}: {
  chat: { id: string; accessHash?: string };
  messageId: number;
  reactions?: ApiReaction[];
  shouldAddToRecent?: boolean;
}) {
  if (!client.connected) await client.connect();

  try {
    await client.invoke(
      new Api.messages.SendReaction({
        reaction: reactions?.map((r) => buildInputReaction(r)),
        peer: buildInputPeer(chat.id, chat.accessHash),
        msgId: messageId,
        ...(shouldAddToRecent && { addToRecent: true }),
      }),
    );
  } catch (error) {
    console.error('Error sending reaction:', error);
    return { status: 500 };
  }

  return { status: 200 };
}

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
