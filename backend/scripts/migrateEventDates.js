import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/Event.js";

dotenv.config();

const parseDateString = (dateStr) => {
  // Example input: "January 14, 2026"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    console.log("MONGODB_URI =", process.env.MONGODB_URI);
    
    const events = await Event.find();
    console.log(`Found ${events.length} events`);

    for (const event of events) {
      if (!event.date) {
        console.warn(`⚠️ No date field for: ${event.title}`);
        continue;
      }

      const parsedDate = parseDateString(event.date);

      if (!parsedDate) {
        console.warn(`⚠️ Could not parse date for: ${event.title}`);
        continue;
      }

      event.eventDate = parsedDate;      // ✅ real Date
      event.displayDate = event.date;    // ✅ UI string

      await event.save();

      console.log(`✅ Migrated: ${event.title}`);
    }

    console.log("🎉 Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
