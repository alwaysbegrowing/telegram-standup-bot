import TGVideo from './Video';
import TGPhoto from './Photo';
import { Link, Button } from '@geist-ui/react';

const TGFile = ({ u }) => {
  if (!u.file_id) return null;

  if (['voice', 'video', 'animation', 'audio', 'video_note'].includes(u.type)) {
    return <TGVideo u={u} />;
  }
  if (u.type === 'photo') {
    return <TGPhoto u={u} />;
  }

  return (
    <Link
      href={`/api/getFile/?file_id=${u.file_id}`}
      placeholder={undefined}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    >
      <Button
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        View file
      </Button>
    </Link>
  );
};

export default TGFile;
