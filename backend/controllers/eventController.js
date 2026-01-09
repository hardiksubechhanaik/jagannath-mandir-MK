import Event from "../models/Event.js";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event
      .find({ isActive: true })
      .sort({ order:1, eventDate: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();

    const events = await Event.find({
      eventDate: { $gte: today },
      isActive: true
    })
      .sort({ eventDate: 1 })
      .limit(3);

    res.json(events);
  } catch (err) {
    console.error("Upcoming events error:", err);
    res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
};
