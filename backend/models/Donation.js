import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    amount: Number,
    mode: String,
    transactionId: String,
    comments: String
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
