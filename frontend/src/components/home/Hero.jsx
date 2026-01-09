import { useEffect, useState } from "react";
import API from "../config/api";

function Hero() {
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetch(`${API}/api/home-content`)
        .then((res) => res.json())
        .then((data) => setContent(data))
        .catch((err) => console.error("Hero content error:", err));
    }, []);

if (!content) {
  return (
    <section className="h-[260px] md:h-[340px] flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </section>
  );
}

    return (
        <section className="
      relative
      bg-hero
      bg-cover
      bg-[center_35%]
      h-[260px]
      md:h-[340px]
      flex
      items-center
      justify-center
      px-6
      text-center
    ">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70"></div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4">
                    {content.mandirName}
                </h1>

                <p className="text-lg md:text-xl text-orange-100">
                    {content.heroSubtitle}
                </p>
            </div>
        </section>
    );
}

export default Hero;
