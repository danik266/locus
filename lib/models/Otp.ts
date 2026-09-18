import mongoose, { Schema, type Document, type Model } from 'mongoose';

// OTP codes for email-based authentication (magic code)
export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email:     { type: String, required: true, lowercase: true, trim: true, index: true },
    code:      { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used:      { type: Boolean, default: false },
    attempts:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
