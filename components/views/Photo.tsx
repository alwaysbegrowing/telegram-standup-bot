import { Image } from '@geist-ui/react';

const TGPhoto = ({ u }) =>
  u.file_path ? (
    <Image src={u.file_path} alt="Submission" width="300px" height="200px" />
  ) : null;

export default TGPhoto;
