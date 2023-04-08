export const getCommandType = (chat, entities, text) => {
  const inGroup = chat?.type === 'group' || chat?.type === 'supergroup';
  const isBotCommand = entities?.[0]?.type === 'bot_command';

  if (isBotCommand) {
    if (inGroup) {
      if (text?.includes('/members')) return 'members';
      if (text?.includes('/subscribe') || text?.includes('/join'))
        return 'subscribe';
      if (text?.includes('/unsubscribe')) return 'unsubscribe';
    } else {
      if (text?.includes('/start')) return 'start';
      return 'invalidPrivate';
    }
  }

  if (chat?.type === 'private') return 'submitStandup';

  return 'invalid';
};
