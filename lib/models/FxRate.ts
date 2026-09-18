import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IFxRate extends Document {
  date: string;
  source: string;
  kztPerEur: number;
  kztPerUsd: number;
  kztPerPln: number;
  kztPerKrw: number;
  kztPerGbp: number;
  kztPerCad: number;
  createdAt: Date;
}

const FxRateSchema = new Schema<IFxRate>(
  {
    date:      { type: String, required: true, unique: true },
    source:    { type: String, required: true },
    kztPerEur: { type: Number, required: true },
    kztPerUsd: { type: Number, required: true },
    kztPerPln: { type: Number, required: true },
    kztPerKrw: { type: Number, required: true },
    kztPerGbp: { type: Number, default: 0 },
    kztPerCad: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FxRate: Model<IFxRate> =
  mongoose.models.FxRate || mongoose.model<IFxRate>('FxRate', FxRateSchema);
