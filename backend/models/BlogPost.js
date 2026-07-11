import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    authorName: { type: String, default: '' },
    instaId: { type: String, default: '' },
    dateLabel: { type: String, required: true },
    body: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'Temple Life' },
  },
  { timestamps: true },
);

export default mongoose.model('BlogPost', blogPostSchema);
