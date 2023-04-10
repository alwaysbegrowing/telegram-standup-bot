import { telegramTypes } from './_types';

export const isValidMessage = (message) => {
  return message && Object.values(telegramTypes).includes(message);
};
