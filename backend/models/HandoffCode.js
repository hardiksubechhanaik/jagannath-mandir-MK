import mongoose from 'mongoose';

const handoffCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

handoffCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('HandoffCode', handoffCodeSchema);
