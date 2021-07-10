const { createHash, createHmac } = require('crypto');
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';

const secret = createHash('sha256')
  .update(process.env.TELEGRAM_API_KEY)
  .digest();

function checkSignature({ hash, ...data }) {
  if (!hash) {
    return false;
  }

  const checkString = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
  const hmac = createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
}

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const isValid = checkSignature(req?.body || {});

  if (!isValid) {
    return res.status(401).json({ status: 'Unauthorized' });
  }

  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ userId: req.body.id });

  const groupUpdates = await db
    .collection('users')
    .find({ 'groups.chatId': { $in: user.groups.map((g) => g.chatId) } })
    .toArray();

  return res.status(200).json(
    groupUpdates.map((g) => {
      return {
        id: g._id, // Using _id to hide the userId
        name: g.about.first_name,
        updates: g.updateArchive.map((u) => {
          return {
            type: u.type,
            createdAt: u.createdAt,
            message: u?.body?.message?.text || u?.body?.message?.caption,
            file_path: u?.file_path,
          };
        }),
      };
    })
  );
};
