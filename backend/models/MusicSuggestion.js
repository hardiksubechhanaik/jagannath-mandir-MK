import mongoose from 'mongoose';

const musicSuggestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    videoId: { type: String, required: true, trim: true },
    suggesterName: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['pending', 'added', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

musicSuggestionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('MusicSuggestion', musicSuggestionSchema);
