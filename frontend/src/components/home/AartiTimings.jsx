import Tile from "../common/Tiles"
import { useEffect, useState } from "react";
import API from "../../../config/api";

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1 = Jan, 12 = Dec

  // April (4) to October (10) = summer
  return month >= 4 && month <= 10 ? "summer" : "winter";
};


const AartiTimings = () => {
    const [season, setSeason] = useState(getCurrentSeason());
    const [timings, setTimings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        fetch(`${API}/timings?season=${season}`)
            .then((res) => res.json())
            .then((data) => {
                setTimings(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching timings:", error);
                setLoading(false);
            });
    }, [season]);

    const seasonTitle =
    season === "winter"
      ? "Winter Timings (November – March)"
      : "Summer Timings (April – October)";

    if (loading) {
        return (
            <section className="py-16 text-center">
                <p>Loading timings...</p>
            </section>
        );
    }
    return (
        <section className="py-16 px-6">
            <h2 className="text-3xl font-bold text-center mb-10">
                {seasonTitle}
            </h2>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {timings.map((item) => (
                    <Tile
                        key={item._id}
                        title={item.title}
                        highlight={item.time}
                    />
                ))}
            </div>
        </section>
    );
};

export default AartiTimings;