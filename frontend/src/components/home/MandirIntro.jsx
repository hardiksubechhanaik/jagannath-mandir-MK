import { useEffect, useState } from "react";

const MandirIntro = () => {
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/home-content`)
        .then((res) => res.json())
        .then((data) => setContent(data))
        .catch((err) => console.error("Intro content not available:", err));
    }, []);

    if (!content) {
    return (
        <section className="h-[260px] md:h-[340px] flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </section>
        );
    }

    return (
        <section className="py-16 px-6 bg-orange-200/40 p-10">
            <h2 className="text-3xl font-bold text-center mb-6">
                {content.aboutTitle}
            </h2>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
                {content.aboutDescription}
            </p>
        </section>
    )
}

export default MandirIntro;