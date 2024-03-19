import { connectToDatabase } from '../_connectToDatabase';
import { sendMsg } from '../_helpers';
import { SUBSCRIBERS_MESSAGE } from '../_locale.en';
import type { About, Member } from '../_types';

export const getMembers = async (
  chatId: number,
  userId: number,
  title: string,
  about: About,
  messageId: number,
) => {
  const getChatMemberCountEndpoint = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getChatMemberCount`;
  const { db } = await connectToDatabase();
  const users = await db.collection<Member>('users').find({}).toArray();
  const members: Member[] = [];

  users.forEach((u) =>
    u.groups
      .filter((g) => !!g)
      .forEach((g) => g.chatId === chatId && members.push(u)),
  );

  const res = await fetch(getChatMemberCountEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, emoji: '🎰' }),
  });
  const json = await res.json();
  const chatMemberCount = (json?.ok === true && json.result) || 0;
  return await sendMsg(
    SUBSCRIBERS_MESSAGE(members, chatMemberCount),
    chatId,
    messageId,
  );
};
