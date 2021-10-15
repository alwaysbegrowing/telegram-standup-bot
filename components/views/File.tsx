import TGVideo from './Video';
import TGPhoto from './Photo';
import useSWR from 'swr';
import { fetchWithToken } from './../../lib/helpers';

const TGFile = ({ u }) => {
  if (!u.file_id) return null;

  if (['voice', 'video', 'animation', 'audio', 'video_note'].includes(u.type)) {
    return <TGVideo u={u} />;
  } else if (u.type === 'photo') {
    return <TGPhoto u={u} />;
  }
};

export default TGFile;
