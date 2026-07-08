import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instagramHandle: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    /** official = Official Creator Partner; digital = Digital Partner */
    tier: { type: String, enum: ['official', 'digital'], default: 'digital' },
  },
  { timestamps: true },
);

export default mongoose.model('Creator', creatorSchema);
