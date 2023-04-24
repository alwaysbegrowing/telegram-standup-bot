import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from './lib/_connectToDatabase';
import { sendMsg } from './lib/_helpers';
import { NOT_SUBMITTED_MESSAGE, SUBMITTED_MESSAGE } from './lib/_locale.en';
import { StandupGroup } from './lib/_types';
import { validateApiKey } from './lib/_validateApiKey';

async function sendReminders(req: VercelRequest, res: VercelResponse) {
  if (validateApiKey(req)) {
    return res.status(401).json({ status: 'invalid api key' });
  }

  try {
    const users = await prisma.users.findMany({
      select: {
        groups: true,
        submitted: true,
        userId: true,
      },
      where: {
        groups: {
          some: {
            winner: true,
          },
        },
      },
    });

    // Filter users with groups and map them to reminders
    const reminders = users
      .filter((user) => user.groups?.length)
      .flatMap((user) => {
        const winners = user.groups
          .filter((group: StandupGroup) => group?.winner)
          .map((group) => group.title);

        if (winners.length) {
          const message = user.submitted
            ? SUBMITTED_MESSAGE(winners)
            : NOT_SUBMITTED_MESSAGE(winners);

          return sendMsg(message, user.userId);
        }

        return [];
      });

    const done: { status: number }[] = await Promise.all(reminders);
    return res.status(200).json({
      status: 'ok',
      sendCount: done.filter((r) => r.status === 200).length,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal Server Error' });
  }
}

export default sendReminders;
