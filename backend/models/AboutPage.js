import mongoose from "mongoose";

const aboutPageSchema = new mongoose.Schema(
    {
        pageTitle: String,
        location: String,

        aboutHeading:  String,
        aboutParagraph1:  String,
        aboutParagraph2:  String,

        purposeHeading:  String,
        purposes: [String],

        messageHeading:  String,
        messageText:  String
    },
    { timestamp: true }
);

export default mongoose.model("AboutPage", aboutPageSchema);