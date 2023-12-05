import { checkSignature } from '@/pages/api/lib/_helpers';
import prisma from './lib/_connectToDatabase';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const isValid = checkSignature(req?.body || {});

  if (!isValid && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ status: 'Unauthorized' });
  }

  const user = await prisma.users.findFirst({
    select: {
      groups: true,
    },
    where: {
      userId: req.body.id,
    },
  });

  if (!user) {
    return res.status(404).json({ statusText: 'User not found' });
  }

  const groupTitles = user.groups.filter((g) => !!g).map((g) => g.title);

  return res.status(200).json(groupTitles);
}
