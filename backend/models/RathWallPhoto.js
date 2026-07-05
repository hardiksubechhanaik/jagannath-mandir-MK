import mongoose from 'mongoose';

const rathWallPhotoSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    caption: { type: String, required: true, trim: true, maxlength: 200 },
    imageUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    leftPct: { type: Number, default: 10 },
    topPct: { type: Number, default: 10 },
    rot: { type: Number, default: 0 },
    z: { type: Number, default: 1 },
    style: { type: String, enum: ['pin', 'tape'], default: 'pin' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model('RathWallPhoto', rathWallPhotoSchema);
