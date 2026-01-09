const Tile = ({title, description, highlight}) => {
    return (
        <div className="
        bg-white 
        border 
        border-orange-100
        rounded-xl 
        p-6 
        text-center 
        shadow-sm 
        transition-all 
        duration-300 
        hover:shadow-lg 
        hover:-translate-y-1
        hover:bg-orange-200
        hover:border-orange-300
      ">
            <h3 className="font-semibold text-lg">
                {title}
            </h3>

            {description && (
                <p className="text-gray-600 mt-2">
                    {description}
                </p>
            )}
            {highlight && (
                <p className="text-orange-600 mt-2 font-medium">
                    {highlight}
                </p>
            )}
        </div>
    )
}

export default Tile;