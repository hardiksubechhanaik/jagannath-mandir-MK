import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    morning: { type: String, default: '' },
    evening: { type: String, default: '' },
    /** When true, the online donation form is shown on the public Donate page. */
    paymentsEnabled: { type: Boolean, default: false },
    /** Home page welcome overlay — shown once per browser session when enabled. */
    welcomePopupEnabled: { type: Boolean, default: true },
    welcomePopupEyebrow: { type: String, default: 'Bhakti · Sanskriti · Seva' },
    welcomePopupHeading: { type: String, default: 'Are you a content creator?' },
    welcomePopupSubline: {
      type: String,
      default: 'We invite you to be our official Content Creator Partner.',
    },
    welcomePopupImages: {
      type: [
        {
          url: { type: String, default: '' },
          alt: { type: String, default: '' },
          linkUrl: { type: String, default: '' },
          caption: { type: String, default: '' },
        },
      ],
      default: () => [
        {
          url: '/images/content-creator-partner.png',
          alt: 'Content Creator Partner program at Shree Jagannath Mandir',
          linkUrl: '',
          caption: '',
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model('Setting', settingSchema);
