import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dateLabel: { type: String, required: true },
    body: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('BlogPost', blogPostSchema);
