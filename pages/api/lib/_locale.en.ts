import { getDisplayName } from './_helpers';
import { Member } from './_types';

export const ANONYMOUS = 'Anonymous';

export const START_MESSAGE = `To get started, add this bot to your chat and type /subscribe to subscribe them to your updates.

Afterwards, post a message here and it will automatically be sent to your chat at 11:00 am. You will receive a few reminders if you do not submit your standup before 8:00 am the day of.

You can send me videos / photos with captions, gifs, voice messages, and video messages! Perfect for letting your friends, family, coworkers know what you're up to today or accomplished yesterday!`;

export const INVALID_PRIVATE_MESSAGE =
  'Add me to a chat, then send this command in that chat instead.';

export const SUBSCRIBED_MESSAGE = `This chat is now subscribed to your daily updates. Send me a message @${process.env.NEXT_PUBLIC_BOT_NAME} to get started.`;

export const UNSUBSCRIBED_MESSAGE =
  'This chat is now unsubscribed from your daily updates.';

export const INVALID_UNSUBSCRIBE_MESSAGE =
  'This chat is not yet subscribed to your daily updates.';

export const ALREADY_SUBSCRIBED_MESSAGE =
  'This chat is already subscribed to your daily updates.';

export const INVALID_EDIT_MESSAGE =
  "You can only edit a message that hasn't been sent yet ☹️";

export const UPDATE_EDITED_MESSAGE = 'Message edited 😎';

export const SUBMISSION_NOTIFY_MESSAGE = `There's a new update coming 🧸`;

export const SUBMISSION_NOTIFY_EDIT_MESSAGE = 'The update was edited 👀';

export const NO_SUBSCRIBED_GROUPS_MESSAGE =
  "You haven't subscribed any chats to your daily updates yet. Add this bot to your chat, then type /subscribe to subscribe them.";

export const UPDATE_SUBMITTED_MESSAGE = 'Submitted';

export const GROUP_MEDIA_SUBMITTED_MESSAGE =
  'All that media has been submitted';

const getGroupsMessage = (groups: Array<string>) => `The following group${
  groups && groups.length > 1 ? 's' : ''
} will receive your update:
${groups.map((g) => `• ${g}`).join('\n')}`;

export const NOT_SUBMITTED_MESSAGE = (
  groups: Array<string>,
) => `**(1 hour reminder)** Tick tock. Ready to submit an update?

${getGroupsMessage(groups)}
`;

export const SUBMITTED_MESSAGE = (
  groups: Array<string>,
) => `**(1 hour reminder)** The update you previously submitted will be posted soon.

If you want to change your update, edit your last message.

${getGroupsMessage(groups)}`;

export const WINNER_GROUP_MESSAGE = (user: Member) =>
  `Winner winner. ${getDisplayName(
    user,
  )} has been chosen to send an update to this group.`;

export const WINNER_DM_MESSAGE = (groups: Array<string>) =>
  `It's your turn 🐼

${getGroupsMessage(groups)}`;

export const NO_WINNING_GROUPS_MESSAGE = `You haven't won in any groups yet. Check back tomorrow 🤞

Your update was not saved.`;

export const SUBSCRIBERS_MESSAGE = (
  users: Array<Member>,
  chatMemberCount: number,
) => {
  if (users.length === 0) {
    return `There are no subscribers yet.

Click /subscribe to be the first to join.`;
  }

  if (users.length === 1) {
    return `Currently ${getDisplayName(
      users[0],
    )} is the only member subscribed to this group, out of ${chatMemberCount} total members.

Click /subscribe to join them.`;
  }

  return `At update time, one of the following members will randomly be awarded the opportunity to submit the next update:

${users.map((u) => `• ${getDisplayName(u)}`).join('\n')}

To participate, click /subscribe and you might be chosen next.

${users.length}/${chatMemberCount} subscribed.`;
};
