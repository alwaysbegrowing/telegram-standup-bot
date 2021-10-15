const TGVideo = ({ u }) =>
  u.file_id ? (
    <video
      controls={u.type !== 'animation'}
      autoPlay={u.type === 'animation'}
      loop
    >
      <source src={`/api/getFile/?file_id=${u.file_id}`} />
    </video>
  ) : null;

export default TGVideo;
