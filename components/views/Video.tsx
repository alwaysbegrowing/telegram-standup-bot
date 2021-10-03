const TGVideo = ({ u }) => (
  <video
    controls={u.type !== 'animation'}
    autoPlay={u.type === 'animation'}
    loop
  >
    <source src={u.file_path} />
  </video>
);

export default TGVideo;
