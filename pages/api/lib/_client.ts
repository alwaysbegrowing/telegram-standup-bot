import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const stringSession = process.env.TELEGRAM_SESSION;
const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const client = new TelegramClient(
  new StringSession(stringSession),
  apiId,
  apiHash,
  { connectionRetries: 5 }
);

export default client;
