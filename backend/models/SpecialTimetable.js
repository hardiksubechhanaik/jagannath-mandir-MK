import mongoose from 'mongoose';

const specialTimingRowSchema = new mongoose.Schema(
  {
    time: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameOdia: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const specialTimetableSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleOdia: { type: String, default: '', trim: true },
    /** Inclusive start date in IST (YYYY-MM-DD) */
    startDate: { type: String, required: true, trim: true },
    /** Inclusive end date in IST (YYYY-MM-DD) */
    endDate: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    rows: { type: [specialTimingRowSchema], default: [] },
  },
  { timestamps: true },
);

specialTimetableSchema.index({ startDate: 1, endDate: 1, active: 1 });

export default mongoose.model('SpecialTimetable', specialTimetableSchema);
