export const telegramTypes = {
  text: 'sendMessage',
  voice: 'sendVoice',
  audio: 'sendAudio',
  poll: 'sendPoll',
  video: 'sendVideo',
  photo: 'sendPhoto',
  video_note: 'sendVideoNote',
  animation: 'sendAnimation',
  group: 'sendMediaGroup',
};

export interface StandupGroup {
  chatId: number;
  title: string;
}

export interface UpdateArchive {
  createdAt: string;
  type: string;
  file_path: string;
  file_id: string;
  body: any;
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
