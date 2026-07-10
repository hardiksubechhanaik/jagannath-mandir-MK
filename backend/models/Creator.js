import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instagramHandle: { type: String, default: '', trim: true },
    photoUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    /** Free-text label, e.g. Official Creator Partner, Corporate Sponsor */
    partnerType: { type: String, default: 'Partner', trim: true },
    /** Shown in the home-page partner popup */
    details: { type: String, default: '', trim: true },
    /** Gold highlight on marquee and featured placement */
    highlighted: { type: Boolean, default: false },
    /** @deprecated use partnerType + highlighted — kept for existing records */
    tier: { type: String, enum: ['official', 'digital'], required: false },
  },
  { timestamps: true },
);

export default mongoose.model('Creator', creatorSchema);
