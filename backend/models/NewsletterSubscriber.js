import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    active: { type: Boolean, default: true },
    unsubscribeToken: { type: String, required: true, unique: true },
    source: { type: String, default: 'blog' },
  },
  { timestamps: true },
);

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
