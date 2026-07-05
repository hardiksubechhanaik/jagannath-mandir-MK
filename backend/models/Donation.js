import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    freq: { type: String, default: 'One-time' },
    purpose: { type: String, default: 'General' },
    amount: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    email: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Donation', donationSchema);
