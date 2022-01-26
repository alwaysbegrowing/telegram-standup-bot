import TGVideo from './Video';
import TGPhoto from './Photo';
import { Link, Button } from '@geist-ui/react';

const TGFile = ({ u }) => {
  if (!u.file_id) return null;

  if (['voice', 'video', 'animation', 'audio', 'video_note'].includes(u.type)) {
    return <TGVideo u={u} />;
  } else if (u.type === 'photo') {
    return <TGPhoto u={u} />;
  }

  return (
    <Link href={`/api/getFile/?file_id=${u.file_id}`}>
      <Button>View file</Button>
    </Link>
  );
};

export default TGFile;
