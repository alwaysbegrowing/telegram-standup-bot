import { checkSignature } from '@/pages/api/lib/_helpers';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fillMarkdownEntitiesMarkup } from 'telegram-text-entities-filler';

const transformUpdate = (group, response) => {
  const latestMessages = group?.updateArchive?.reverse();
  if (!latestMessages) return;

  return latestMessages.map((message, index) => {
    let data = {
      id: group.userId,
      name: group.about.first_name,
      username: group.about.username,
      photo: group.about.photo_url,
      type: message.type,
      createdAt: message.createdAt,
      groupId: message?.body?.message?.media_group_id,
      message: message?.body?.message?.text || message?.body?.message?.caption,
      file_id: message?.file_id,
      locked: group.submitted && !index,
      entities: false,
    };

    if (
      latestMessages?.[0]?.body?.message?.media_group_id === data.groupId &&
      group.submitted
    ) {
      data = {
        ...data,
        locked: true,
        message: false,
        file_id: false,
      };
    }

    const entities =
      message?.body?.message?.entities ||
      message?.body?.message?.caption_entities;

    // Don't convert entities if it isn't submitted
    if (!group.submitted && Array.isArray(entities)) {
      data.message = fillMarkdownEntitiesMarkup(data.message, entities);
      data.entities = true;
    }

    if (index) {
      // See if any other photos from this group have a caption
      // Really bad, this should be set some how else
      if (!response.find((u) => u?.id === group?.userId)?.message) {
        response = response.map((b) => {
          if (
            b?.id === group?.userId &&
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

      response.find((u) => u?.id === group?.userId)?.archive.push(data);
      return;
    }

    response.push({
      archive: [],
      ...data,
      message: !group.submitted && data.message,
      file_id: !group.submitted && data.file_id,
    });
  });
};

const getUpdatesForOneUser = async (req, res, user) => {
  const page = req.query.page || 1;
  const userId = req.query.userId;
  const { db } = await connectToDatabase();
  const updates = await db
    .collection('users')
    .find({
      userId: Number(userId),
      // To make sure they're allowed to query this user ID
      'groups.chatId': {
        $in: user?.groups?.map((g) => g?.chatId).filter((g) => !!g) || [],
      },
    })
    .project({ updateArchive: { $slice: -10 } })
    .toArray();

  if (updates && Array.isArray(updates)) {
    let response = [];
    updates.forEach((r) => transformUpdate(r, response));

    return res.status(200).json(response);
  }

  return res.status(404).json({ statusText: 'User not found' });
};

const getAllGroupUpdates = async (req, res, user) => {
  const { db } = await connectToDatabase();
  const groupUpdates = await db
    .collection('users')
    .find({
      'groups.chatId': {
        $in: user?.groups?.map((g) => g?.chatId).filter((g) => !!g) || [],
      },
    })
    .project({ updateArchive: { $slice: -10 } })
    .toArray();

  let response = [];
  groupUpdates.map((r) => transformUpdate(r, response));

  return res.status(200).json(response);
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

  if (req.query.userId) {
    await getUpdatesForOneUser(req, res, user);
  } else {
    await getAllGroupUpdates(req, res, user);
  }
};
