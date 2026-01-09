import mongoose from "mongoose";

const homeContentSchema = new mongoose.Schema(
    {
        mandirName : {
            type: String,
            required: true
        },
        heroSubtitle: {
            type: String,
            required: true
        },
        abouteTitle: {
            type: String,
            required: true
        },
        aboutDescription: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("HomeContent", homeContentSchema);