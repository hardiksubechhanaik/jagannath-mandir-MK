import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,

    // Human-readable date (for display)
    date: String,

    // 🔥 REAL date for sorting & filtering
    eventDate: {
      type: Date,
      required: true,
      index: true
    },

    tag: String,
    description: String,
    image: String,

    imagePosition: {
      type: String,
      default: "center"
    },

    order: Number,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
