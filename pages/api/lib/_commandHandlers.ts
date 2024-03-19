import { sendMsg } from './_helpers';
import { startBot } from './_init';
import { INVALID_PRIVATE_MESSAGE, START_MESSAGE } from './_locale.en';
import { addToStandupGroup } from './command-helpers/_addToStandupGroup';
import { getMembers } from './command-helpers/_getMembers';
import { leaveStandupGroup } from './command-helpers/_leaveStandupGroup';
import { submitStandup } from './command-helpers/_submitStandup';

// Command handling functions
export const handleStartCommand = async (userId, chatId, messageId, res) => {
  await startBot(userId);
  const response = await sendMsg(START_MESSAGE, chatId, messageId);
  return res.json({ status: response.status });
};

export const handleInvalidPrivateCommand = async (chatId, messageId, res) => {
  const response = await sendMsg(INVALID_PRIVATE_MESSAGE, chatId, messageId);
  return res.json({ status: response.status });
};

export const handleSubmitStandup = async (
  chatId,
  userId,
  messageId,
  body,
  res,
) => {
  const response = await submitStandup(chatId, userId, messageId, body);
  const status = response?.status || 200;
  return res.json({ status });
};

export const handleSubscribeCommand = async (
  chatId,
  userId,
  chatTitle,
  from,
  messageId,
  res,
) => {
  const response = await addToStandupGroup(
    chatId,
    userId,
    chatTitle,
    from,
    messageId,
  );
  return res.json({ status: response.status });
};

export const handleMembersCommand = async (
  chatId,
  userId,
  chatTitle,
  from,
  messageId,
  res,
) => {
  const response = await getMembers(chatId, userId, chatTitle, from, messageId);
  return res.json({ status: response.status });
};

export const handleUnsubscribeCommand = async (
  chatId,
  userId,
  messageId,
  res,
) => {
  const response = await leaveStandupGroup(chatId, userId, messageId);
  return res.json({ status: response.status });
};
