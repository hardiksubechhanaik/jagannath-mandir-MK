import mongoose from 'mongoose';

const festivalSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    month: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, default: '' },
    odia: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
    date: { type: String, default: '' },
    weekday: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Festival', festivalSchema);
