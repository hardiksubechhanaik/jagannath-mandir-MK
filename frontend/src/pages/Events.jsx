import { useEffect, useState } from "react";
import EventTile from "../components/common/EventTile";
import API from "@/config/api";
import Caution from "../components/caution/caution";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Events fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading events...</div>;
  }

  return (
    <div className="w-full">
      <Caution />
      {/* HEADER */}
      <section className="bg-orange-200 py-12 text-center px-6">
        <h1 className="text-4xl font-bold text-orange-600">
          Mandir Events & Festivals 🎉
        </h1>
        <p className="text-gray-700 mt-2">
          Celebrating devotion throughout the year
        </p>
      </section>

      {/* EVENTS GRID */}
      <section className="relative w-full py-16">
        <div className="absolute inset-0 bg-doodle bg-repeat bg-center opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <EventTile
                key={event._id}
                title={event.title}
                date={event.date}
                tag={event.tag}
                description={event.description}
                image={event.image}
                imagePosition={event.imagePosition}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
