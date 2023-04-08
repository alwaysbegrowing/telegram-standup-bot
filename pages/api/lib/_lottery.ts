import { connectToDatabase } from '../lib/_connectToDatabase';
import { Member, StandupGroup } from '../lib/_types';
import { sendMsg } from './_helpers';
import { WINNER_DM_MESSAGE } from './_locale.en';

export const getWinningGroupsForUser = async (userId: number) => {
  const { db } = await connectToDatabase();
  const user: Member = await db.collection('users').findOne({ userId });
  const winners =
    (Array.isArray(user?.groups) &&
      user.groups.filter((g) => !!g).filter((g: StandupGroup) => g.winner)) ||
    [];
  return winners;
};

export const setWinners = async () => {
  console.log('Setting new lottery winners');
  await unsetWinners();

  const { db } = await connectToDatabase();
  const users = await db.collection('users').find({}).toArray();

  let groups = [];
  const promises = [];

  users
    .filter((u) => !!u.groups.length)
    .forEach((user: Member) => {
      user.groups
        .filter((g) => !!g)
        .forEach((g) => {
          if (!groups.find((group) => group.chatId === g.chatId)) {
            groups.push({ chatId: g.chatId, users: [] });
          }
        });
    });

  groups.forEach((group) => {
    users
      .filter((u) => !!u.groups.length)
      .forEach((user: Member) => {
        user.groups
          .filter((g) => !!g)
          .forEach((ugroup) => {
            if (ugroup.chatId === group.chatId) {
              const users = group.users;
              if (!users.includes(user.userId)) {
                users.push(user.userId);
              }
            }
          });
      });
  });

  // { userId: [ groupId, groupId ], ... }
  const lotteryWinners = {};
  groups.forEach((group) => {
    const randomUser =
      group.users[Math.floor(Math.random() * group.users.length)];

    if (lotteryWinners[randomUser]) {
      lotteryWinners[randomUser].push(group.chatId);
    } else {
      lotteryWinners[randomUser] = [group.chatId];
    }
  });

  // These users should all get a reminder. When they post, it'll send to the groups they're winners in
  Object.keys(lotteryWinners).forEach((userId) => {
    const user: Member = users.find((u: Member) => u.userId === Number(userId));
    const winningGroups = lotteryWinners[userId];
    const groups = user.groups
      .filter((g) => !!g)
      .filter((g) => winningGroups.includes(g.chatId));
    const groupTitles = groups.map((group) => group.title);

    winningGroups.forEach((chatId) => {
      promises.push(
        db.collection('users').updateOne(
          {
            userId: Number(userId),
          },
          { $set: { 'groups.$[elem].winner': true } },
          {
            arrayFilters: [
              {
                'elem.chatId': chatId,
              },
            ],
          }
        )
      );
    });

    promises.push(sendMsg(WINNER_DM_MESSAGE(groupTitles), user.userId));
  });

  return await Promise.all(promises);
};

export const unsetWinners = async () => {
  console.log('Unsetting all lottery winners');

  const { db } = await connectToDatabase();
  await db.collection('users').updateMany(
    { 'groups.winner': true },
    { $set: { 'groups.$[elem].winner': false } },
    {
      arrayFilters: [
        {
          'elem.winner': true,
        },
      ],
      multi: true,
    }
  );
};
