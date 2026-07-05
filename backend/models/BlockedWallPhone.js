import mongoose from 'mongoose';

const blockedWallPhoneSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('BlockedWallPhone', blockedWallPhoneSchema);
