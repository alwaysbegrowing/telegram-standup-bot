import { connectToDatabase } from '../lib/_connectToDatabase';
import { Member, StandupGroup } from '../lib/_types';
import { sendMsg } from './_helpers';
import { WINNER_DM_MESSAGE } from './_locale.en';

// Get winning groups for a user
export const getWinningGroupsForUser = async (userId: number) => {
  const { db } = await connectToDatabase();
  const user: Member = await db.collection('users').findOne({ userId });
  const winners =
    (Array.isArray(user?.groups) &&
      user.groups.filter((g) => !!g).filter((g: StandupGroup) => g.winner)) ||
    [];
  return winners;
};

// Set new lottery winners
export const setWinners = async () => {
  console.log('Setting new lottery winners');
  await unsetWinners();

  const { db } = await connectToDatabase();
  const users = await db.collection('users').find({}).toArray();

  // Get all groups from the users
  const groups = getUsersGroups(users);

  // Get lottery winners
  const lotteryWinners = getLotteryWinners(groups, users);

  // Update database with winners and send messages
  const promises = updateWinnersAndSendMessages(lotteryWinners, users, db);

  return await Promise.all(promises);
};

// Get all groups from the users
function getUsersGroups(users) {
  let groups = [];

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

  return groups;
}

// Get lottery winners
function getLotteryWinners(groups, users) {
  const lotteryWinners = {};

  groups.forEach((group) => {
    const randomUser =
      process.env.NODE_ENV === 'development'
        ? JSON.parse(process.env.NEXT_PUBLIC_TELEGRAM_USER)?.id
        : group.users[Math.floor(Math.random() * group.users.length)];

    if (lotteryWinners[randomUser]) {
      lotteryWinners[randomUser].push(group.chatId);
    } else {
      lotteryWinners[randomUser] = [group.chatId];
    }
  });

  return lotteryWinners;
}

// Update database with winners and send messages
function updateWinnersAndSendMessages(lotteryWinners, users, db) {
  const promises = [];

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

  return promises;
}

// Unset all lottery winners
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
