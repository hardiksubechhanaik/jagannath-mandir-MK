const EventTile = ({
  title,
  date,
  description,
  tag,
  image,
  imagePosition = "top",
}) => {
  return (
    <div
      className="
        bg-white
        border border-orange-100
        rounded-xl
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
        hover:-translate-y-1
        hover:bg-orange-200
        hover:border-orange-300
      "
    >
      {/* IMAGE */}
      {image && (
  <div className="h-48 w-full overflow-hidden rounded-lg mb-4">
    <img
      src={image}
      alt={title}
      className="h-full w-full object-cover"
      style={{ objectPosition: imagePosition }}
    />
  </div>
)}

      {/* TAG */}
      {tag && (
        <span
          className="
            inline-block
            mb-3
            text-xs
            font-semibold
            text-orange-700
            bg-orange-100
            px-3
            py-1
            rounded-full
          "
        >
          {tag}
        </span>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-orange-600 font-medium mb-3">{date}</p>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default EventTile;
