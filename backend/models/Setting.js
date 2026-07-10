import mongoose from 'mongoose';

const prasadRateSchema = new mongoose.Schema(
  {
    weekday: { type: Number, required: true, min: 1, max: 100000 },
    weekend: { type: Number, required: true, min: 1, max: 100000 },
  },
  { _id: false },
);

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
    /** Mahaprasad booking rates (₹ per person/pack). */
    prasadPricing: {
      pickup: {
        type: prasadRateSchema,
        default: () => ({ weekday: 200, weekend: 120 }),
      },
      'ananda-bazar': {
        type: prasadRateSchema,
        default: () => ({ weekday: 150, weekend: 100 }),
      },
    },
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
