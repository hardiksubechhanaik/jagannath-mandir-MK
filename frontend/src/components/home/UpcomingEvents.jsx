import { useEffect, useState } from "react";
import EventTile from "../common/EventTile";
import API from "@/config/api";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${API}/upcoming`)
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <section className="py-16 px-6 bg-orange-200/40 p-10">
      <h2 className="text-2xl font-bold text-center mb-10">
        Upcoming Events
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {events.map(event => (
          <EventTile
            key={event._id}
            title={event.title}
            date={new Date(event.eventDate).toDateString()}
            tag={event.tag}
            image={event.image}
            imagePosition={event.imagePosition}
            description={event.description}
          />
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
