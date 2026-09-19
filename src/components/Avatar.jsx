
function Avatar({ src, name, size = "h-10 w-10", rounded = "rounded-full", textSize = "text-2xl" }) {

  return (
    <>
        <img
          src={src}
          alt={name}
          className={`${rounded} ${size} object-cover`}
          loading="lazy"
          decoding="async"
        />
    
    </>
  );

}

export default Avatar;