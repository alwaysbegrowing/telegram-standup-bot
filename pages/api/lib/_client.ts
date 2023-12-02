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

function getNewStringSession() {
  const stringSession = ''; // leave this empty for now
  const BOT_TOKEN = process.env.TELEGRAM_API_KEY; // put your bot token here
  (async () => {
    const client = new TelegramClient(
      new StringSession(stringSession),
      apiId,
      apiHash,
      { connectionRetries: 5 }
    );
    await client.start({
      botAuthToken: BOT_TOKEN,
    });
    console.log(client.session.save());
  })();
}

// getNewStringSession();
export default client;
