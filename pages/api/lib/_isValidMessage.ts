import { telegramTypes } from './_types';

export const isValidMessage = (message) => {
  return message && Object.keys(message).some((a) => telegramTypes[a]);
};
