import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  country: string;
  city: string;
  website: string;
  logoUrl?: string;
  rankQS?: number;
  rankTHE?: number;
  type: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name:    { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    city:    { type: String, required: true },
    website: { type: String, required: true },
    logoUrl: { type: String },
    rankQS:  { type: Number },
    rankTHE: { type: Number },
    type:    { type: String, enum: ['public', 'private'], required: true },
  },
  { timestamps: true }
);

export const University: Model<IUniversity> =
  mongoose.models.University || mongoose.model<IUniversity>('University', UniversitySchema);
