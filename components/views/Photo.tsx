import { Image } from '@geist-ui/react';

const TGPhoto = ({ u }) =>
  u.file_id ? (
    <Image
      src={`/api/getFile/?file_id=${u.file_id}`}
      alt="Submission"
      width="300px"
      height="200px"
    />
  ) : null;

export default TGPhoto;
