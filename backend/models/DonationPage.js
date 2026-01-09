import mongoose from "mongoose";

const donationAmountSchema = new mongoose.Schema({
  amount: Number,
  label: String
});

const donationPageSchema = new mongoose.Schema({
  note: String,
  amounts: [donationAmountSchema]
});

export default mongoose.model("DonationPage", donationPageSchema);
