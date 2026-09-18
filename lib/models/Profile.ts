import mongoose, { Schema, Types, type Document, type Model } from 'mongoose';

// User's admission profile — all wizard answers
export interface IProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  age: number;
  grade: string;
  residence: string;
  citizenship: string;
  schoolQualification: string;
  interest: string;
  customInterest: string;
  alternatives: string[];
  country: string;
  countries: string[];
  budget: number;
  aid: string;
  priorities: Record<string, number>;
  english: string;
  englishExam: string;
  englishLevel: string;
  toefl: number;
  sat: number;
  satWilling: string;
  year: string;
  grades: string;
  gpa: number;
  gpaScale: number;
  subjects: string[];
  readiness: string;
  savedProgramIds: string[];
  selectedProgramId: string;
  completedTaskIds: string[];
  hasProfile: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId:              { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:                { type: String, default: '' },
    age:                 { type: Number, default: 17 },
    grade:               { type: String, default: '11 класс' },
    residence:           { type: String, default: 'Казахстан' },
    citizenship:         { type: String, default: 'Казахстан' },
    schoolQualification: { type: String, default: 'Обычный аттестат' },
    interest:            { type: String, default: 'Технологии' },
    customInterest:      { type: String, default: '' },
    alternatives:        { type: [String], default: [] },
    country:             { type: String, default: 'Любая' },
    countries:           { type: [String], default: [] },
    budget:              { type: Number, default: 12000 },
    aid:                 { type: String, default: 'Желательно' },
    priorities:          { type: Schema.Types.Mixed, default: { scholarship: 2, ranking: 1, cost: 2, location: 1, career: 1 } },
    english:             { type: String, default: '0' },
    englishExam:         { type: String, default: 'Не сдавал' },
    englishLevel:        { type: String, default: 'Не знаю' },
    toefl:               { type: Number, default: 0 },
    sat:                 { type: Number, default: 0 },
    satWilling:          { type: String, default: 'Не знаю' },
    year:                { type: String, default: '2027' },
    grades:              { type: String, default: '4–5' },
    gpa:                 { type: Number, default: 4.5 },
    gpaScale:            { type: Number, default: 5 },
    subjects:            { type: [String], default: [] },
    readiness:           { type: String, default: 'Изучаю варианты' },
    savedProgramIds:     { type: [String], default: [] },
    selectedProgramId:   { type: String, default: '' },
    completedTaskIds:    { type: [String], default: [] },
    hasProfile:          { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
