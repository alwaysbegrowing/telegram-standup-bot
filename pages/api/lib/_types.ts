export enum Commands {
  subscribe = 0,
  unsubscribe = 1,
  start = 2,
}

export const telegramTypes = {
  text: 'sendMessage',
  voice: 'sendVoice',
  audio: 'sendAudio',
  poll: 'sendPoll',
  video: 'sendVideo',
  photo: 'sendPhoto',
  document: 'sendDocument',
  video_note: 'sendVideoNote',
  animation: 'sendAnimation',
  group: 'sendMediaGroup',
};

export interface StandupGroup {
  chatId: number;
  title: string;
  winner: boolean;
}

export interface UpdateArchive {
  createdAt: string;
  type: string;
  file_path?: string;
  file_id?: string;
  body: any;
  entities: any;
  caption?: string;
  sent: boolean;
}

export interface About {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string;
  hash: string;
  username: string;
}

export interface Member {
  userId: number;
  submitted: boolean;
  botCanMessage: boolean;
  updateArchive: Array<UpdateArchive>;
  about: About;
  latestUpdate?: UpdateArchive;
  groups: Array<StandupGroup>;
}
