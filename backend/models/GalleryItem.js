import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('GalleryItem', galleryItemSchema);
