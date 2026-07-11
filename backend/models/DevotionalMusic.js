import mongoose from 'mongoose';

const CATEGORIES = ['Bhajan', 'Aarti', 'Kirtan', 'Stotra', 'Other'];

const devotionalMusicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, default: '', trim: true },
    category: { type: String, enum: CATEGORIES, default: 'Bhajan' },
    youtubeUrl: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

devotionalMusicSchema.index({ published: 1, featured: -1, order: 1, createdAt: -1 });

export { CATEGORIES };
export default mongoose.model('DevotionalMusic', devotionalMusicSchema);
