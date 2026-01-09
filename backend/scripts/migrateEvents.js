import mongoose from "mongoose";
import Event from "../models/Event.js";
import dotenv from "dotenv";

dotenv.config();

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

const parseEventDate = (dateStr) => {
  if (!dateStr) return null;

  // Example formats:
  // "January 14, 2026"
  // "June 12 : June 25, 2026"
  // "October 19 : October 24, 2026"

  let clean = dateStr;

  // Handle ranges → take start date
  if (dateStr.includes(":")) {
    const [start, end] = dateStr.split(":");
    const yearMatch = end.match(/\d{4}/);
    if (!yearMatch) return null;
    clean = `${start.trim()}, ${yearMatch[0]}`;
  }

  const match = clean.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (month === undefined) return null;

  return new Date(year, month, day);
};

const migrateEvents = async () => {
  const events = await Event.find();

  console.log(`Found ${events.length} events to migrate`);

  for (const event of events) {
    const parsedDate = parseEventDate(event.date);

    if (!parsedDate) {
      console.warn(`⚠️ Could not parse date for: ${event.title}`);
      continue;
    }

    event.eventDate = parsedDate;
    event.date = undefined;

    await event.save();
    console.log(`✅ Migrated: ${event.title}`);
  }

  console.log("🎉 Migration complete");
  process.exit();
};

await connectDB();
await migrateEvents();
