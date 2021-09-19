import { Image } from '@geist-ui/react';

const TGPhoto = ({ u }) => (
  <Image src={u.file_path} alt="Submission" width="300px" height="200px" />
);

export default TGPhoto;
