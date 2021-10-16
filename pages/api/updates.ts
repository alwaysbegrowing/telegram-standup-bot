import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/_connectToDatabase';
import { checkSignature } from '@/pages/api/lib/_helpers';
import { fillMarkdownEntitiesMarkup } from 'telegram-text-entities-filler';

const transformUpdate = (g, response) => {
  const latestMessages = g?.updateArchive?.reverse();
  if (!latestMessages) return;

  return latestMessages.map((u, i) => {
    let data = {
      id: g.userId,
      name: g.about.first_name,
      username: g.about.username,
      photo: g.about.photo_url,
      type: u.type,
      createdAt: u.createdAt,
      groupId: u?.body?.message?.media_group_id,
      message: u?.body?.message?.text || u?.body?.message?.caption,
      file_id: u?.file_id,
      locked: g.submitted && !i,
      entities: false,
    };

    if (
      latestMessages?.[0]?.body?.message?.media_group_id === data.groupId &&
      g.submitted
    ) {
      data = {
        ...data,
        locked: true,
        message: false,
        file_id: false,
      };
    }

    const entities =
      u?.body?.message?.entities || u?.body?.message?.caption_entities;

    // Don't convert entities if it isn't submitted
    if (!g.submitted && Array.isArray(entities)) {
      data.message = fillMarkdownEntitiesMarkup(data.message, entities);
      data.entities = true;
    }

    if (i) {
      // See if any other photos from this group have a caption
      // Really bad, this should be set some how else
      if (!response.find((u) => u?.id === g?.userId)?.message) {
        response = response.map((b) => {
          if (
            b?.id === g?.userId &&
            !b.message &&
            data.message &&
            data.groupId === b.groupId
          ) {
            if (data.entities) {
              return {
                ...b,
                message: data.message,
                entities: true,
              };
            }

            return {
              ...b,
              message: data.message,
            };
          }
          return b;
        });
      }

      response.find((u) => u?.id === g?.userId)?.archive.push(data);
      return;
    }

    response.push({
      archive: [],
      ...data,
      message: !g.submitted && data.message,
      file_id: !g.submitted && data.file_id,
    });
  });
};

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const isValid = checkSignature(req?.body || {});

  if (!isValid && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ statusText: 'Unauthorized' });
  }

  const { db } = await connectToDatabase();
  const { value: user } = await db.collection('users').findOneAndUpdate(
    { userId: req.body.id },
    {
      $set: {
        about: req?.body,
      },
    }
  );

  if (!user) {
    return res.status(404).json({ statusText: 'User not found' });
  }

  // Get updates for one user
  if (req.query.user) {
    const page = req.query.page || 1;
    const username = req.query.user;
    const updates = await db
      .collection('users')
      .find({
        'about.username': username,
        // To make sure they're allowed to query this user ID
        'groups.chatId': { $in: user?.groups?.map((g) => g.chatId) || [] },
      })
      .project({ updateArchive: { $slice: -10 } })
      .toArray();

    if (updates && Array.isArray(updates)) {
      let response = [];
      updates.forEach((r) => transformUpdate(r, response));

      return res.status(200).json(response);
    }

    return res.status(404).json({ statusText: 'User not found' });
  }

  const groupUpdates = await db
    .collection('users')
    .find({
      'groups.chatId': { $in: user?.groups?.map((g) => g.chatId) || [] },
    })
    .project({ updateArchive: { $slice: -10 } })
    .toArray();

  let response = [];
  const json = groupUpdates.map((r) => transformUpdate(r, response));

  return res.status(200).json(response);
};
