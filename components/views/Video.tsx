const TGVideo = ({ u }) =>
  u.file_path ? (
    <video
      controls={u.type !== 'animation'}
      autoPlay={u.type === 'animation'}
      loop
    >
      <source src={u.file_path} />
    </video>
  ) : null;

export default TGVideo;
