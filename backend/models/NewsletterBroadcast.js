import mongoose from 'mongoose';

const newsletterBroadcastSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['blog', 'emergency', 'general'], default: 'general' },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['sending', 'sent', 'partial', 'failed'], default: 'sending' },
    sentBy: { type: String, default: 'admin' },
  },
  { timestamps: true },
);

export default mongoose.model('NewsletterBroadcast', newsletterBroadcastSchema);
