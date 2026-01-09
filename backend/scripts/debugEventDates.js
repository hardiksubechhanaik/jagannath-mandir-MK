import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/Event.js";

dotenv.config();

async function debugDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const events = await Event.find();

    console.log(`\nFound ${events.length} events\n`);

    events.forEach((event, index) => {
      console.log("--------------------------------------------------");
      console.log(`#${index + 1}`);
      console.log("Title:", event.title);
      console.log("RAW date value 👉", JSON.stringify(event.date));
    });

    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

debugDates();
