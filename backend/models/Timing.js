import mongoose from "mongoose";

const timingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        season: {
            type: String,
            enum: ["winter", "summer"],
            default: "winter"
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Timing", timingSchema);