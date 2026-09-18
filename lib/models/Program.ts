import mongoose, { Schema, Types, type Document, type Model } from 'mongoose';

export type Currency = 'EUR' | 'USD' | 'PLN' | 'KRW' | 'KZT' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SGD';
export type Degree = 'bachelor' | 'master' | 'phd' | 'foundation';
export type ProgramField =
  | 'Технологии' | 'Дизайн' | 'Бизнес' | 'Инженерия'
  | 'Медицина и здоровье' | 'Право' | 'Архитектура'
  | 'Психология' | 'Естественные науки' | 'Гуманитарные науки'
  | 'Социальные науки' | 'Искусство и медиа' | 'Образование'
  | 'Экология' | 'Международные отношения';

export interface IProgram extends Document {
  universityId: Types.ObjectId;
  // Legacy string id for backward compat with existing catalog
  legacyId?: string;
  title: string;
  degree: Degree;
  field: ProgramField;
  subfield?: string;
  language: string; // 'English', 'German', 'Russian', etc.
  durationYears: number;
  tuition: {
    amount: number;
    currency: Currency;
    period: 'year' | 'semester' | 'month' | 'credit';
    year: string;
    source: string;
    note?: string;
    annualRange?: { min: number; max: number; credits: number };
  } | null;
  english: {
    ielts: number | null;
    toefl: number | null;
    detail: string;
    source: string;
  };
  deadline: {
    date: string;
    label: string;
    intake: string;
    source: string;
  } | null;
  admissionNote: string;
  scholarshipNote: string;
  specialRequirement?: string;
  programUrl: string;
  admissionUrl: string;
  costUrl?: string;
  checkedOn: string;
  isActive: boolean;
  accent: 'plum' | 'sand' | 'sage';
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    universityId:      { type: Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    legacyId:          { type: String, index: true, sparse: true },
    title:             { type: String, required: true },
    degree:            { type: String, enum: ['bachelor','master','phd','foundation'], required: true },
    field:             { type: String, required: true, index: true },
    subfield:          { type: String },
    language:          { type: String, required: true, default: 'English' },
    durationYears:     { type: Number, required: true },
    tuition:           { type: Schema.Types.Mixed, default: null },
    english:           { type: Schema.Types.Mixed, required: true },
    deadline:          { type: Schema.Types.Mixed, default: null },
    admissionNote:     { type: String, required: true },
    scholarshipNote:   { type: String, required: true },
    specialRequirement:{ type: String },
    programUrl:        { type: String, required: true },
    admissionUrl:      { type: String, required: true },
    costUrl:           { type: String },
    checkedOn:         { type: String, required: true },
    isActive:          { type: Boolean, default: true, index: true },
    accent:            { type: String, enum: ['plum','sand','sage'], default: 'plum' },
    coverImage:        { type: String },
  },
  { timestamps: true }
);

// Compound index for fast filtering
ProgramSchema.index({ field: 1, isActive: 1 });
ProgramSchema.index({ universityId: 1, isActive: 1 });

export const Program: Model<IProgram> =
  mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);
