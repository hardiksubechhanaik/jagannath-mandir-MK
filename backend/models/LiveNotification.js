import mongoose from 'mongoose';

const liveNotificationSchema = new mongoose.Schema(
  {
    contact: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('LiveNotification', liveNotificationSchema);
