export const START_MESSAGE = `To get started, add this bot to your chat and type /subscribe to subscribe them to your updates.

Afterwards, post a message here and it will automatically be sent to your chat at 11:00 am. You will receive a few reminders if you do not submit your standup before 8:00 am the day of.

You can send me videos / photos with captions, gifs, voice messages, and video messages! Perfect for letting your friends, family, coworkers know what you're up to today or accomplished yesterday!`;

export const INVALID_PRIVATE_MESSAGE =
  'Add me to a chat, then send this command in that chat instead.';

export const SUBSCRIBED_MESSAGE = `This chat is now subscribed to your daily updates. Send me a message  @${process.env.NEXT_PUBLIC_BOT_NAME} to get started.`;

export const UNSUBSCRIBED_MESSAGE =
  'This chat is now unsubscribed from your daily updates.';

export const INVALID_UNSUBSCRIBE_MESSAGE =
  'This chat is not yet subscribed to your daily updates.';

export const ALREADY_SUBSCRIBED_MESSAGE =
  'This chat is already subscribed to your daily updates.';

export const INVALID_EDIT_MESSAGE =
  "You can only edit a message that hasn't been sent yet!";

export const UPDATE_EDITED_MESSAGE = 'Your update has been edited.';

export const NO_SUBSCRIBED_GROUPS_MESSAGE =
  "You haven't subscribed any chats to your daily updates yet! Add this bot to your chat, then type /subscribe to subscribe them.";

export const UPDATE_SUBMITTED_MESSAGE = 'Your update has been submitted.';

export const GROUP_MEDIA_SUBMITTED_MESSAGE =
  'Your group media has been submitted.';

export const NOT_SUBMITTED_MESSAGE = `(1 hour reminder) Tick tock. Ready to submit an update?

Send me a message, or spice it up with some photos! Afterall, pictures tell a thousand words. Can you guess how many a video could tell? `;

export const SUBMITTED_MESSAGE = `(1 hour reminder) The update you previously submitted will be posted soon!

If you want to change your update, edit your last message.`;
