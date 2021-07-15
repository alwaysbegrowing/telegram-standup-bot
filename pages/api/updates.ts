import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_connectToDatabase';
import { checkSignature } from '@/pages/api/_helpers';

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const isValid = checkSignature(req?.body || {});

  if (!isValid && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ statusText: 'Unauthorized' });
  }

  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ userId: req.body.id });

  if (!user) {
    return res.status(404).json({ statusText: 'User not found' });
  }

  if (req.query.page && req.query.user) {
    const page = req.query.page || 1;
    const userId = Number(req.query.user);
    const cursor = await db
      .collection('users')
      .findOne({
        // The user ID to find
        userId,
        // To make sure they're allowed to query this user ID
        'groups.chatId': { $in: user?.groups?.map((g) => g.chatId) },
      })
      .project({ updateArchive: { $slice: -5 } });

    return res.status(200).json(cursor?.updateArchive);
  }

  const groupUpdates = await db
    .collection('users')
    .find(
      { 'groups.chatId': { $in: user?.groups?.map((g) => g.chatId) } },
      { $sort: { updateArchive: 1 } }
    )
    .project({ updateArchive: { $slice: -1 } })
    .toArray();

  const response = [];

  groupUpdates.forEach((g) =>
    g.updateArchive.forEach((u, i) => {
      const data = {
        id: g.userId,
        name: g.about.first_name,
        type: u.type,
        createdAt: u.createdAt,
        message: u?.body?.message?.text || u?.body?.message?.caption,
        file_path: u?.file_path,
      };

      if (i) {
        response.find((u) => u?.id === g?.userId).archive.push(data);
        return;
      }

      response.push({
        archive: [],
        ...data,
      });
    })
  );

  return res.status(200).json(response);
};
