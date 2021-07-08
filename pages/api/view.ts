const { createHash, createHmac } = require('crypto');
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';

const secret = createHash('sha256')
  .update(process.env.TELEGRAM_API_KEY)
  .digest();

function checkSignature({ hash, ...data }) {
  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
}

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req?.body?.hash) {
    const isValid = checkSignature(req.body);
    if (isValid) {
      const { db } = await connectToDatabase();
      const user = await db
        .collection('users')
        .findOne({ userId: req.body.id });

      const groupUpdates = await db
        .collection('users')
        .find(
          {},
          {
            arrayFilters: [
              { 'groups.chatId': user.groups.map((g) => g.chatId) },
            ],
          }
        )
        .toArray();

      return res.status(200).json({
        groups: user.groups.map((g) => g.title),
        updates: user.updateArchive.map(({ message, createdAt }) => ({
          message,
          createdAt,
        })),
        groupUpdates,
      });
    }
  }

  return res.status(401).json({ status: 'Unauthorized' });
};
