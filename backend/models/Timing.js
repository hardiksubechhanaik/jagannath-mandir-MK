import mongoose from 'mongoose';

const timingSchema = new mongoose.Schema(
  {
    season: { type: String, enum: ['summer', 'winter'], required: true },
    name: { type: String, required: true },
    nameOdia: { type: String, required: true },
    time: { type: String, required: true },
    note: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Timing', timingSchema);
